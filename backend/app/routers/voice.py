import os
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.user import User
from ..schemas.feature_schemas import VoiceNoteResponse
from ..services.voice_note_service import VoiceNoteService

router = APIRouter(prefix="/api/voice", tags=["Voice Notes"])

UPLOAD_DIR = "uploads/voice_notes"
os.makedirs(UPLOAD_DIR, exist_ok=True)


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


# Helper function to serialize SQLAlchemy model to dict
def serialize_voice_note(note):
    """Convert SQLAlchemy model to JSON-serializable dict"""
    from datetime import datetime
    
    result = {}
    for key, value in note.__dict__.items():
        if key.startswith('_'):
            continue
        if isinstance(value, datetime):
            result[key] = value.isoformat()
        else:
            result[key] = value
    
    # Parse JSON fields
    if 'key_points' in result:
        result['key_points'] = json.loads(result['key_points']) if result['key_points'] else []
    if 'tags' in result:
        result['tags'] = json.loads(result['tags']) if result['tags'] else []
    
    return result


# CORS preflight handler
@router.options("/upload")
@router.options("/library")
async def options_handler():
    """Handle CORS preflight requests"""
    from fastapi.responses import Response
    return Response(
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )


@router.post("/upload")
async def upload_voice_note(
    file: UploadFile = File(...),
    subject: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Upload and process a voice note (no auth required for demo)"""
    from fastapi.responses import JSONResponse
    
    # Use demo user
    current_user = get_demo_user(db)
    
    # Validate file type
    allowed_extensions = ['.mp3', '.wav', '.m4a', '.ogg', '.webm']
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Save file
    file_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_{file.filename}")
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Parse tags
    tags_list = json.loads(tags) if tags else []
    
    # Process voice note
    voice_note = await VoiceNoteService.process_voice_note(
        db, current_user.id, file_path, file.filename, subject, tags_list
    )
    
    response_data = serialize_voice_note(voice_note)
    
    # Return response with explicit CORS headers
    return JSONResponse(
        content=response_data,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )


@router.get("/library")
def get_voice_notes(
    subject: Optional[str] = None,
    query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get user's voice note library with optional filtering (no auth required for demo)"""
    from fastapi.responses import JSONResponse
    
    # Use demo user
    current_user = get_demo_user(db)
    
    notes = VoiceNoteService.search_voice_notes(db, current_user.id, query, subject)
    
    result = [serialize_voice_note(note) for note in notes]
    
    return JSONResponse(
        content=result,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )


@router.get("/{note_id}", response_model=VoiceNoteResponse)
def get_voice_note(
    note_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific voice note (no auth required for demo)"""
    from ..models.voice_note import VoiceNote
    
    # Use demo user
    current_user = get_demo_user(db)
    
    note = db.query(VoiceNote).filter(
        VoiceNote.id == note_id,
        VoiceNote.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="Voice note not found")
    
    return {
        **note.__dict__,
        "key_points": json.loads(note.key_points) if note.key_points else [],
        "tags": json.loads(note.tags) if note.tags else []
    }
