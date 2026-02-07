from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
from ..database import Base


class LocationLog(Base):
    __tablename__ = "location_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Location info
    location_name = Column(String, nullable=False)  # home, library, cafe, etc.
    location_type = Column(String)
    
    # Study info
    subject = Column(String)
    duration = Column(Float)  # in minutes
    productivity_rating = Column(Integer)  # 1-5 scale
    
    # Notes
    notes = Column(String)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    study_date = Column(DateTime(timezone=True), server_default=func.now())
