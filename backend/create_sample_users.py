"""
Script to create sample users for Study Buddy Matching feature
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app.models.user import User
import json

# Create tables
Base.metadata.create_all(bind=engine)

def create_sample_users():
    db = SessionLocal()
    
    sample_users = [
        {
            "email": "alice@smartstudy.com",
            "username": "alice_math",
            "full_name": "Alice Johnson",
            "subjects": ["Mathematics", "Physics", "Statistics"],
            "strengths": ["Calculus", "Linear Algebra", "Problem Solving"],
            "weaknesses": ["Chemistry", "Biology"],
            "study_patterns": ["Morning study", "Solo learning", "Practice problems"]
        },
        {
            "email": "bob@smartstudy.com",
            "username": "bob_cs",
            "full_name": "Bob Smith",
            "subjects": ["Computer Science", "Mathematics", "Data Science"],
            "strengths": ["Programming", "Algorithms", "Machine Learning"],
            "weaknesses": ["Physics", "Statistics"],
            "study_patterns": ["Night study", "Group projects", "Coding practice"]
        },
        {
            "email": "charlie@smartstudy.com",
            "username": "charlie_chem",
            "full_name": "Charlie Brown",
            "subjects": ["Chemistry", "Biology", "Physics"],
            "strengths": ["Organic Chemistry", "Lab Work", "Biology"],
            "weaknesses": ["Mathematics", "Programming"],
            "study_patterns": ["Afternoon study", "Visual learning", "Flashcards"]
        },
        {
            "email": "diana@smartstudy.com",
            "username": "diana_eng",
            "full_name": "Diana Lee",
            "subjects": ["Engineering", "Physics", "Mathematics"],
            "strengths": ["Physics", "CAD Design", "Problem Solving"],
            "weaknesses": ["Chemistry", "Biology"],
            "study_patterns": ["Morning study", "Hands-on learning", "Group study"]
        },
        {
            "email": "emma@smartstudy.com",
            "username": "emma_bio",
            "full_name": "Emma Wilson",
            "subjects": ["Biology", "Chemistry", "Statistics"],
            "strengths": ["Biology", "Research", "Data Analysis"],
            "weaknesses": ["Physics", "Calculus"],
            "study_patterns": ["Evening study", "Reading", "Note-taking"]
        },
        {
            "email": "frank@smartstudy.com",
            "username": "frank_stats",
            "full_name": "Frank Martinez",
            "subjects": ["Statistics", "Mathematics", "Data Science"],
            "strengths": ["Statistics", "R Programming", "Data Visualization"],
            "weaknesses": ["Chemistry", "Biology"],
            "study_patterns": ["Flexible schedule", "Online courses", "Practice datasets"]
        }
    ]
    
    created_count = 0
    for user_data in sample_users:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        if existing_user:
            print(f"User {user_data['email']} already exists, skipping...")
            continue
        
        user = User(
            email=user_data["email"],
            username=user_data["username"],
            full_name=user_data["full_name"],
            hashed_password="demo_password",  # Not used since we removed auth
            subjects=json.dumps(user_data["subjects"]),
            strengths=json.dumps(user_data["strengths"]),
            weaknesses=json.dumps(user_data["weaknesses"]),
            study_patterns=json.dumps(user_data["study_patterns"]),
            is_active=True
        )
        db.add(user)
        created_count += 1
    
    db.commit()
    print(f"\n✅ Created {created_count} sample users!")
    print(f"Total users in database: {db.query(User).count()}")
    
    db.close()

if __name__ == "__main__":
    create_sample_users()
