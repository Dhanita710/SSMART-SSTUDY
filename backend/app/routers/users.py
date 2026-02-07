import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..schemas.user_schema import UserResponse, UserWithProfile, UserProfile
from ..utils.dependencies import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me", response_model=UserWithProfile)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile"""
    return {
        **current_user.__dict__,
        "subjects": json.loads(current_user.subjects) if current_user.subjects else [],
        "strengths": json.loads(current_user.strengths) if current_user.strengths else [],
        "weaknesses": json.loads(current_user.weaknesses) if current_user.weaknesses else [],
        "study_patterns": json.loads(current_user.study_patterns) if current_user.study_patterns else []
    }


@router.put("/profile", response_model=UserWithProfile)
def update_profile(
    profile: UserProfile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's study profile"""
    current_user.subjects = json.dumps(profile.subjects)
    current_user.strengths = json.dumps(profile.strengths)
    current_user.weaknesses = json.dumps(profile.weaknesses)
    current_user.study_patterns = json.dumps(profile.study_patterns)
    
    db.commit()
    db.refresh(current_user)
    
    return {
        **current_user.__dict__,
        "subjects": profile.subjects,
        "strengths": profile.strengths,
        "weaknesses": profile.weaknesses,
        "study_patterns": profile.study_patterns
    }


@router.put("/settings/dark-mode")
def toggle_dark_mode(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle dark mode setting"""
    current_user.dark_mode = not current_user.dark_mode
    db.commit()
    
    return {"dark_mode": current_user.dark_mode}
