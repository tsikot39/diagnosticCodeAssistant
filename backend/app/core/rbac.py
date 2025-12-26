"""
RBAC middleware and dependencies.
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_active_user
from app.db.database import get_db
from app.models.user import User


class RoleChecker:
    """Dependency to check user roles."""
    
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles
    
    def __call__(self, current_user: User = Depends(get_current_active_user)) -> User:
        """Check if user has required role."""
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied. Required roles: {', '.join(self.allowed_roles)}"
            )
        return current_user


# Common role dependencies
require_admin = RoleChecker(["admin"])
require_manager = RoleChecker(["admin", "manager"])
require_editor = RoleChecker(["admin", "manager", "user"])
require_viewer = RoleChecker(["admin", "manager", "user", "viewer"])
