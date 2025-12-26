"""
Notification endpoints.
"""
from typing import List, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_active_user
from app.db.database import get_db
from app.models.user import User
from app.services.notification_service import NotificationService
from app.schemas.notification import NotificationResponse, NotificationList

router = APIRouter()


@router.get("", response_model=NotificationList)
def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    unread_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get current user's notifications.
    
    - **skip**: Number of notifications to skip (pagination)
    - **limit**: Maximum number of notifications to return
    - **unread_only**: If true, only return unread notifications
    """
    notifications = NotificationService.get_user_notifications(
        db, current_user.id, skip, limit, unread_only
    )
    total = NotificationService.count_user_notifications(db, current_user.id, unread_only)
    unread_count = NotificationService.count_user_notifications(db, current_user.id, unread_only=True)
    
    return {
        "items": notifications,
        "total": total,
        "unread_count": unread_count
    }


@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Mark a notification as read.
    
    - **notification_id**: ID of the notification to mark as read
    """
    notification = NotificationService.mark_as_read(db, notification_id, current_user.id)
    return notification


@router.put("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Mark all notifications as read for the current user.
    """
    updated_count = NotificationService.mark_all_as_read(db, current_user.id)
    return {"message": f"Marked {updated_count} notifications as read"}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Delete a notification.
    
    - **notification_id**: ID of the notification to delete
    """
    deleted = NotificationService.delete_notification(db, notification_id, current_user.id)
    if deleted:
        return {"message": "Notification deleted"}
    return {"message": "Notification not found"}


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get count of unread notifications for current user.
    """
    count = NotificationService.count_user_notifications(db, current_user.id, unread_only=True)
    return {"unread_count": count}
