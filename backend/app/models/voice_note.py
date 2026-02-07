from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.sql import func
from ..database import Base


class VoiceNote(Base):
    __tablename__ = "voice_notes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # File info
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    duration = Column(Float)  # in seconds
    
    # Processing results
    transcription = Column(Text)
    summary = Column(Text)
    key_points = Column(Text)  # JSON string
    
    # Metadata
    subject = Column(String)
    tags = Column(Text)  # JSON string
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True))
