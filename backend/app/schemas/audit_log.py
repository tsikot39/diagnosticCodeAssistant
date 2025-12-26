"""
Audit log schemas for request/response validation.
"""
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    """Audit log response schema."""
    id: int
    user_id: Optional[int] = None
    action: str
    resource_type: str
    resource_id: Optional[int] = None
    changes: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AuditLogFilter(BaseModel):
    """Filter for audit log queries."""
    user_id: Optional[int] = None
    action: Optional[str] = None
    resource_type: Optional[str] = None
    resource_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class AuditLogList(BaseModel):
    """Paginated audit log list."""
    items: List[AuditLogResponse]
    total: int
    skip: int
    limit: int
