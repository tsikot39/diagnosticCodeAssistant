"""
Audit logging service.
"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, desc

from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogResponse, AuditLogFilter


class AuditService:
    """Service for audit logging operations."""

    @staticmethod
    async def log_action(
        db: Session,
        action: str,
        resource_type: str,
        user_id: Optional[int] = None,
        resource_id: Optional[int] = None,
        changes: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> AuditLog:
        """Create a new audit log entry."""
        from app.services.webhook_service import WebhookService
        
        log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            changes=changes,
            ip_address=ip_address,
            user_agent=user_agent,
            extra_data=metadata
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        
        # Trigger webhook for audit log created
        await WebhookService.trigger_webhooks(
            db=db,
            event="audit.logged",
            payload={
                "id": log.id,
                "action": action,
                "resource_type": resource_type,
                "resource_id": resource_id,
                "user_id": user_id,
                "timestamp": log.created_at.isoformat() if log.created_at else None
            }
        )
        
        return log

    @staticmethod
    def get_logs(
        db: Session,
        filters: AuditLogFilter,
        skip: int = 0,
        limit: int = 100
    ) -> List[AuditLog]:
        """Get audit logs with filters."""
        query = db.query(AuditLog)

        if filters.user_id:
            query = query.filter(AuditLog.user_id == filters.user_id)
        if filters.action:
            query = query.filter(AuditLog.action == filters.action)
        if filters.resource_type:
            query = query.filter(AuditLog.resource_type == filters.resource_type)
        if filters.resource_id:
            query = query.filter(AuditLog.resource_id == filters.resource_id)
        if filters.start_date:
            query = query.filter(AuditLog.created_at >= filters.start_date)
        if filters.end_date:
            query = query.filter(AuditLog.created_at <= filters.end_date)

        return query.order_by(desc(AuditLog.created_at)).offset(skip).limit(limit).all()

    @staticmethod
    def count_logs(db: Session, filters: AuditLogFilter) -> int:
        """Count audit logs with filters."""
        query = db.query(func.count(AuditLog.id))

        if filters.user_id:
            query = query.filter(AuditLog.user_id == filters.user_id)
        if filters.action:
            query = query.filter(AuditLog.action == filters.action)
        if filters.resource_type:
            query = query.filter(AuditLog.resource_type == filters.resource_type)
        if filters.resource_id:
            query = query.filter(AuditLog.resource_id == filters.resource_id)
        if filters.start_date:
            query = query.filter(AuditLog.created_at >= filters.start_date)
        if filters.end_date:
            query = query.filter(AuditLog.created_at <= filters.end_date)

        return query.scalar() or 0

    @staticmethod
    def log_code_create(db: Session, code_id: int, user_id: int, code_data: dict, ip: str = None):
        """Helper to log diagnostic code creation."""
        return AuditService.log_action(
            db=db,
            action="create",
            resource_type="diagnostic_code",
            user_id=user_id,
            resource_id=code_id,
            changes={"new": code_data},
            ip_address=ip
        )

    @staticmethod
    def log_code_update(db: Session, code_id: int, user_id: int, old_data: dict, new_data: dict, ip: str = None):
        """Helper to log diagnostic code updates."""
        return AuditService.log_action(
            db=db,
            action="update",
            resource_type="diagnostic_code",
            user_id=user_id,
            resource_id=code_id,
            changes={"old": old_data, "new": new_data},
            ip_address=ip
        )

    @staticmethod
    def log_code_delete(db: Session, code_id: int, user_id: int, code_data: dict, ip: str = None):
        """Helper to log diagnostic code deletion."""
        return AuditService.log_action(
            db=db,
            action="delete",
            resource_type="diagnostic_code",
            user_id=user_id,
            resource_id=code_id,
            changes={"old": code_data},
            ip_address=ip
        )

    @staticmethod
    def log_login(db: Session, user_id: int, ip: str = None, user_agent: str = None):
        """Helper to log user login."""
        return AuditService.log_action(
            db=db,
            action="login",
            resource_type="user",
            user_id=user_id,
            resource_id=user_id,
            ip_address=ip,
            user_agent=user_agent
        )

    @staticmethod
    def log_logout(db: Session, user_id: int, ip: str = None):
        """Helper to log user logout."""
        return AuditService.log_action(
            db=db,
            action="logout",
            resource_type="user",
            user_id=user_id,
            resource_id=user_id,
            ip_address=ip
        )
