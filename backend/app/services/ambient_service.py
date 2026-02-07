from datetime import datetime, timedelta
from typing import List, Dict
from sqlalchemy.orm import Session
from ..models.study_session import StudySession, UserStreak


class AmbientService:
    # In-memory storage for active sessions (in production, use Redis)
    active_sessions: Dict[int, Dict] = {}
    
    @staticmethod
    def start_session(db: Session, user_id: int, room_type: str, focus_duration: int = 25) -> StudySession:
        """Start a new study session"""
        session = StudySession(
            user_id=user_id,
            room_type=room_type,
            focus_timer_duration=focus_duration,
            is_active=True
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        
        # Add to active sessions
        AmbientService.active_sessions[user_id] = {
            "session_id": session.id,
            "room_type": room_type,
            "joined_at": datetime.utcnow()
        }
        
        return session
    
    @staticmethod
    def end_session(db: Session, user_id: int, session_id: int) -> StudySession:
        """End a study session and update streak"""
        session = db.query(StudySession).filter(
            StudySession.id == session_id,
            StudySession.user_id == user_id
        ).first()
        
        if not session:
            raise ValueError("Session not found")
        
        # Calculate duration
        duration = (datetime.utcnow() - session.started_at).total_seconds() / 60
        session.duration = duration
        session.ended_at = datetime.utcnow()
        session.is_active = False
        
        # Update streak
        AmbientService.update_streak(db, user_id, duration)
        
        # Remove from active sessions
        if user_id in AmbientService.active_sessions:
            del AmbientService.active_sessions[user_id]
        
        db.commit()
        db.refresh(session)
        return session
    
    @staticmethod
    def update_streak(db: Session, user_id: int, study_duration: float):
        """Update user's study streak"""
        streak = db.query(UserStreak).filter(UserStreak.user_id == user_id).first()
        
        if not streak:
            streak = UserStreak(user_id=user_id)
            db.add(streak)
        
        today = datetime.utcnow().date()
        
        if streak.last_study_date:
            last_date = streak.last_study_date.date()
            days_diff = (today - last_date).days
            
            if days_diff == 0:
                # Same day, just add time
                pass
            elif days_diff == 1:
                # Consecutive day, increment streak
                streak.current_streak += 1
            else:
                # Streak broken
                streak.current_streak = 1
        else:
            # First study session
            streak.current_streak = 1
        
        # Update longest streak
        if streak.current_streak > streak.longest_streak:
            streak.longest_streak = streak.current_streak
        
        # Update total time
        streak.total_study_time = (streak.total_study_time or 0) + (study_duration / 60)
        streak.last_study_date = datetime.utcnow()
        
        db.commit()
    
    @staticmethod
    def get_active_users_in_room(room_type: str) -> List[Dict]:
        """Get anonymous ghost avatars of users in a room"""
        users_in_room = []
        for user_id, session_data in AmbientService.active_sessions.items():
            if session_data["room_type"] == room_type:
                users_in_room.append({
                    "avatar_id": f"ghost_{user_id % 100}",  # Anonymous ID
                    "duration": (datetime.utcnow() - session_data["joined_at"]).total_seconds() / 60
                })
        return users_in_room
    
    @staticmethod
    def get_user_streak(db: Session, user_id: int) -> Dict:
        """Get user's streak information"""
        streak = db.query(UserStreak).filter(UserStreak.user_id == user_id).first()
        
        if not streak:
            return {
                "current_streak": 0,
                "longest_streak": 0,
                "total_study_time": 0
            }
        
        return {
            "current_streak": streak.current_streak,
            "longest_streak": streak.longest_streak,
            "total_study_time": round(streak.total_study_time, 2)
        }
