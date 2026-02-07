from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.user import User
from ..schemas.feature_schemas import BuddyMatchResponse
from ..services.buddy_matching_service import BuddyMatchingService
from ..models.buddy_match import BuddyMatch
import json

router = APIRouter(prefix="/api/buddy", tags=["Study Buddy"])


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


@router.post("/find-matches", response_model=List[BuddyMatchResponse])
def find_study_buddies(db: Session = Depends(get_db)):
    """Find compatible study buddies (no auth required for demo)"""
    # Use demo user
    current_user = get_demo_user(db)
    
    matches = BuddyMatchingService.find_compatible_matches(db, current_user.id)
    
    result = []
    for match in matches:
        result.append({
            **match.__dict__,
            "shared_subjects": json.loads(match.shared_subjects) if match.shared_subjects else [],
            "complementary_areas": json.loads(match.complementary_areas) if match.complementary_areas else []
        })
    
    return result


@router.get("/matches", response_model=List[BuddyMatchResponse])
def get_my_matches(db: Session = Depends(get_db)):
    """Get all my study buddy matches (no auth required for demo)"""
    # Use demo user
    current_user = get_demo_user(db)
    
    matches = db.query(BuddyMatch).filter(
        BuddyMatch.user_id == current_user.id
    ).all()
    
    result = []
    for match in matches:
        result.append({
            **match.__dict__,
            "shared_subjects": json.loads(match.shared_subjects) if match.shared_subjects else [],
            "complementary_areas": json.loads(match.complementary_areas) if match.complementary_areas else []
        })
    
    return result


@router.put("/matches/{match_id}/accept")
def accept_match(match_id: int, db: Session = Depends(get_db)):
    """Accept a study buddy match (no auth required for demo)"""
    # Use demo user
    current_user = get_demo_user(db)
    
    match = db.query(BuddyMatch).filter(
        BuddyMatch.id == match_id,
        BuddyMatch.user_id == current_user.id
    ).first()
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    match.status = "accepted"
    db.commit()
    
    return {"message": "Match accepted", "status": "accepted"}


@router.put("/matches/{match_id}/decline")
def decline_match(match_id: int, db: Session = Depends(get_db)):
    """Decline a study buddy match (no auth required for demo)"""
    # Use demo user
    current_user = get_demo_user(db)
    
    match = db.query(BuddyMatch).filter(
        BuddyMatch.id == match_id,
        BuddyMatch.user_id == current_user.id
    ).first()
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    match.status = "declined"
    db.commit()
    
    return {"message": "Match declined", "status": "declined"}
