from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=72, description="Password must be between 6 and 72 characters")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfile(BaseModel):
    subjects: Optional[List[str]] = []
    strengths: Optional[List[str]] = []
    weaknesses: Optional[List[str]] = []
    study_patterns: Optional[List[str]] = []


class UserResponse(UserBase):
    id: int
    is_active: bool
    dark_mode: bool
    created_at: datetime
    
    class Config:
        orm_mode = True


class UserWithProfile(UserResponse):
    subjects: Optional[List[str]] = []
    strengths: Optional[List[str]] = []
    weaknesses: Optional[List[str]] = []
    study_patterns: Optional[List[str]] = []


# Token schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
