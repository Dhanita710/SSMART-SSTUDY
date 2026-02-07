from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.sql import func
from ..database import Base


class BuddyMatch(Base):
    __tablename__ = "buddy_matches"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    matched_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Match info
    compatibility_score = Column(Float)  # 0-1
    match_explanation = Column(Text)
    status = Column(String, default="pending")  # pending, accepted, declined
    
    # Shared subjects
    shared_subjects = Column(Text)  # JSON string
    complementary_areas = Column(Text)  # JSON string
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class StudyGroup(Base):
    __tablename__ = "study_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    subject = Column(String)
    member_ids = Column(Text)  # JSON string of user IDs
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
