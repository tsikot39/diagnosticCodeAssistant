"""
Audit log endpoints.
"""
from typing import Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_active_user, get_current_superuser
from app.db.database import get_db
from app.models.user import User
from app.services.audit_service import AuditService
from app.schemas.audit_log import AuditLogList, AuditLogFilter

router = APIRouter()


@router.get("/", response_model=AuditLogList)
def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
) -> Any:
    """Get audit logs (Admin only)."""
    filters = AuditLogFilter(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id
    )
    
    logs = AuditService.get_logs(db, filters, skip, limit)
    total = AuditService.count_logs(db, filters)
    
    return {
        "items": logs,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/me", response_model=AuditLogList)
def get_my_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get current user's audit logs."""
    filters = AuditLogFilter(
        user_id=current_user.id,
        action=action,
        resource_type=resource_type
    )
    
    logs = AuditService.get_logs(db, filters, skip, limit)
    total = AuditService.count_logs(db, filters)
    
    return {
        "items": logs,
        "total": total,
        "skip": skip,
        "limit": limit
    }
