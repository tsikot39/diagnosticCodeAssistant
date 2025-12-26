"""
Organization model for multi-tenancy support.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base


class Organization(Base):
    """Model for organizations/tenants."""
    
    __tablename__ = "organizations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    slug = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Contact info
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    website = Column(String(255), nullable=True)
    
    # Settings
    settings = Column(JSON, nullable=True)  # Flexible org-specific settings
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    
    # Subscription/limits (for future billing)
    max_users = Column(Integer, default=10, nullable=False)
    max_codes = Column(Integer, default=10000, nullable=False)
    
    # Audit
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    users = relationship("User", back_populates="organization")
    diagnostic_codes = relationship("DiagnosticCode", back_populates="organization")
    
    def __repr__(self):
        return f"<Organization(id={self.id}, name='{self.name}', slug='{self.slug}')>"
