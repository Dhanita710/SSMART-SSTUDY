import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.user import User
from ..schemas.feature_schemas import LocationLogCreate, LocationLogResponse
from ..services.location_service import LocationService

router = APIRouter(prefix="/api/location", tags=["Location Tracker"])


# Helper function to get or create a demo user
def get_demo_user(db: Session) -> User:
    """Get or create a demo user for testing"""
    demo_user = db.query(User).filter(User.email == "demo@smartstudy.com").first()
    if not demo_user:
        demo_user = User(
            email="demo@smartstudy.com",
            username="demo_user",
            full_name="Demo Student",
            hashed_password="demo",
            subjects=json.dumps(["Mathematics", "Physics", "Computer Science"]),
            strengths=json.dumps(["Problem Solving", "Programming"]),
            weaknesses=json.dumps(["Chemistry", "Biology"]),
            study_patterns=json.dumps(["Morning study", "Group learning"]),
            is_active=True
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
    return demo_user


@router.post("/log", response_model=LocationLogResponse)
def log_study_location(
    log_data: LocationLogCreate,
    db: Session = Depends(get_db)
):
    """Log a study session at a location (no auth required for demo)"""
    # Use demo user
    current_user = get_demo_user(db)
    
    log = LocationService.log_location(
        db,
        current_user.id,
        log_data.location_name,
        log_data.subject,
        log_data.duration,
        log_data.productivity_rating,
        log_data.location_type,
        log_data.notes
    )
    return log


@router.get("/analytics")
def get_location_analytics(
    db: Session = Depends(get_db)
):
    """Get analytics for study locations (no auth required for demo)"""
    # Use demo user
    current_user = get_demo_user(db)
    
    analytics = LocationService.get_location_analytics(db, current_user.id)
    return analytics


@router.get("/recommendations")
def get_location_recommendations(
    subject: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get location recommendations (no auth required for demo)"""
    # Use demo user
    current_user = get_demo_user(db)
    
    recommendations = LocationService.get_recommendations(db, current_user.id, subject)
    return {"recommendations": recommendations}


@router.get("/logs", response_model=List[LocationLogResponse])
def get_location_logs(
    db: Session = Depends(get_db)
):
    """Get all location logs (no auth required for demo)"""
    from ..models.location_log import LocationLog
    
    # Use demo user
    current_user = get_demo_user(db)
    
    logs = db.query(LocationLog).filter(
        LocationLog.user_id == current_user.id
    ).order_by(LocationLog.created_at.desc()).all()
    
    return logs
