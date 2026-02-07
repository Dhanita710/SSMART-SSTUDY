import os
import json
from datetime import datetime
from typing import List, Dict
from sqlalchemy.orm import Session
from groq import Groq
from ..models.voice_note import VoiceNote
from ..config import settings

groq_client = Groq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None

UPLOAD_DIR = "uploads/voice_notes"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class VoiceNoteService:
    @staticmethod
    async def transcribe_audio(file_path: str) -> str:
        """Transcribe audio file using Groq Whisper"""
        try:
            if not groq_client:
                return "Transcription unavailable - API key not configured"
            
            with open(file_path, "rb") as audio_file:
                transcript = groq_client.audio.transcriptions.create(
                    model="whisper-large-v3",
                    file=audio_file,
                    response_format="text"
                )
            return transcript
        except Exception as e:
            print(f"Transcription error: {e}")
            return f"Transcription failed: {str(e)}"
    
    @staticmethod
    def generate_summary(transcription: str) -> Dict[str, any]:
        """Generate summary and key points from transcription using Groq"""
        try:
            if not groq_client:
                return {
                    "summary": "AI summarization unavailable - API key not configured",
                    "key_points": []
                }
            
            prompt = f"""Analyze this study note transcription and provide:
1. A concise summary (2-3 sentences)
2. Key points (bullet list, 3-5 main points)

Transcription:
{transcription}

Format your response as JSON:
{{
    "summary": "...",
    "key_points": ["point 1", "point 2", ...]
}}
"""
            
            response = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": "You are a helpful study assistant that summarizes lecture notes. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.5
            )
            
            content = response.choices[0].message.content.strip()
            # Extract JSON from response
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            result = json.loads(content)
            return result
        except Exception as e:
            print(f"Summary generation error: {e}")
            return {
                "summary": f"Summary generation failed: {str(e)}",
                "key_points": []
            }
    
    @staticmethod
    async def process_voice_note(
        db: Session, 
        user_id: int, 
        file_path: str, 
        filename: str,
        subject: str = None,
        tags: List[str] = None
    ) -> VoiceNote:
        """Process uploaded voice note: transcribe and summarize"""
        # Create database entry
        voice_note = VoiceNote(
            user_id=user_id,
            filename=filename,
            file_path=file_path,
            subject=subject,
            tags=json.dumps(tags or [])
        )
        db.add(voice_note)
        db.commit()
        
        try:
            # Transcribe
            transcription = await VoiceNoteService.transcribe_audio(file_path)
            voice_note.transcription = transcription
            
            # Generate summary
            summary_data = VoiceNoteService.generate_summary(transcription)
            voice_note.summary = summary_data.get("summary", "")
            voice_note.key_points = json.dumps(summary_data.get("key_points", []))
            voice_note.processed_at = datetime.utcnow()
            
            db.commit()
            db.refresh(voice_note)
        except Exception as e:
            print(f"Processing error: {e}")
            voice_note.summary = f"Processing error: {str(e)}"
            db.commit()
        
        return voice_note
    
    @staticmethod
    def search_voice_notes(
        db: Session, 
        user_id: int, 
        query: str = None,
        subject: str = None
    ) -> List[VoiceNote]:
        """Search voice notes by query or subject"""
        notes_query = db.query(VoiceNote).filter(VoiceNote.user_id == user_id)
        
        if subject:
            notes_query = notes_query.filter(VoiceNote.subject == subject)
        
        if query:
            notes_query = notes_query.filter(
                (VoiceNote.transcription.contains(query)) |
                (VoiceNote.summary.contains(query))
            )
        
        return notes_query.order_by(VoiceNote.created_at.desc()).all()
