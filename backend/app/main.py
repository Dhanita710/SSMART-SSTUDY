from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .config import settings
from .database import init_db
from .routers import auth, users, buddy, voice, ambient, location, playlist, marketplace
import os

# Create FastAPI app
app = FastAPI(
    title="Study Planner API",
    description="AI-Powered Student Study Platform",
    version="1.0.0"
)

# CORS middleware - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Create uploads directory
os.makedirs("uploads/voice_notes", exist_ok=True)
os.makedirs("uploads/resources", exist_ok=True)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(buddy.router)
app.include_router(voice.router)
app.include_router(ambient.router)
app.include_router(location.router)
app.include_router(playlist.router)
app.include_router(marketplace.router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()
    print("✅ Database initialized")
    print(f"📚 Study Planner API running on {settings.BACKEND_URL}")


@app.get("/")
def root():
    """API root endpoint"""
    return {
        "message": "Study Planner API",
        "version": "1.0.0",
        "docs": "/docs",
        "features": [
            "AI Study Buddy Matching",
            "Voice Note Summarizer",
            "Ambient Study Environments",
            "Study Location Tracker",
            "AI Playlist Generator"
        ]
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
