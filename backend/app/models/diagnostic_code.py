"""
Diagnostic Code database model.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.database import Base


class DiagnosticCode(Base):
    """Diagnostic Code model."""
    
    __tablename__ = "diagnostic_codes"
    __table_args__ = (
        UniqueConstraint('code', 'organization_id', name='uq_code_organization'),
    )
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    code = Column(String(50), index=True, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), index=True)
    subcategory = Column(String(100))
    severity = Column(String(20))  # low, medium, high, critical
    is_active = Column(Boolean, default=True)
    extra_data = Column(JSON, nullable=True)  # Additional flexible data (renamed from metadata to avoid SQLAlchemy conflict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organization = relationship("Organization", back_populates="diagnostic_codes")
    versions = relationship("CodeVersion", back_populates="diagnostic_code", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<DiagnosticCode(code='{self.code}', description='{self.description[:50]}...')>"
