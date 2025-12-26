"""
Analytics service for tracking and aggregating user activity.
"""
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy import func, desc, and_
from sqlalchemy.orm import Session

from app.models.analytics import AnalyticsEvent
from app.models.diagnostic_code import DiagnosticCode
from app.models.user import User
from app.schemas.analytics import (
    ActivityStats,
    PopularCode,
    EventTypeDistribution,
    UserActivity,
    AnalyticsSummary,
    AnalyticsEventResponse
)


class AnalyticsService:
    """Service for analytics operations."""

    @staticmethod
    def track_event(
        db: Session,
        event_type: str,
        event_category: str,
        user_id: Optional[int] = None,
        resource_id: Optional[int] = None,
        metadata: Optional[dict] = None
    ) -> AnalyticsEvent:
        """Track a new analytics event."""
        event = AnalyticsEvent(
            user_id=user_id,
            event_type=event_type,
            event_category=event_category,
            resource_id=resource_id,
            extra_data=metadata
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    @staticmethod
    def get_activity_stats(db: Session) -> ActivityStats:
        """Get overall activity statistics."""
        now = datetime.utcnow()
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)

        total_events = db.query(func.count(AnalyticsEvent.id)).scalar() or 0
        events_today = db.query(func.count(AnalyticsEvent.id)).filter(
            AnalyticsEvent.created_at >= today
        ).scalar() or 0
        events_this_week = db.query(func.count(AnalyticsEvent.id)).filter(
            AnalyticsEvent.created_at >= week_ago
        ).scalar() or 0
        events_this_month = db.query(func.count(AnalyticsEvent.id)).filter(
            AnalyticsEvent.created_at >= month_ago
        ).scalar() or 0
        unique_users = db.query(func.count(func.distinct(AnalyticsEvent.user_id))).filter(
            AnalyticsEvent.user_id.isnot(None)
        ).scalar() or 0

        return ActivityStats(
            total_events=total_events,
            events_today=events_today,
            events_this_week=events_this_week,
            events_this_month=events_this_month,
            unique_users=unique_users
        )

    @staticmethod
    def get_popular_codes(db: Session, limit: int = 10) -> List[PopularCode]:
        """Get most viewed diagnostic codes."""
        results = db.query(
            DiagnosticCode.id,
            DiagnosticCode.code,
            DiagnosticCode.description,
            func.count(AnalyticsEvent.id).label('view_count')
        ).join(
            AnalyticsEvent,
            and_(
                AnalyticsEvent.resource_id == DiagnosticCode.id,
                AnalyticsEvent.event_category == 'diagnostic_code',
                AnalyticsEvent.event_type == 'view'
            )
        ).group_by(
            DiagnosticCode.id,
            DiagnosticCode.code,
            DiagnosticCode.description
        ).order_by(
            desc('view_count')
        ).limit(limit).all()

        return [
            PopularCode(
                code_id=r.id,
                code=r.code,
                description=r.description,
                view_count=r.view_count
            )
            for r in results
        ]

    @staticmethod
    def get_event_distribution(db: Session) -> List[EventTypeDistribution]:
        """Get distribution of event types."""
        results = db.query(
            AnalyticsEvent.event_type,
            func.count(AnalyticsEvent.id).label('count')
        ).group_by(
            AnalyticsEvent.event_type
        ).order_by(
            desc('count')
        ).all()

        return [
            EventTypeDistribution(event_type=r.event_type, count=r.count)
            for r in results
        ]

    @staticmethod
    def get_recent_events(db: Session, limit: int = 20) -> List[AnalyticsEventResponse]:
        """Get recent analytics events."""
        events = db.query(AnalyticsEvent).order_by(
            desc(AnalyticsEvent.created_at)
        ).limit(limit).all()

        return [AnalyticsEventResponse.model_validate(event) for event in events]

    @staticmethod
    def get_top_users(db: Session, limit: int = 10) -> List[UserActivity]:
        """Get most active users."""
        results = db.query(
            User.id,
            User.username,
            User.email,
            func.count(AnalyticsEvent.id).label('event_count'),
            func.max(AnalyticsEvent.created_at).label('last_activity')
        ).join(
            AnalyticsEvent,
            AnalyticsEvent.user_id == User.id
        ).group_by(
            User.id,
            User.username,
            User.email
        ).order_by(
            desc('event_count')
        ).limit(limit).all()

        return [
            UserActivity(
                user_id=r.id,
                username=r.username,
                email=r.email,
                event_count=r.event_count,
                last_activity=r.last_activity
            )
            for r in results
        ]

    @staticmethod
    def get_analytics_summary(db: Session) -> AnalyticsSummary:
        """Get complete analytics summary."""
        return AnalyticsSummary(
            activity_stats=AnalyticsService.get_activity_stats(db),
            popular_codes=AnalyticsService.get_popular_codes(db),
            event_distribution=AnalyticsService.get_event_distribution(db),
            recent_events=AnalyticsService.get_recent_events(db),
            top_users=AnalyticsService.get_top_users(db)
        )
