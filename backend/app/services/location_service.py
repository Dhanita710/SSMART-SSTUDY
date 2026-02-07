from typing import List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.location_log import LocationLog
from collections import defaultdict


class LocationService:
    @staticmethod
    def log_location(
        db: Session,
        user_id: int,
        location_name: str,
        subject: str,
        duration: float,
        productivity_rating: int,
        location_type: str = None,
        notes: str = None
    ) -> LocationLog:
        """Log a study session at a location"""
        log = LocationLog(
            user_id=user_id,
            location_name=location_name,
            location_type=location_type,
            subject=subject,
            duration=duration,
            productivity_rating=productivity_rating,
            notes=notes
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log
    
    @staticmethod
    def get_location_analytics(db: Session, user_id: int) -> Dict:
        """Get analytics for user's study locations"""
        logs = db.query(LocationLog).filter(LocationLog.user_id == user_id).all()
        
        if not logs:
            return {
                "total_sessions": 0,
                "total_hours": 0,
                "locations": [],
                "by_subject": {}
            }
        
        # Aggregate by location
        location_stats = defaultdict(lambda: {
            "sessions": 0,
            "total_duration": 0,
            "avg_productivity": 0,
            "productivity_sum": 0
        })
        
        # Aggregate by subject
        subject_location_stats = defaultdict(lambda: defaultdict(lambda: {
            "sessions": 0,
            "avg_productivity": 0,
            "productivity_sum": 0
        }))
        
        total_duration = 0
        
        for log in logs:
            # Location stats
            location_stats[log.location_name]["sessions"] += 1
            location_stats[log.location_name]["total_duration"] += log.duration
            location_stats[log.location_name]["productivity_sum"] += log.productivity_rating
            
            # Subject-location stats
            if log.subject:
                subject_location_stats[log.subject][log.location_name]["sessions"] += 1
                subject_location_stats[log.subject][log.location_name]["productivity_sum"] += log.productivity_rating
            
            total_duration += log.duration
        
        # Calculate averages
        locations = []
        for loc_name, stats in location_stats.items():
            avg_productivity = stats["productivity_sum"] / stats["sessions"]
            locations.append({
                "name": loc_name,
                "sessions": stats["sessions"],
                "total_hours": round(stats["total_duration"] / 60, 2),
                "avg_productivity": round(avg_productivity, 2)
            })
        
        # Sort by sessions
        locations.sort(key=lambda x: x["sessions"], reverse=True)
        
        # Subject recommendations
        by_subject = {}
        for subject, loc_stats in subject_location_stats.items():
            best_location = None
            best_productivity = 0
            
            for loc_name, stats in loc_stats.items():
                avg_prod = stats["productivity_sum"] / stats["sessions"]
                if avg_prod > best_productivity:
                    best_productivity = avg_prod
                    best_location = loc_name
            
            by_subject[subject] = {
                "best_location": best_location,
                "avg_productivity": round(best_productivity, 2)
            }
        
        return {
            "total_sessions": len(logs),
            "total_hours": round(total_duration / 60, 2),
            "locations": locations,
            "by_subject": by_subject
        }
    
    @staticmethod
    def get_recommendations(db: Session, user_id: int, subject: str = None) -> List[Dict]:
        """Get location recommendations based on historical data"""
        analytics = LocationService.get_location_analytics(db, user_id)
        
        recommendations = []
        
        if subject and subject in analytics["by_subject"]:
            # Subject-specific recommendation
            best_loc = analytics["by_subject"][subject]
            recommendations.append({
                "location": best_loc["best_location"],
                "reason": f"Best productivity for {subject}",
                "avg_productivity": best_loc["avg_productivity"]
            })
        
        # General recommendations
        for loc in analytics["locations"][:3]:
            if loc["avg_productivity"] >= 4:
                recommendations.append({
                    "location": loc["name"],
                    "reason": f"High productivity ({loc['avg_productivity']}/5)",
                    "sessions": loc["sessions"]
                })
        
        return recommendations
