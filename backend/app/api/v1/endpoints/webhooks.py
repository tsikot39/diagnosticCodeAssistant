"""
API endpoints for webhook management.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.deps import get_current_active_user
from app.core.rbac import RoleChecker
from app.db.database import get_db
from app.models.user import User
from app.services.webhook_service import WebhookService
from app.schemas.webhook import (
    WebhookCreate,
    WebhookUpdate,
    WebhookResponse,
    WebhookList,
    WebhookDeliveryList,
    WebhookTestRequest
)

router = APIRouter()
allow_user = RoleChecker(["user", "manager", "admin"])
allow_admin = RoleChecker(["admin"])


@router.post("", response_model=WebhookResponse, status_code=201)
def create_webhook(
    webhook_data: WebhookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_user)
):
    """
    Create a new webhook configuration.
    
    Webhooks allow you to receive real-time HTTP notifications when events occur.
    
    **Available Events:**
    - `code.created` - Triggered when a diagnostic code is created
    - `code.updated` - Triggered when a diagnostic code is updated
    - `code.deleted` - Triggered when a diagnostic code is deleted
    - `code.restored` - Triggered when a code version is restored
    - `comment.created` - Triggered when a comment is added
    - `audit.logged` - Triggered when an audit event is logged
    
    **Security:**
    - Include a `secret` to receive HMAC-SHA256 signatures in `X-Webhook-Signature` header
    - Use HTTPS URLs for production webhooks
    """
    webhook = WebhookService.create_webhook(db, webhook_data, current_user.id)
    return webhook


@router.get("", response_model=WebhookList)
def get_webhooks(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_user)
):
    """
    Get list of webhooks.
    
    Returns all webhooks created by the current user (or all if admin).
    """
    # Admins can see all webhooks, users only their own
    user_id = None if current_user.role == "admin" else current_user.id
    
    webhooks, total = WebhookService.get_webhooks(
        db=db,
        user_id=user_id,
        is_active=is_active,
        skip=skip,
        limit=limit
    )
    
    return WebhookList(webhooks=webhooks, total=total)


@router.get("/{webhook_id}", response_model=WebhookResponse)
def get_webhook(
    webhook_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_user)
):
    """Get a specific webhook by ID."""
    webhook = WebhookService.get_webhook_by_id(db, webhook_id)
    
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    # Check permission (owner or admin)
    if webhook.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this webhook")
    
    return webhook


@router.put("/{webhook_id}", response_model=WebhookResponse)
def update_webhook(
    webhook_id: int,
    webhook_data: WebhookUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_user)
):
    """
    Update a webhook configuration.
    
    Only the webhook creator or admins can update webhooks.
    """
    webhook = WebhookService.get_webhook_by_id(db, webhook_id)
    
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    # Check permission
    if webhook.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this webhook")
    
    updated_webhook = WebhookService.update_webhook(db, webhook_id, webhook_data)
    return updated_webhook


@router.delete("/{webhook_id}", status_code=204)
def delete_webhook(
    webhook_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_user)
):
    """
    Delete a webhook.
    
    Only the webhook creator or admins can delete webhooks.
    """
    webhook = WebhookService.get_webhook_by_id(db, webhook_id)
    
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    # Check permission
    if webhook.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this webhook")
    
    success = WebhookService.delete_webhook(db, webhook_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Webhook not found")


@router.get("/{webhook_id}/deliveries", response_model=WebhookDeliveryList)
def get_webhook_deliveries(
    webhook_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_user)
):
    """
    Get delivery history for a webhook.
    
    Shows all delivery attempts including successes, failures, and retries.
    Useful for debugging webhook issues.
    """
    webhook = WebhookService.get_webhook_by_id(db, webhook_id)
    
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    # Check permission
    if webhook.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this webhook")
    
    deliveries, total, success_count, failure_count = WebhookService.get_deliveries(
        db=db,
        webhook_id=webhook_id,
        skip=skip,
        limit=limit
    )
    
    return WebhookDeliveryList(
        deliveries=deliveries,
        total=total,
        success_count=success_count,
        failure_count=failure_count
    )


@router.post("/{webhook_id}/test")
async def test_webhook(
    webhook_id: int,
    test_data: WebhookTestRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_user)
):
    """
    Send a test webhook event.
    
    Useful for testing your webhook endpoint without triggering a real event.
    The test event will appear in the delivery history.
    """
    webhook = WebhookService.get_webhook_by_id(db, webhook_id)
    
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    # Check permission
    if webhook.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to test this webhook")
    
    # Use default test payload if not provided
    payload = test_data.payload or {
        "test": True,
        "event": test_data.event_type,
        "timestamp": datetime.utcnow().isoformat(),
        "message": "This is a test webhook delivery"
    }
    
    # Trigger webhook in background
    background_tasks.add_task(
        WebhookService._deliver_webhook,
        db, webhook, test_data.event_type, payload
    )
    
    return {
        "message": "Test webhook queued for delivery",
        "event_type": test_data.event_type
    }


from datetime import datetime
