"""
Search-related models.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.sql import func
from app.db.database import Base


class RecentSearch(Base):
    """Recent search history for users."""
    
    __tablename__ = "recent_searches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    query = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    def __repr__(self):
        return f"<RecentSearch(id={self.id}, user_id={self.user_id}, query={self.query})>"


class SavedSearch(Base):
    """Saved search presets for users."""
    
    __tablename__ = "saved_searches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    query = Column(String, nullable=False)
    filters = Column(JSON, nullable=True)  # category, severity, is_active, fuzzy
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<SavedSearch(id={self.id}, name={self.name}, user_id={self.user_id})>"
