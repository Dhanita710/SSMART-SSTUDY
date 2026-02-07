from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.user_schema import UserCreate, UserLogin, Token, UserResponse
from ..services.auth_service import AuthService
from ..models.user import User
from pydantic import BaseModel
import json

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class FirebaseSignupRequest(BaseModel):
    uid: str
    email: str
    full_name: str


@router.post("/firebase-signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def firebase_signup(
    data: FirebaseSignupRequest,
    db: Session = Depends(get_db),
    authorization: str = Header(None)
):
    """Create or update user from Firebase authentication"""
    # Check if user already exists
    user = db.query(User).filter(User.email == data.email).first()
    
    if user:
        # Update existing user
        user.firebase_uid = data.uid
        user.full_name = data.full_name
        db.commit()
        db.refresh(user)
        return user
    
    # Create new user
    new_user = User(
        email=data.email,
        username=data.email.split('@')[0],  # Use email prefix as username
        full_name=data.full_name,
        firebase_uid=data.uid,
        hashed_password="firebase_auth",  # Not used for Firebase users
        subjects=json.dumps([]),
        strengths=json.dumps([]),
        weaknesses=json.dumps([]),
        study_patterns=json.dumps([]),
        is_active=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        user = AuthService.register_user(db, user_data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login and receive JWT tokens"""
    user = AuthService.authenticate_user(db, credentials.email, credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    tokens = AuthService.create_tokens(user.id)
    return tokens


@router.post("/refresh", response_model=Token)
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    payload = AuthService.verify_token(refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = int(payload.get("sub"))
    tokens = AuthService.create_tokens(user_id)
    return tokens


@router.post("/logout")
def logout():
    """Logout (client should delete tokens)"""
    return {"message": "Logged out successfully"}
