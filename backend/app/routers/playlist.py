import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.user import User
from ..schemas.feature_schemas import PlaylistCreate, PlaylistResponse
from ..services.playlist_service import PlaylistService
from ..utils.dependencies import get_current_user

router = APIRouter(prefix="/api/playlist", tags=["Playlist Generator"])


@router.post("/generate", response_model=PlaylistResponse)
def generate_playlist(
    playlist_data: PlaylistCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate AI-powered study playlist"""
    playlist = PlaylistService.generate_playlist(
        db,
        current_user.id,
        playlist_data.subject,
        playlist_data.time_of_day,
        playlist_data.mood
    )
    return playlist


@router.get("/my-playlists", response_model=List[PlaylistResponse])
def get_my_playlists(
    favorites_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's playlists"""
    playlists = PlaylistService.get_user_playlists(db, current_user.id, favorites_only)
    return playlists


@router.get("/{playlist_id}")
def get_playlist_details(
    playlist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get playlist with track details"""
    from ..models.playlist import Playlist
    
    playlist = db.query(Playlist).filter(
        Playlist.id == playlist_id,
        Playlist.user_id == current_user.id
    ).first()
    
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    return {
        **playlist.__dict__,
        "tracks": json.loads(playlist.tracks) if playlist.tracks else []
    }


@router.put("/{playlist_id}/favorite")
def toggle_favorite(
    playlist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle playlist favorite status"""
    try:
        playlist = PlaylistService.toggle_favorite(db, current_user.id, playlist_id)
        return {"is_favorite": playlist.is_favorite}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
