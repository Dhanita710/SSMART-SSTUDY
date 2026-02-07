import os
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal

from ..database import get_db
from ..models.user import User
from ..models.resource import Resource
from ..models.resource_unit import ResourceUnit
from ..schemas.resource_schemas import (
    ResourceCreate, ResourceUpdate, ResourceResponse,
    ResourceUnitCreate, ResourceUnitUpdate, ResourceUnitResponse,
    PurchaseCreate, PurchaseResponse,
    ReviewCreate, ReviewUpdate, ReviewResponse,
    WalletResponse
)
from ..services.resource_service import ResourceService

router = APIRouter(prefix="/api/marketplace", tags=["Resource Marketplace"])

# File upload directory
UPLOAD_DIR = "uploads/resources"
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


# ============ Resource Endpoints ============

@router.post("/resources", response_model=ResourceResponse)
def create_resource(
    resource_data: ResourceCreate,
    db: Session = Depends(get_db)
):
    """Create a new resource (no auth required for demo)"""
    current_user = get_demo_user(db)
    
    resource = ResourceService.create_resource(
        db=db,
        user_id=current_user.id,
        title=resource_data.title,
        description=resource_data.description,
        subject=resource_data.subject,
        category=resource_data.category
    )
    return resource


@router.get("/resources", response_model=List[ResourceResponse])
def browse_resources(
    subject: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_rating: Optional[float] = None,
    sort_by: str = "recent",
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Browse marketplace with filters"""
    resources = ResourceService.browse_resources(
        db=db,
        subject=subject,
        category=category,
        search=search,
        min_rating=min_rating,
        sort_by=sort_by,
        limit=limit,
        offset=offset
    )
    return resources


@router.get("/resources/{resource_id}", response_model=ResourceResponse)
def get_resource(
    resource_id: int,
    db: Session = Depends(get_db)
):
    """Get resource details"""
    resource = ResourceService.get_resource(db, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource


@router.put("/resources/{resource_id}", response_model=ResourceResponse)
def update_resource(
    resource_id: int,
    resource_data: ResourceUpdate,
    db: Session = Depends(get_db)
):
    """Update resource (no auth required for demo)"""
    current_user = get_demo_user(db)
    
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    # Check ownership
    if resource.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update fields
    if resource_data.title:
        resource.title = resource_data.title
    if resource_data.description is not None:
        resource.description = resource_data.description
    if resource_data.subject:
        resource.subject = resource_data.subject
    if resource_data.category is not None:
        resource.category = resource_data.category
    if resource_data.thumbnail_url is not None:
        resource.thumbnail_url = resource_data.thumbnail_url
    
    db.commit()
    db.refresh(resource)
    return resource


@router.delete("/resources/{resource_id}")
def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db)
):
    """Delete resource (soft delete)"""
    current_user = get_demo_user(db)
    
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    # Check ownership
    if resource.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    resource.is_active = False
    db.commit()
    return {"message": "Resource deleted successfully"}


# ============ Resource Unit Endpoints ============

@router.post("/resources/{resource_id}/units", response_model=ResourceUnitResponse)
async def add_unit(
    resource_id: int,
    unit_number: int = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    price: Decimal = Form(Decimal("0.00")),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Add a unit to a resource with file upload"""
    current_user = get_demo_user(db)
    
    # Verify resource ownership
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    if resource.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Validate file type
    allowed_extensions = [".pdf", ".docx", ".doc", ".pptx", ".txt"]
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Save file
    file_path = os.path.join(UPLOAD_DIR, f"{resource_id}_unit{unit_number}_{file.filename}")
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Create unit
    unit = ResourceService.add_unit(
        db=db,
        resource_id=resource_id,
        unit_number=unit_number,
        title=title,
        file_path=file_path,
        file_name=file.filename,
        file_size=len(content),
        file_type=file_ext[1:],  # Remove the dot
        price=price,
        description=description
    )
    return unit


@router.get("/resources/{resource_id}/units", response_model=List[ResourceUnitResponse])
def get_resource_units(
    resource_id: int,
    db: Session = Depends(get_db)
):
    """Get all units for a resource"""
    units = ResourceService.get_resource_units(db, resource_id)
    return units


@router.get("/resources/{resource_id}/units/{unit_id}/download")
async def download_unit(
    resource_id: int,
    unit_id: int,
    db: Session = Depends(get_db)
):
    """Download a resource unit (free or purchased)"""
    current_user = get_demo_user(db)
    
    # Get the unit
    unit = db.query(ResourceUnit).filter(
        ResourceUnit.id == unit_id,
        ResourceUnit.resource_id == resource_id
    ).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    
    # Check access
    has_access = ResourceService.check_unit_access(db, current_user.id, unit_id)
    if not has_access:
        raise HTTPException(status_code=403, detail="Purchase required to access this unit")
    
    # Increment download count
    unit.download_count += 1
    db.commit()
    
    # Return file
    if not os.path.exists(unit.file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=unit.file_path,
        filename=unit.file_name,
        media_type="application/octet-stream"
    )


# ============ Purchase Endpoints ============

@router.post("/purchases", response_model=PurchaseResponse)
def purchase_unit(
    purchase_data: PurchaseCreate,
    db: Session = Depends(get_db)
):
    """Purchase a resource unit (simplified - no real payment integration yet)"""
    current_user = get_demo_user(db)
    
    # For demo, generate a fake transaction ID
    import uuid
    transaction_id = f"demo_{uuid.uuid4().hex[:16]}"
    
    try:
        purchase = ResourceService.purchase_unit(
            db=db,
            buyer_id=current_user.id,
            resource_unit_id=purchase_data.resource_unit_id,
            payment_method=purchase_data.payment_method,
            transaction_id=transaction_id
        )
        return purchase
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/purchases/my-purchases", response_model=List[PurchaseResponse])
def get_my_purchases(
    db: Session = Depends(get_db)
):
    """Get user's purchase history"""
    current_user = get_demo_user(db)
    purchases = ResourceService.get_user_purchases(db, current_user.id)
    return purchases


# ============ Review Endpoints ============

@router.post("/reviews", response_model=ReviewResponse)
def add_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db)
):
    """Add a review for a resource"""
    current_user = get_demo_user(db)
    
    try:
        review = ResourceService.add_review(
            db=db,
            user_id=current_user.id,
            resource_id=review_data.resource_id,
            rating=review_data.rating,
            comment=review_data.comment
        )
        return review
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/resources/{resource_id}/reviews", response_model=List[ReviewResponse])
def get_resource_reviews(
    resource_id: int,
    db: Session = Depends(get_db)
):
    """Get all reviews for a resource"""
    from ..models.review import Review
    reviews = db.query(Review).filter(
        Review.resource_id == resource_id,
        Review.is_approved == True
    ).order_by(Review.created_at.desc()).all()
    return reviews


# ============ Wallet Endpoints ============

@router.get("/wallet", response_model=WalletResponse)
def get_wallet(
    db: Session = Depends(get_db)
):
    """Get user's wallet"""
    current_user = get_demo_user(db)
    wallet = ResourceService.get_wallet(db, current_user.id)
    return wallet


# ============ User Resources Endpoints ============

@router.get("/my-resources", response_model=List[ResourceResponse])
def get_my_resources(
    db: Session = Depends(get_db)
):
    """Get resources uploaded by current user"""
    current_user = get_demo_user(db)
    resources = ResourceService.get_user_uploads(db, current_user.id)
    return resources
