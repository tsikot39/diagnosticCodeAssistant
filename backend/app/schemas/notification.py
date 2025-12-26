"""
Notification schemas for request/response validation.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    """Notification response schema."""
    id: int
    user_id: int
    type: str
    title: str
    message: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NotificationCreate(BaseModel):
    """Notification creation schema."""
    user_id: int
    type: str  # info, success, warning, error
    title: str
    message: str
    link: Optional[str] = None


class NotificationList(BaseModel):
    """Paginated notification list."""
    items: List[NotificationResponse]
    total: int
    unread_count: int
