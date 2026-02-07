from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


# ============ Resource Schemas ============

class ResourceCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    subject: str = Field(..., min_length=2, max_length=100)
    category: Optional[str] = None


class ResourceUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    subject: Optional[str] = Field(None, min_length=2, max_length=100)
    category: Optional[str] = None
    thumbnail_url: Optional[str] = None


class ResourceResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    subject: str
    category: Optional[str]
    total_units: int
    thumbnail_url: Optional[str]
    total_downloads: int
    average_rating: float
    total_reviews: int
    is_approved: bool
    is_active: bool
    created_at: datetime
    
    class Config:
        orm_mode = True


# ============ Resource Unit Schemas ============

class ResourceUnitCreate(BaseModel):
    unit_number: int = Field(..., ge=1)
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    price: Decimal = Field(default=Decimal("0.00"), ge=0)
    # file will be uploaded separately via multipart/form-data


class ResourceUnitUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0)


class ResourceUnitResponse(BaseModel):
    id: int
    resource_id: int
    unit_number: int
    title: str
    description: Optional[str]
    file_name: str
    file_size: int
    file_type: str
    price: Decimal
    download_count: int
    is_free: bool
    preview_available: bool
    created_at: datetime
    
    class Config:
        orm_mode = True


# ============ Purchase Schemas ============

class PurchaseCreate(BaseModel):
    resource_unit_id: int
    payment_method: str = Field(..., pattern="^(stripe|paypal|razorpay)$")


class PurchaseResponse(BaseModel):
    id: int
    buyer_id: int
    resource_unit_id: int
    resource_id: int
    amount_paid: Decimal
    platform_commission: Decimal
    seller_earnings: Decimal
    payment_status: str
    payment_method: str
    transaction_id: Optional[str]
    purchased_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        orm_mode = True


# ============ Review Schemas ============

class ReviewCreate(BaseModel):
    resource_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    resource_id: int
    rating: int
    comment: Optional[str]
    is_approved: bool
    is_helpful_count: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        orm_mode = True


# ============ Wallet Schemas ============

class WalletResponse(BaseModel):
    id: int
    user_id: int
    balance: Decimal
    total_earned: Decimal
    total_withdrawn: Decimal
    pending_amount: Decimal
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        orm_mode = True


class WithdrawalRequest(BaseModel):
    amount: Decimal = Field(..., gt=0)
    payment_method: str = Field(..., pattern="^(bank_transfer|paypal|upi)$")
    account_details: str  # Bank account number, PayPal email, UPI ID, etc.
