import json
from typing import List, Dict
from sqlalchemy.orm import Session
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from groq import Groq
from ..models.user import User
from ..models.buddy_match import BuddyMatch
from ..config import settings

# Initialize models
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
groq_client = Groq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None


class BuddyMatchingService:
    @staticmethod
    def create_user_profile_embedding(user: User) -> np.ndarray:
        """Create embedding from user's study profile"""
        subjects = json.loads(user.subjects) if user.subjects else []
        strengths = json.loads(user.strengths) if user.strengths else []
        weaknesses = json.loads(user.weaknesses) if user.weaknesses else []
        patterns = json.loads(user.study_patterns) if user.study_patterns else []
        
        # Create text representation
        profile_text = f"""
        Subjects: {', '.join(subjects)}
        Strengths: {', '.join(strengths)}
        Weaknesses: {', '.join(weaknesses)}
        Study patterns: {', '.join(patterns)}
        """
        
        # Generate embedding
        embedding = embedding_model.encode(profile_text)
        return embedding
    
    @staticmethod
    def find_compatible_matches(db: Session, user_id: int, limit: int = 5) -> List[BuddyMatch]:
        """Find compatible study buddies for a user"""
        # Get current user
        current_user = db.query(User).filter(User.id == user_id).first()
        if not current_user:
            return []
        
        # Get all other users with profiles
        other_users = db.query(User).filter(
            User.id != user_id,
            User.subjects.isnot(None)
        ).all()
        
        if not other_users:
            return []
        
        # Create embeddings
        current_embedding = BuddyMatchingService.create_user_profile_embedding(current_user)
        
        matches = []
        for other_user in other_users:
            # Check if match already exists
            existing_match = db.query(BuddyMatch).filter(
                ((BuddyMatch.user_id == user_id) & (BuddyMatch.matched_user_id == other_user.id)) |
                ((BuddyMatch.user_id == other_user.id) & (BuddyMatch.matched_user_id == user_id))
            ).first()
            
            if existing_match:
                continue
            
            other_embedding = BuddyMatchingService.create_user_profile_embedding(other_user)
            
            # Calculate similarity
            similarity = cosine_similarity(
                current_embedding.reshape(1, -1),
                other_embedding.reshape(1, -1)
            )[0][0]
            
            # Find shared subjects and complementary areas
            current_subjects = set(json.loads(current_user.subjects) if current_user.subjects else [])
            other_subjects = set(json.loads(other_user.subjects) if other_user.subjects else [])
            shared_subjects = list(current_subjects & other_subjects)
            
            current_weaknesses = set(json.loads(current_user.weaknesses) if current_user.weaknesses else [])
            other_strengths = set(json.loads(other_user.strengths) if other_user.strengths else [])
            complementary = list(current_weaknesses & other_strengths)
            
            if similarity > 0.3:  # Threshold for compatibility
                # Generate explanation using GPT
                explanation = BuddyMatchingService.generate_match_explanation(
                    current_user, other_user, similarity, shared_subjects, complementary
                )
                
                match = BuddyMatch(
                    user_id=user_id,
                    matched_user_id=other_user.id,
                    compatibility_score=float(similarity),
                    match_explanation=explanation,
                    shared_subjects=json.dumps(shared_subjects),
                    complementary_areas=json.dumps(complementary),
                    status="pending"
                )
                matches.append((similarity, match))
        
        # Sort by similarity and take top matches
        matches.sort(key=lambda x: x[0], reverse=True)
        top_matches = [match for _, match in matches[:limit]]
        
        # Save to database
        for match in top_matches:
            db.add(match)
        db.commit()
        
        return top_matches
    
    @staticmethod
    def generate_match_explanation(
        user1: User, user2: User, score: float, 
        shared_subjects: List[str], complementary: List[str]
    ) -> str:
        """Generate AI explanation for why users are matched"""
        try:
            if not groq_client:
                return f"You both study {', '.join(shared_subjects[:2]) if shared_subjects else 'similar subjects'} and have complementary strengths that could help each other succeed!"
            
            prompt = f"""Generate a friendly, concise explanation (2-3 sentences) for why these two students would make good study buddies:

Student 1: Studies {json.loads(user1.subjects) if user1.subjects else []}, 
strong in {json.loads(user1.strengths) if user1.strengths else []}, 
needs help with {json.loads(user1.weaknesses) if user1.weaknesses else []}

Student 2: Studies {json.loads(user2.subjects) if user2.subjects else []}, 
strong in {json.loads(user2.strengths) if user2.strengths else []}, 
needs help with {json.loads(user2.weaknesses) if user2.weaknesses else []}

Shared subjects: {shared_subjects}
Complementary strengths: {complementary}
Compatibility score: {score:.2f}
"""
            
            response = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": "You are a helpful study buddy matching assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error generating explanation: {e}")
            return f"You both study {', '.join(shared_subjects[:2]) if shared_subjects else 'similar subjects'} and have complementary strengths that could help each other succeed!"
