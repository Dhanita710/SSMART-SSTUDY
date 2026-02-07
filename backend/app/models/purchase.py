from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.sql import func
from ..database import Base


class Purchase(Base):
    """Model for tracking resource unit purchases"""
    __tablename__ = "purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resource_unit_id = Column(Integer, ForeignKey("resource_units.id"), nullable=False)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)  # For easier querying
    
    # Payment details
    amount_paid = Column(Numeric(10, 2), nullable=False)  # Total amount paid by buyer
    platform_commission = Column(Numeric(10, 2), nullable=False)  # Platform's cut (e.g., 15%)
    seller_earnings = Column(Numeric(10, 2), nullable=False)  # Amount seller receives
    
    # Payment status
    payment_status = Column(String, default="pending")  # pending, completed, failed, refunded
    payment_method = Column(String)  # stripe, paypal, razorpay, etc.
    transaction_id = Column(String, unique=True)  # External payment gateway transaction ID
    
    # Timestamps
    purchased_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
