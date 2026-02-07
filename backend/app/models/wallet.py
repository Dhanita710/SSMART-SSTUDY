from sqlalchemy import Column, Integer, DateTime, Numeric, ForeignKey
from sqlalchemy.sql import func
from ..database import Base


class Wallet(Base):
    """Model for user wallet to track earnings and withdrawals"""
    __tablename__ = "wallets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Balance tracking
    balance = Column(Numeric(10, 2), default=0.00)  # Current available balance
    total_earned = Column(Numeric(10, 2), default=0.00)  # Lifetime earnings
    total_withdrawn = Column(Numeric(10, 2), default=0.00)  # Lifetime withdrawals
    pending_amount = Column(Numeric(10, 2), default=0.00)  # Amount in pending transactions
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
