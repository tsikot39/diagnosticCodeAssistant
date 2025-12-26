"""
Audit log model for tracking all system changes.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.sql import func
from app.db.database import Base


class AuditLog(Base):
    """Audit log for tracking all system changes."""
    
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String, nullable=False, index=True)  # create, update, delete, login, logout
    resource_type = Column(String, nullable=False, index=True)  # user, diagnostic_code, etc.
    resource_id = Column(Integer, nullable=True, index=True)
    changes = Column(JSON, nullable=True)  # Old and new values
    ip_address = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    extra_data = Column(JSON, nullable=True)  # Additional context (renamed from metadata)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    def __repr__(self):
        return f"<AuditLog(id={self.id}, action={self.action}, resource={self.resource_type})>"
