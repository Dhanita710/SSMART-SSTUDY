from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..schemas.feature_schemas import StudySessionCreate, StudySessionResponse
from ..services.ambient_service import AmbientService
from ..utils.dependencies import get_current_user

router = APIRouter(prefix="/api/ambient", tags=["Ambient Study"])


@router.post("/start", response_model=StudySessionResponse)
def start_study_session(
    session_data: StudySessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new ambient study session"""
    session = AmbientService.start_session(
        db, current_user.id, session_data.room_type, session_data.focus_timer_duration
    )
    return session


@router.post("/end/{session_id}", response_model=StudySessionResponse)
def end_study_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """End an active study session"""
    try:
        session = AmbientService.end_session(db, current_user.id, session_id)
        return session
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/rooms/{room_type}/users")
def get_room_users(room_type: str):
    """Get anonymous ghost avatars in a room"""
    users = AmbientService.get_active_users_in_room(room_type)
    return {"room_type": room_type, "active_users": len(users), "users": users}


@router.get("/streak")
def get_user_streak(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's study streak"""
    streak = AmbientService.get_user_streak(db, current_user.id)
    return streak


@router.get("/sessions")
def get_user_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's study sessions"""
    from ..models.study_session import StudySession
    
    sessions = db.query(StudySession).filter(
        StudySession.user_id == current_user.id
    ).order_by(StudySession.started_at.desc()).limit(20).all()
    
    return sessions
