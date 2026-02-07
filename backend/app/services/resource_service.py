from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from decimal import Decimal
from ..models.resource import Resource
from ..models.resource_unit import ResourceUnit
from ..models.purchase import Purchase
from ..models.review import Review
from ..models.wallet import Wallet
from ..models.user import User


class ResourceService:
    """Service layer for resource marketplace operations"""
    
    # Platform commission rate (15%)
    PLATFORM_COMMISSION_RATE = Decimal("0.15")
    
    @staticmethod
    def create_resource(
        db: Session,
        user_id: int,
        title: str,
        description: str,
        subject: str,
        category: str = None
    ) -> Resource:
        """Create a new resource"""
        resource = Resource(
            user_id=user_id,
            title=title,
            description=description,
            subject=subject,
            category=category
        )
        db.add(resource)
        db.commit()
        db.refresh(resource)
        return resource
    
    @staticmethod
    def get_resource(db: Session, resource_id: int) -> Optional[Resource]:
        """Get a resource by ID"""
        return db.query(Resource).filter(
            Resource.id == resource_id,
            Resource.is_active == True
        ).first()
    
    @staticmethod
    def browse_resources(
        db: Session,
        subject: str = None,
        category: str = None,
        search: str = None,
        min_rating: float = None,
        sort_by: str = "recent",  # recent, popular, rating
        limit: int = 20,
        offset: int = 0
    ) -> List[Resource]:
        """Browse marketplace with filters"""
        query = db.query(Resource).filter(
            Resource.is_active == True,
            Resource.is_approved == True
        )
        
        # Apply filters
        if subject:
            query = query.filter(Resource.subject == subject)
        if category:
            query = query.filter(Resource.category == category)
        if search:
            query = query.filter(
                or_(
                    Resource.title.ilike(f"%{search}%"),
                    Resource.description.ilike(f"%{search}%")
                )
            )
        if min_rating:
            query = query.filter(Resource.average_rating >= min_rating)
        
        # Apply sorting
        if sort_by == "popular":
            query = query.order_by(Resource.total_downloads.desc())
        elif sort_by == "rating":
            query = query.order_by(Resource.average_rating.desc())
        else:  # recent
            query = query.order_by(Resource.created_at.desc())
        
        return query.limit(limit).offset(offset).all()
    
    @staticmethod
    def add_unit(
        db: Session,
        resource_id: int,
        unit_number: int,
        title: str,
        file_path: str,
        file_name: str,
        file_size: int,
        file_type: str,
        price: Decimal,
        description: str = None
    ) -> ResourceUnit:
        """Add a unit to a resource"""
        # Unit 1 is always free
        if unit_number == 1:
            price = Decimal("0.00")
            is_free = True
        else:
            is_free = False
        
        unit = ResourceUnit(
            resource_id=resource_id,
            unit_number=unit_number,
            title=title,
            description=description,
            file_path=file_path,
            file_name=file_name,
            file_size=file_size,
            file_type=file_type,
            price=price,
            is_free=is_free
        )
        db.add(unit)
        
        # Update resource total_units count
        resource = db.query(Resource).filter(Resource.id == resource_id).first()
        if resource:
            resource.total_units = db.query(ResourceUnit).filter(
                ResourceUnit.resource_id == resource_id
            ).count() + 1
        
        db.commit()
        db.refresh(unit)
        return unit
    
    @staticmethod
    def get_resource_units(db: Session, resource_id: int) -> List[ResourceUnit]:
        """Get all units for a resource"""
        return db.query(ResourceUnit).filter(
            ResourceUnit.resource_id == resource_id
        ).order_by(ResourceUnit.unit_number).all()
    
    @staticmethod
    def purchase_unit(
        db: Session,
        buyer_id: int,
        resource_unit_id: int,
        payment_method: str,
        transaction_id: str
    ) -> Purchase:
        """Purchase a resource unit"""
        # Get the unit
        unit = db.query(ResourceUnit).filter(ResourceUnit.id == resource_unit_id).first()
        if not unit:
            raise ValueError("Resource unit not found")
        
        # Check if already purchased
        existing_purchase = db.query(Purchase).filter(
            Purchase.buyer_id == buyer_id,
            Purchase.resource_unit_id == resource_unit_id,
            Purchase.payment_status == "completed"
        ).first()
        if existing_purchase:
            raise ValueError("Unit already purchased")
        
        # Calculate commission and seller earnings
        amount_paid = unit.price
        platform_commission = amount_paid * ResourceService.PLATFORM_COMMISSION_RATE
        seller_earnings = amount_paid - platform_commission
        
        # Create purchase record
        purchase = Purchase(
            buyer_id=buyer_id,
            resource_unit_id=resource_unit_id,
            resource_id=unit.resource_id,
            amount_paid=amount_paid,
            platform_commission=platform_commission,
            seller_earnings=seller_earnings,
            payment_status="completed",
            payment_method=payment_method,
            transaction_id=transaction_id
        )
        db.add(purchase)
        
        # Update seller's wallet
        resource = db.query(Resource).filter(Resource.id == unit.resource_id).first()
        wallet = db.query(Wallet).filter(Wallet.user_id == resource.user_id).first()
        if not wallet:
            wallet = Wallet(user_id=resource.user_id)
            db.add(wallet)
        
        wallet.balance += seller_earnings
        wallet.total_earned += seller_earnings
        
        # Update download count
        unit.download_count += 1
        
        db.commit()
        db.refresh(purchase)
        return purchase
    
    @staticmethod
    def check_unit_access(db: Session, user_id: int, resource_unit_id: int) -> bool:
        """Check if user has access to a unit (free or purchased)"""
        unit = db.query(ResourceUnit).filter(ResourceUnit.id == resource_unit_id).first()
        if not unit:
            return False
        
        # Unit 1 is always free
        if unit.is_free:
            return True
        
        # Check if purchased
        purchase = db.query(Purchase).filter(
            Purchase.buyer_id == user_id,
            Purchase.resource_unit_id == resource_unit_id,
            Purchase.payment_status == "completed"
        ).first()
        
        return purchase is not None
    
    @staticmethod
    def add_review(
        db: Session,
        user_id: int,
        resource_id: int,
        rating: int,
        comment: str = None
    ) -> Review:
        """Add a review for a resource"""
        # Check if user already reviewed
        existing_review = db.query(Review).filter(
            Review.user_id == user_id,
            Review.resource_id == resource_id
        ).first()
        if existing_review:
            raise ValueError("You already reviewed this resource")
        
        review = Review(
            user_id=user_id,
            resource_id=resource_id,
            rating=rating,
            comment=comment
        )
        db.add(review)
        
        # Update resource average rating
        resource = db.query(Resource).filter(Resource.id == resource_id).first()
        if resource:
            avg_rating = db.query(func.avg(Review.rating)).filter(
                Review.resource_id == resource_id
            ).scalar()
            resource.average_rating = float(avg_rating) if avg_rating else 0.0
            resource.total_reviews = db.query(Review).filter(
                Review.resource_id == resource_id
            ).count() + 1
        
        db.commit()
        db.refresh(review)
        return review
    
    @staticmethod
    def get_user_purchases(db: Session, user_id: int) -> List[Purchase]:
        """Get all purchases made by a user"""
        return db.query(Purchase).filter(
            Purchase.buyer_id == user_id,
            Purchase.payment_status == "completed"
        ).order_by(Purchase.purchased_at.desc()).all()
    
    @staticmethod
    def get_user_uploads(db: Session, user_id: int) -> List[Resource]:
        """Get all resources uploaded by a user"""
        return db.query(Resource).filter(
            Resource.user_id == user_id
        ).order_by(Resource.created_at.desc()).all()
    
    @staticmethod
    def get_wallet(db: Session, user_id: int) -> Wallet:
        """Get or create user's wallet"""
        wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
        if not wallet:
            wallet = Wallet(user_id=user_id)
            db.add(wallet)
            db.commit()
            db.refresh(wallet)
        return wallet
