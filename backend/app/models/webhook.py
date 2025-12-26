"""
Webhook model for external integrations.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class Webhook(Base):
    """Model for webhook configurations."""
    
    __tablename__ = "webhooks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    url = Column(Text, nullable=False)
    secret = Column(String(255), nullable=True)  # For HMAC signature verification
    
    # Events to trigger on
    events = Column(JSON, nullable=False)  # List of event types: code.created, code.updated, etc.
    
    # Configuration
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    headers = Column(JSON, nullable=True)  # Custom headers to send
    retry_count = Column(Integer, default=3, nullable=False)
    timeout_seconds = Column(Integer, default=30, nullable=False)
    
    # Statistics
    last_triggered_at = Column(DateTime, nullable=True)
    last_status_code = Column(Integer, nullable=True)
    total_triggers = Column(Integer, default=0, nullable=False)
    failed_triggers = Column(Integer, default=0, nullable=False)
    
    # Audit
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User")
    deliveries = relationship("WebhookDelivery", back_populates="webhook", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Webhook(id={self.id}, name='{self.name}', active={self.is_active})>"


class WebhookDelivery(Base):
    """Model for webhook delivery logs."""
    
    __tablename__ = "webhook_deliveries"
    
    id = Column(Integer, primary_key=True, index=True)
    webhook_id = Column(Integer, ForeignKey("webhooks.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Event details
    event_type = Column(String(50), nullable=False, index=True)
    payload = Column(JSON, nullable=False)
    
    # Delivery details
    status_code = Column(Integer, nullable=True)
    response_body = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    
    # Retry info
    attempt_number = Column(Integer, default=1, nullable=False)
    is_success = Column(Boolean, default=False, nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    delivered_at = Column(DateTime, nullable=True)
    
    # Relationships
    webhook = relationship("Webhook", back_populates="deliveries")
    
    def __repr__(self):
        return f"<WebhookDelivery(id={self.id}, webhook_id={self.webhook_id}, event={self.event_type}, success={self.is_success})>"
