from sqlalchemy import Column, Integer, String, DateTime, Numeric, Boolean, ForeignKey
from sqlalchemy.sql import func
from ..database import Base


class ResourceUnit(Base):
    """Model for individual units within a resource"""
    __tablename__ = "resource_units"
    
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    
    # Unit info
    unit_number = Column(Integer, nullable=False)  # 1, 2, 3, etc.
    title = Column(String, nullable=False)  # e.g., "Unit 1: Introduction"
    description = Column(String)
    
    # File info
    file_path = Column(String, nullable=False)  # Path to uploaded file
    file_name = Column(String, nullable=False)  # Original filename
    file_size = Column(Integer)  # Size in bytes
    file_type = Column(String)  # e.g., "pdf", "docx"
    
    # Pricing (Unit 1 is always 0.00)
    price = Column(Numeric(10, 2), default=0.00)  # Price in dollars/rupees
    
    # Stats
    download_count = Column(Integer, default=0)
    
    # Flags
    is_free = Column(Boolean, default=False)  # True for Unit 1
    preview_available = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
