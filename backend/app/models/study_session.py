from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Boolean
from sqlalchemy.sql import func
from ..database import Base


class StudySession(Base):
    __tablename__ = "study_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Session info
    room_type = Column(String)  # library, cafe, rain, etc.
    duration = Column(Float)  # in minutes
    is_active = Column(Boolean, default=True)
    
    # Focus tracking
    focus_timer_duration = Column(Integer)  # in minutes
    breaks_taken = Column(Integer, default=0)
    
    # Timestamps
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True))


class UserStreak(Base):
    __tablename__ = "user_streaks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_study_date = Column(DateTime(timezone=True))
    total_study_time = Column(Float, default=0)  # in hours
