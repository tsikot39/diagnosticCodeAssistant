"""
API endpoints for diagnostic code version control.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_active_user
from app.core.rbac import RoleChecker
from app.db.database import get_db
from app.models.user import User
from app.services.version_service import VersionService
from app.services.webhook_service import WebhookService
from app.schemas.code_version import (
    CodeVersionResponse,
    CodeVersionList,
    CodeVersionCompare,
    CodeCommentCreate,
    CodeCommentUpdate,
    CodeCommentResponse,
    CodeCommentList,
    RestoreVersionRequest
)

router = APIRouter()
allow_viewer = RoleChecker(["viewer", "user", "manager", "admin"])
allow_user = RoleChecker(["user", "manager", "admin"])
allow_admin = RoleChecker(["admin"])


@router.get("/{code_id}/history", response_model=CodeVersionList)
def get_code_history(
    code_id: int,
    skip: int = Query(0, ge=0, description="Number of versions to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of versions to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_viewer)
):
    """
    Get version history for a diagnostic code.
    
    Returns a paginated list of all versions, ordered from newest to oldest.
    Each version represents a snapshot of the code at a specific point in time.
    """
    versions, total = VersionService.get_versions(db, code_id, skip, limit)
    
    if total == 0:
        raise HTTPException(status_code=404, detail="No version history found for this code")
    
    current_version = versions[0].version_number if versions else 0
    
    return CodeVersionList(
        versions=versions,
        total=total,
        code_id=code_id,
        current_version=current_version
    )


@router.get("/{code_id}/history/{version_id}", response_model=CodeVersionResponse)
def get_version(
    code_id: int,
    version_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_viewer)
):
    """
    Get a specific version by ID.
    
    Returns the complete snapshot of the diagnostic code at this version.
    """
    version = VersionService.get_version_by_id(db, version_id)
    
    if not version or version.diagnostic_code_id != code_id:
        raise HTTPException(status_code=404, detail="Version not found")
    
    return version


@router.get("/{code_id}/compare", response_model=CodeVersionCompare)
def compare_versions(
    code_id: int,
    from_version: int = Query(..., description="Version ID to compare from"),
    to_version: int = Query(..., description="Version ID to compare to"),
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_viewer)
):
    """
    Compare two versions of a diagnostic code.
    
    Returns the differences between two versions, showing what fields changed
    and their old/new values.
    """
    version_from = VersionService.get_version_by_id(db, from_version)
    version_to = VersionService.get_version_by_id(db, to_version)
    
    if not version_from or not version_to:
        raise HTTPException(status_code=404, detail="One or both versions not found")
    
    if version_from.diagnostic_code_id != code_id or version_to.diagnostic_code_id != code_id:
        raise HTTPException(status_code=400, detail="Versions must belong to the specified code")
    
    differences = VersionService.compare_versions(db, from_version, to_version)
    
    return CodeVersionCompare(
        code_id=code_id,
        version_from=version_from,
        version_to=version_to,
        differences=differences
    )


@router.post("/{code_id}/restore", response_model=CodeVersionResponse)
async def restore_version(
    code_id: int,
    restore_data: RestoreVersionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_user)
):
    """
    Restore a diagnostic code to a previous version.
    
    Creates a new version entry marking this as a RESTORE operation.
    Requires user role or higher.
    """
    restored_code = VersionService.restore_version(
        db=db,
        diagnostic_code_id=code_id,
        version_id=restore_data.version_id,
        user_id=current_user.id,
        comment=restore_data.comment
    )
    
    if not restored_code:
        raise HTTPException(status_code=404, detail="Code or version not found")
    
    # Get the newly created restore version
    versions, _ = VersionService.get_versions(db, code_id, skip=0, limit=1)
    
    # Trigger webhook for restore event
    if versions:
        await WebhookService.trigger_webhooks(
            db=db,
            event="code.restored",
            payload={
                "code_id": code_id,
                "version_id": restore_data.version_id,
                "new_version_number": versions[0].version_number,
                "user_id": current_user.id,
                "comment": restore_data.comment
            }
        )
    
    return versions[0] if versions else None


# Comment endpoints
@router.post("/{code_id}/comments", response_model=CodeCommentResponse)
async def create_comment(
    code_id: int,
    comment_data: CodeCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_viewer)
):
    """
    Add a comment to a diagnostic code or specific version.
    
    Comments can be used for discussion, notes, or tracking issues.
    Can be attached to the code in general or a specific version.
    """
    comment = VersionService.create_comment(
        db=db,
        diagnostic_code_id=code_id,
        user_id=current_user.id,
        comment_data=comment_data
    )
    
    # Trigger webhook for comment creation
    await WebhookService.trigger_webhooks(
        db=db,
        event="comment.created",
        payload={
            "id": comment.id,
            "code_id": code_id,
            "version_id": comment_data.version_id if comment_data.version_id else None,
            "user_id": current_user.id,
            "content": comment_data.content
        }
    )
    
    return comment


@router.get("/{code_id}/comments", response_model=CodeCommentList)
def get_comments(
    code_id: int,
    version_id: Optional[int] = Query(None, description="Filter by specific version"),
    include_resolved: bool = Query(True, description="Include resolved comments"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_viewer)
):
    """
    Get comments for a diagnostic code.
    
    Can filter by specific version and whether to include resolved comments.
    """
    comments, total, unresolved_count = VersionService.get_comments(
        db=db,
        diagnostic_code_id=code_id,
        version_id=version_id,
        include_resolved=include_resolved,
        skip=skip,
        limit=limit
    )
    
    return CodeCommentList(
        comments=comments,
        total=total,
        unresolved_count=unresolved_count
    )


@router.put("/comments/{comment_id}", response_model=CodeCommentResponse)
def update_comment(
    comment_id: int,
    comment_data: CodeCommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_viewer)
):
    """
    Update a comment (only by the creator).
    
    Can update the content and/or mark as resolved.
    """
    updated_comment = VersionService.update_comment(
        db=db,
        comment_id=comment_id,
        user_id=current_user.id,
        comment_data=comment_data
    )
    
    if not updated_comment:
        raise HTTPException(status_code=404, detail="Comment not found or unauthorized")
    
    return updated_comment


@router.delete("/comments/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_viewer)
):
    """
    Delete a comment (only by the creator).
    """
    success = VersionService.delete_comment(
        db=db,
        comment_id=comment_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Comment not found or unauthorized")
    
    return {"message": "Comment deleted successfully"}
