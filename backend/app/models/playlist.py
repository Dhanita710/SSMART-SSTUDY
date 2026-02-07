from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from ..database import Base


class Playlist(Base):
    __tablename__ = "playlists"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Playlist info
    name = Column(String, nullable=False)
    subject = Column(String)
    time_of_day = Column(String)
    mood = Column(String)
    
    # Spotify data
    spotify_playlist_id = Column(String)
    spotify_url = Column(String)
    tracks = Column(Text)  # JSON string of track info
    
    # Metadata
    is_favorite = Column(Integer, default=0)
    play_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
