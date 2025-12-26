"""
Code version model for tracking changes to diagnostic codes.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base


class CodeVersion(Base):
    """Model for storing version history of diagnostic codes."""
    
    __tablename__ = "code_versions"

    id = Column(Integer, primary_key=True, index=True)
    diagnostic_code_id = Column(Integer, ForeignKey("diagnostic_codes.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    
    # Snapshot of code data at this version
    code = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=True, index=True)
    severity = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    extra_data = Column(JSON, nullable=True)  # Renamed from metadata to avoid SQLAlchemy conflict
    
    # Version metadata
    change_type = Column(String(20), nullable=False, index=True)  # CREATE, UPDATE, DELETE, RESTORE
    change_summary = Column(Text, nullable=True)  # Summary of what changed
    changed_fields = Column(JSON, nullable=True)  # List of field names that changed
    
    # Audit info
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationships
    diagnostic_code = relationship("DiagnosticCode", back_populates="versions")
    user = relationship("User")
    
    def __repr__(self):
        return f"<CodeVersion(id={self.id}, code={self.code}, version={self.version_number}, type={self.change_type})>"


class CodeComment(Base):
    """Model for comments on diagnostic code versions."""
    
    __tablename__ = "code_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    diagnostic_code_id = Column(Integer, ForeignKey("diagnostic_codes.id", ondelete="CASCADE"), nullable=False, index=True)
    version_id = Column(Integer, ForeignKey("code_versions.id", ondelete="CASCADE"), nullable=True, index=True)
    
    content = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False, nullable=False)
    
    # Audit info
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    diagnostic_code = relationship("DiagnosticCode")
    version = relationship("CodeVersion")
    user = relationship("User")
    
    def __repr__(self):
        return f"<CodeComment(id={self.id}, code_id={self.diagnostic_code_id}, resolved={self.is_resolved})>"
