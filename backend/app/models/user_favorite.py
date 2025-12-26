"""
User Favorites model - Many-to-many relationship between users and diagnostic codes.
"""
from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class UserFavorite(Base):
    """User's favorite diagnostic codes."""
    
    __tablename__ = "user_favorites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    diagnostic_code_id = Column(Integer, ForeignKey("diagnostic_codes.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="favorites")
    diagnostic_code = relationship("DiagnosticCode")
    
    # Unique constraint to prevent duplicate favorites
    __table_args__ = (
        UniqueConstraint('user_id', 'diagnostic_code_id', name='uq_user_favorite'),
    )
