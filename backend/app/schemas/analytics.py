"""
Analytics schemas for request/response validation.
"""
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel


class AnalyticsEventCreate(BaseModel):
    """Analytics event creation schema."""
    event_type: str
    event_category: str
    resource_id: Optional[int] = None
    extra_data: Optional[Dict[str, Any]] = None


class AnalyticsEventResponse(BaseModel):
    """Analytics event response schema."""
    id: int
    user_id: Optional[int] = None
    event_type: str
    event_category: str
    resource_id: Optional[int] = None
    extra_data: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ActivityStats(BaseModel):
    """Overall activity statistics."""
    total_events: int
    events_today: int
    events_this_week: int
    events_this_month: int
    unique_users: int


class PopularCode(BaseModel):
    """Popular diagnostic code statistics."""
    code_id: int
    code: str
    description: str
    view_count: int


class EventTypeDistribution(BaseModel):
    """Distribution of event types."""
    event_type: str
    count: int


class UserActivity(BaseModel):
    """User activity statistics."""
    user_id: int
    username: str
    email: str
    event_count: int
    last_activity: datetime


class AnalyticsSummary(BaseModel):
    """Complete analytics summary."""
    activity_stats: ActivityStats
    popular_codes: List[PopularCode]
    event_distribution: List[EventTypeDistribution]
    recent_events: List[AnalyticsEventResponse]
    top_users: List[UserActivity]
