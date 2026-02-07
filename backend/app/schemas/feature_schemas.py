from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class VoiceNoteCreate(BaseModel):
    subject: Optional[str] = None
    tags: Optional[List[str]] = []


class VoiceNoteResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    duration: Optional[float]
    transcription: Optional[str]
    summary: Optional[str]
    key_points: Optional[List[str]]
    subject: Optional[str]
    tags: Optional[List[str]]
    created_at: datetime
    processed_at: Optional[datetime]
    
    class Config:
        orm_mode = True


class StudySessionCreate(BaseModel):
    room_type: str
    focus_timer_duration: Optional[int] = 25


class StudySessionResponse(BaseModel):
    id: int
    user_id: int
    room_type: str
    duration: Optional[float]
    is_active: bool
    focus_timer_duration: Optional[int]
    breaks_taken: int
    started_at: datetime
    ended_at: Optional[datetime]
    
    class Config:
        orm_mode = True


class LocationLogCreate(BaseModel):
    location_name: str
    location_type: Optional[str] = None
    subject: Optional[str] = None
    duration: float
    productivity_rating: int
    notes: Optional[str] = None


class LocationLogResponse(BaseModel):
    id: int
    user_id: int
    location_name: str
    location_type: Optional[str]
    subject: Optional[str]
    duration: float
    productivity_rating: int
    notes: Optional[str]
    created_at: datetime
    study_date: datetime
    
    class Config:
        orm_mode = True


class PlaylistCreate(BaseModel):
    subject: Optional[str] = None
    time_of_day: Optional[str] = None
    mood: Optional[str] = None


class PlaylistResponse(BaseModel):
    id: int
    user_id: int
    name: str
    subject: Optional[str]
    time_of_day: Optional[str]
    mood: Optional[str]
    spotify_url: Optional[str]
    is_favorite: int
    play_count: int
    created_at: datetime
    
    class Config:
        orm_mode = True


class BuddyMatchResponse(BaseModel):
    id: int
    user_id: int
    matched_user_id: int
    compatibility_score: float
    match_explanation: str
    status: str
    shared_subjects: Optional[List[str]]
    complementary_areas: Optional[List[str]]
    created_at: datetime
    
    class Config:
        orm_mode = True
