import json
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from openai import OpenAI
from ..models.playlist import Playlist
from ..config import settings

openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)


class PlaylistService:
    @staticmethod
    def get_spotify_client():
        """Initialize Spotify client"""
        if not settings.SPOTIFY_CLIENT_ID or not settings.SPOTIFY_CLIENT_SECRET:
            return None
        
        try:
            auth_manager = SpotifyClientCredentials(
                client_id=settings.SPOTIFY_CLIENT_ID,
                client_secret=settings.SPOTIFY_CLIENT_SECRET
            )
            return spotipy.Spotify(auth_manager=auth_manager)
        except:
            return None
    
    @staticmethod
    def get_music_recommendations(subject: str, time_of_day: str, mood: str) -> Dict:
        """Get AI recommendations for music genre and tempo"""
        try:
            prompt = f"""
            Recommend music for studying based on:
            - Subject: {subject or 'general'}
            - Time of day: {time_of_day or 'any'}
            - Mood: {mood or 'focused'}
            
            Provide:
            1. Music genre (e.g., lo-fi, classical, ambient)
            2. Tempo preference (slow, medium, fast)
            3. 3-5 search keywords for finding study music
            
            Format as JSON:
            {{
                "genre": "...",
                "tempo": "...",
                "keywords": ["keyword1", "keyword2", ...]
            }}
            """
            
            response = openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a music recommendation assistant for students."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.7
            )
            
            content = response.choices[0].message.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            return json.loads(content)
        except:
            return {
                "genre": "lo-fi",
                "tempo": "medium",
                "keywords": ["study music", "focus", "concentration"]
            }
    
    @staticmethod
    def search_spotify_tracks(keywords: List[str], limit: int = 20) -> List[Dict]:
        """Search Spotify for tracks based on keywords"""
        spotify = PlaylistService.get_spotify_client()
        if not spotify:
            return []
        
        try:
            query = " ".join(keywords)
            results = spotify.search(q=query, type='track', limit=limit)
            
            tracks = []
            for item in results['tracks']['items']:
                tracks.append({
                    "name": item['name'],
                    "artist": item['artists'][0]['name'],
                    "uri": item['uri'],
                    "preview_url": item.get('preview_url'),
                    "external_url": item['external_urls']['spotify']
                })
            
            return tracks
        except:
            return []
    
    @staticmethod
    def generate_playlist(
        db: Session,
        user_id: int,
        subject: Optional[str] = None,
        time_of_day: Optional[str] = None,
        mood: Optional[str] = None
    ) -> Playlist:
        """Generate AI-powered study playlist"""
        # Get AI recommendations
        recommendations = PlaylistService.get_music_recommendations(subject, time_of_day, mood)
        
        # Search for tracks
        tracks = PlaylistService.search_spotify_tracks(recommendations["keywords"])
        
        # Generate playlist name
        playlist_name = f"{subject or 'Study'} - {recommendations['genre'].title()}"
        
        # Create playlist entry
        playlist = Playlist(
            user_id=user_id,
            name=playlist_name,
            subject=subject,
            time_of_day=time_of_day,
            mood=mood,
            tracks=json.dumps(tracks),
            spotify_url=tracks[0]["external_url"] if tracks else None
        )
        
        db.add(playlist)
        db.commit()
        db.refresh(playlist)
        
        return playlist
    
    @staticmethod
    def get_user_playlists(db: Session, user_id: int, favorites_only: bool = False) -> List[Playlist]:
        """Get user's playlists"""
        query = db.query(Playlist).filter(Playlist.user_id == user_id)
        
        if favorites_only:
            query = query.filter(Playlist.is_favorite == 1)
        
        return query.order_by(Playlist.created_at.desc()).all()
    
    @staticmethod
    def toggle_favorite(db: Session, user_id: int, playlist_id: int) -> Playlist:
        """Toggle playlist favorite status"""
        playlist = db.query(Playlist).filter(
            Playlist.id == playlist_id,
            Playlist.user_id == user_id
        ).first()
        
        if not playlist:
            raise ValueError("Playlist not found")
        
        playlist.is_favorite = 1 if playlist.is_favorite == 0 else 0
        db.commit()
        db.refresh(playlist)
        
        return playlist
