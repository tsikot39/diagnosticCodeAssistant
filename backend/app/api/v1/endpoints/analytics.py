"""
Analytics endpoints.
"""
from typing import Any, List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_active_user, get_current_superuser
from app.db.database import get_db
from app.models.user import User
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import (
    AnalyticsEventCreate,
    AnalyticsEventResponse,
    AnalyticsSummary,
    ActivityStats,
    PopularCode,
    EventTypeDistribution,
    UserActivity
)

router = APIRouter()


@router.post("/events", response_model=AnalyticsEventResponse, status_code=status.HTTP_201_CREATED)
def track_event(
    event_in: AnalyticsEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Track a new analytics event."""
    event = AnalyticsService.track_event(
        db=db,
        event_type=event_in.event_type,
        event_category=event_in.event_category,
        user_id=current_user.id,
        resource_id=event_in.resource_id,
        metadata=event_in.extra_data
    )
    return event


@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
) -> Any:
    """Get complete analytics summary. (Admin only)"""
    return AnalyticsService.get_analytics_summary(db)


@router.get("/activity", response_model=ActivityStats)
def get_activity_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get overall activity statistics."""
    return AnalyticsService.get_activity_stats(db)


@router.get("/popular-codes", response_model=List[PopularCode])
def get_popular_codes(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get most viewed diagnostic codes."""
    return AnalyticsService.get_popular_codes(db, limit=limit)


@router.get("/event-distribution", response_model=List[EventTypeDistribution])
def get_event_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get distribution of event types."""
    return AnalyticsService.get_event_distribution(db)


@router.get("/top-users", response_model=List[UserActivity])
def get_top_users(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
) -> Any:
    """Get most active users. (Admin only)"""
    return AnalyticsService.get_top_users(db, limit=limit)
