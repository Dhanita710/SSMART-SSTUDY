from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey
from sqlalchemy.sql import func
from ..database import Base


class Resource(Base):
    """Model for study resources uploaded by users"""
    __tablename__ = "resources"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Basic info
    title = Column(String, nullable=False)
    description = Column(Text)
    subject = Column(String, nullable=False)  # e.g., "Data Structures", "Operating Systems"
    category = Column(String)  # e.g., "Class Notes", "Assignments", "Summaries"
    
    # Resource metadata
    total_units = Column(Integer, default=0)
    thumbnail_url = Column(String)  # Path to thumbnail image
    
    # Stats
    total_downloads = Column(Integer, default=0)
    average_rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    
    # Moderation
    is_approved = Column(Boolean, default=True)  # Set to False for manual moderation
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
