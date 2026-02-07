from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.sql import func
from ..database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    firebase_uid = Column(String, unique=True, index=True, nullable=True)  # Firebase UID
    full_name = Column(String)
    
    # Study profile
    subjects = Column(Text)  # JSON string of subjects
    strengths = Column(Text)  # JSON string of strong areas
    weaknesses = Column(Text)  # JSON string of weak areas
    study_patterns = Column(Text)  # JSON string of patterns
    
    # Settings
    is_active = Column(Boolean, default=True)
    dark_mode = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
