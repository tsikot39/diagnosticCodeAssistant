"""
Analytics event model for tracking user activity.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.db.database import Base


class AnalyticsEvent(Base):
    """Analytics event model for tracking user interactions."""
    
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    event_type = Column(String, nullable=False, index=True)  # view, search, create, update, delete, export, import
    event_category = Column(String, nullable=False, index=True)  # diagnostic_code, dashboard, auth
    resource_id = Column(Integer, nullable=True)  # ID of the resource (e.g., diagnostic code ID)
    extra_data = Column(JSON, nullable=True)  # Additional event data (renamed from metadata)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    def __repr__(self):
        return f"<AnalyticsEvent(id={self.id}, type={self.event_type}, category={self.event_category})>"
