"""
Notification service for managing user notifications.
"""
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from app.models.notification import Notification
from app.schemas.notification import NotificationCreate


class NotificationService:
    """Service for notification operations."""

    @staticmethod
    def create_notification(db: Session, notification_data: NotificationCreate) -> Notification:
        """Create a new notification."""
        notification = Notification(**notification_data.model_dump())
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification

    @staticmethod
    def get_user_notifications(
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 50,
        unread_only: bool = False
    ) -> List[Notification]:
        """Get notifications for a user."""
        query = db.query(Notification).filter(Notification.user_id == user_id)
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        return query.order_by(desc(Notification.created_at)).offset(skip).limit(limit).all()

    @staticmethod
    def count_user_notifications(db: Session, user_id: int, unread_only: bool = False) -> int:
        """Count notifications for a user."""
        query = db.query(func.count(Notification.id)).filter(Notification.user_id == user_id)
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        return query.scalar() or 0

    @staticmethod
    def mark_as_read(db: Session, notification_id: int, user_id: int) -> Optional[Notification]:
        """Mark a notification as read."""
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if notification and not notification.is_read:
            notification.is_read = True
            notification.read_at = datetime.now()
            db.commit()
            db.refresh(notification)
        
        return notification

    @staticmethod
    def mark_all_as_read(db: Session, user_id: int) -> int:
        """Mark all notifications as read for a user."""
        updated = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({
            "is_read": True,
            "read_at": datetime.now()
        })
        db.commit()
        return updated

    @staticmethod
    def delete_notification(db: Session, notification_id: int, user_id: int) -> bool:
        """Delete a notification."""
        deleted = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).delete()
        db.commit()
        return deleted > 0

    @staticmethod
    def notify_user(
        db: Session,
        user_id: int,
        type: str,
        title: str,
        message: str,
        link: Optional[str] = None
    ) -> Notification:
        """Helper to quickly create a notification."""
        notification_data = NotificationCreate(
            user_id=user_id,
            type=type,
            title=title,
            message=message,
            link=link
        )
        return NotificationService.create_notification(db, notification_data)
