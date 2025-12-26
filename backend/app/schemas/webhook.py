"""
Pydantic schemas for webhook endpoints.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, HttpUrl, validator


class WebhookBase(BaseModel):
    """Base schema for webhook."""
    name: str = Field(..., min_length=1, max_length=100)
    url: str = Field(..., description="URL to send webhook events to")
    secret: Optional[str] = Field(None, max_length=255, description="Secret for HMAC signature")
    events: List[str] = Field(..., min_items=1, description="List of events to trigger on")
    headers: Optional[Dict[str, str]] = Field(None, description="Custom headers to include")
    retry_count: int = Field(3, ge=0, le=10, description="Number of retry attempts")
    timeout_seconds: int = Field(30, ge=5, le=300, description="Request timeout in seconds")
    
    @validator('events')
    def validate_events(cls, v):
        valid_events = {
            'code.created', 'code.updated', 'code.deleted',
            'code.restored', 'comment.created', 'audit.logged'
        }
        for event in v:
            if event not in valid_events:
                raise ValueError(f"Invalid event type: {event}. Must be one of {valid_events}")
        return v


class WebhookCreate(WebhookBase):
    """Schema for creating a webhook."""
    pass


class WebhookUpdate(BaseModel):
    """Schema for updating a webhook."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    url: Optional[str] = None
    secret: Optional[str] = Field(None, max_length=255)
    events: Optional[List[str]] = Field(None, min_items=1)
    is_active: Optional[bool] = None
    headers: Optional[Dict[str, str]] = None
    retry_count: Optional[int] = Field(None, ge=0, le=10)
    timeout_seconds: Optional[int] = Field(None, ge=5, le=300)


class WebhookResponse(WebhookBase):
    """Response schema for webhook."""
    id: int
    is_active: bool
    last_triggered_at: Optional[datetime] = None
    last_status_code: Optional[int] = None
    total_triggers: int
    failed_triggers: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class WebhookList(BaseModel):
    """Response schema for list of webhooks."""
    webhooks: List[WebhookResponse]
    total: int


class WebhookDeliveryResponse(BaseModel):
    """Response schema for webhook delivery."""
    id: int
    webhook_id: int
    event_type: str
    payload: Dict[str, Any]
    status_code: Optional[int] = None
    response_body: Optional[str] = None
    error_message: Optional[str] = None
    duration_ms: Optional[int] = None
    attempt_number: int
    is_success: bool
    created_at: datetime
    delivered_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class WebhookDeliveryList(BaseModel):
    """Response schema for list of deliveries."""
    deliveries: List[WebhookDeliveryResponse]
    total: int
    success_count: int
    failure_count: int


class WebhookTestRequest(BaseModel):
    """Request schema for testing a webhook."""
    event_type: str = Field("test.ping", description="Event type to send")
    payload: Optional[Dict[str, Any]] = Field(None, description="Custom test payload")
