"""
Audit logging service for tracking changes.
"""
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import Request
from datetime import datetime
import uuid

from app.models.audit_log import AuditLog, AuditAction
from app.models.user import User


class AuditLogger:
    """Service for logging audit events."""
    
    def __init__(self, db: Session, request: Optional[Request] = None):
        self.db = db
        self.request = request
        self.request_id = str(uuid.uuid4())
    
    def _get_client_ip(self) -> Optional[str]:
        """Extract client IP from request."""
        if not self.request:
            return None
        
        # Check for X-Forwarded-For header (proxy/load balancer)
        if forwarded := self.request.headers.get("X-Forwarded-For"):
            return forwarded.split(",")[0].strip()
        
        # Check for X-Real-IP header
        if real_ip := self.request.headers.get("X-Real-IP"):
            return real_ip
        
        # Fallback to client host
        if self.request.client:
            return self.request.client.host
        
        return None
    
    def _get_user_agent(self) -> Optional[str]:
        """Extract user agent from request."""
        if not self.request:
            return None
        return self.request.headers.get("User-Agent")
    
    def log(
        self,
        user: User,
        action: AuditAction,
        entity_type: str,
        entity_id: Optional[int] = None,
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None,
        affected_count: int = 1
    ) -> AuditLog:
        """
        Log an audit event.
        
        Args:
            user: The user performing the action
            action: Type of action (create, update, delete, etc.)
            entity_type: Type of entity being modified
            entity_id: ID of the entity (None for bulk operations)
            old_values: Previous state of the entity
            new_values: New state of the entity
            affected_count: Number of entities affected (for bulk operations)
        """
        # Calculate changes (only for updates)
        changes = None
        if action == AuditAction.UPDATE and old_values and new_values:
            changes = {
                key: {"old": old_values.get(key), "new": new_values.get(key)}
                for key in new_values
                if old_values.get(key) != new_values.get(key)
            }
        
        # Create audit log entry
        audit_log = AuditLog(
            user_id=user.id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            old_values=old_values,
            new_values=new_values,
            changes=changes,
            ip_address=self._get_client_ip(),
            user_agent=self._get_user_agent(),
            request_id=self.request_id,
            affected_count=affected_count,
            created_at=datetime.utcnow()
        )
        
        self.db.add(audit_log)
        self.db.commit()
        self.db.refresh(audit_log)
        
        return audit_log
    
    def log_create(
        self,
        user: User,
        entity_type: str,
        entity_id: int,
        new_values: Dict[str, Any]
    ) -> AuditLog:
        """Log entity creation."""
        return self.log(
            user=user,
            action=AuditAction.CREATE,
            entity_type=entity_type,
            entity_id=entity_id,
            new_values=new_values
        )
    
    def log_update(
        self,
        user: User,
        entity_type: str,
        entity_id: int,
        old_values: Dict[str, Any],
        new_values: Dict[str, Any]
    ) -> AuditLog:
        """Log entity update."""
        return self.log(
            user=user,
            action=AuditAction.UPDATE,
            entity_type=entity_type,
            entity_id=entity_id,
            old_values=old_values,
            new_values=new_values
        )
    
    def log_delete(
        self,
        user: User,
        entity_type: str,
        entity_id: int,
        old_values: Dict[str, Any]
    ) -> AuditLog:
        """Log entity deletion."""
        return self.log(
            user=user,
            action=AuditAction.DELETE,
            entity_type=entity_type,
            entity_id=entity_id,
            old_values=old_values
        )
    
    def log_bulk_operation(
        self,
        user: User,
        action: AuditAction,
        entity_type: str,
        affected_count: int,
        details: Optional[Dict[str, Any]] = None
    ) -> AuditLog:
        """Log bulk operations."""
        return self.log(
            user=user,
            action=action,
            entity_type=entity_type,
            entity_id=None,
            new_values=details,
            affected_count=affected_count
        )
