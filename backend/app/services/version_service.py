"""
Service for managing diagnostic code versions.
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.code_version import CodeVersion, CodeComment
from app.models.diagnostic_code import DiagnosticCode
from app.schemas.code_version import CodeCommentCreate, CodeCommentUpdate


class VersionService:
    """Service for version control operations."""
    
    @staticmethod
    def create_version(
        db: Session,
        diagnostic_code: DiagnosticCode,
        change_type: str,
        user_id: int,
        change_summary: Optional[str] = None,
        changed_fields: Optional[List[str]] = None
    ) -> CodeVersion:
        """Create a new version snapshot of a diagnostic code."""
        # Get the current max version number for this code
        max_version = db.query(CodeVersion).filter(
            CodeVersion.diagnostic_code_id == diagnostic_code.id
        ).count()
        
        version = CodeVersion(
            diagnostic_code_id=diagnostic_code.id,
            version_number=max_version + 1,
            code=diagnostic_code.code,
            description=diagnostic_code.description,
            category=diagnostic_code.category,
            severity=diagnostic_code.severity,
            is_active=diagnostic_code.is_active,
            extra_data=diagnostic_code.extra_data,
            change_type=change_type,
            change_summary=change_summary,
            changed_fields=changed_fields,
            created_by=user_id
        )
        
        db.add(version)
        db.commit()
        db.refresh(version)
        return version
    
    @staticmethod
    def get_versions(
        db: Session,
        diagnostic_code_id: int,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[List[CodeVersion], int]:
        """Get version history for a diagnostic code."""
        query = db.query(CodeVersion).filter(
            CodeVersion.diagnostic_code_id == diagnostic_code_id
        ).order_by(desc(CodeVersion.version_number))
        
        total = query.count()
        versions = query.offset(skip).limit(limit).all()
        
        return versions, total
    
    @staticmethod
    def get_version_by_id(db: Session, version_id: int) -> Optional[CodeVersion]:
        """Get a specific version by ID."""
        return db.query(CodeVersion).filter(CodeVersion.id == version_id).first()
    
    @staticmethod
    def compare_versions(
        db: Session,
        version_from_id: int,
        version_to_id: int
    ) -> Optional[Dict[str, Dict[str, Any]]]:
        """Compare two versions and return the differences."""
        version_from = db.query(CodeVersion).filter(CodeVersion.id == version_from_id).first()
        version_to = db.query(CodeVersion).filter(CodeVersion.id == version_to_id).first()
        
        if not version_from or not version_to:
            return None
        
        # Compare fields
        differences = {}
        fields_to_compare = ['code', 'description', 'category', 'severity', 'is_active', 'metadata']
        
        for field in fields_to_compare:
            old_value = getattr(version_from, field)
            new_value = getattr(version_to, field)
            
            if old_value != new_value:
                differences[field] = {
                    'old': old_value,
                    'new': new_value
                }
        
        return differences
    
    @staticmethod
    def restore_version(
        db: Session,
        diagnostic_code_id: int,
        version_id: int,
        user_id: int,
        comment: Optional[str] = None
    ) -> Optional[DiagnosticCode]:
        """Restore a diagnostic code to a previous version."""
        # Get the version to restore
        version = db.query(CodeVersion).filter(CodeVersion.id == version_id).first()
        if not version or version.diagnostic_code_id != diagnostic_code_id:
            return None
        
        # Get the diagnostic code
        diagnostic_code = db.query(DiagnosticCode).filter(
            DiagnosticCode.id == diagnostic_code_id
        ).first()
        if not diagnostic_code:
            return None
        
        # Track changed fields
        changed_fields = []
        if diagnostic_code.code != version.code:
            changed_fields.append('code')
        if diagnostic_code.description != version.description:
            changed_fields.append('description')
        if diagnostic_code.category != version.category:
            changed_fields.append('category')
        if diagnostic_code.severity != version.severity:
            changed_fields.append('severity')
        if diagnostic_code.is_active != version.is_active:
            changed_fields.append('is_active')
        if diagnostic_code.metadata != version.metadata:
            changed_fields.append('metadata')
        
        # Restore the code to the version state
        diagnostic_code.code = version.code
        diagnostic_code.description = version.description
        diagnostic_code.category = version.category
        diagnostic_code.severity = version.severity
        diagnostic_code.is_active = version.is_active
        diagnostic_code.metadata = version.metadata
        
        db.commit()
        db.refresh(diagnostic_code)
        
        # Create a new version entry for the restore
        restore_summary = f"Restored to version {version.version_number}"
        if comment:
            restore_summary += f": {comment}"
        
        VersionService.create_version(
            db=db,
            diagnostic_code=diagnostic_code,
            change_type="RESTORE",
            user_id=user_id,
            change_summary=restore_summary,
            changed_fields=changed_fields
        )
        
        return diagnostic_code
    
    # Comment methods
    @staticmethod
    def create_comment(
        db: Session,
        diagnostic_code_id: int,
        user_id: int,
        comment_data: CodeCommentCreate
    ) -> CodeComment:
        """Create a comment on a diagnostic code or specific version."""
        comment = CodeComment(
            diagnostic_code_id=diagnostic_code_id,
            version_id=comment_data.version_id,
            content=comment_data.content,
            created_by=user_id
        )
        
        db.add(comment)
        db.commit()
        db.refresh(comment)
        return comment
    
    @staticmethod
    def get_comments(
        db: Session,
        diagnostic_code_id: int,
        version_id: Optional[int] = None,
        include_resolved: bool = True,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[List[CodeComment], int, int]:
        """Get comments for a diagnostic code, optionally filtered by version."""
        query = db.query(CodeComment).filter(
            CodeComment.diagnostic_code_id == diagnostic_code_id
        )
        
        if version_id is not None:
            query = query.filter(CodeComment.version_id == version_id)
        
        if not include_resolved:
            query = query.filter(CodeComment.is_resolved == False)
        
        query = query.order_by(desc(CodeComment.created_at))
        
        total = query.count()
        unresolved_count = db.query(CodeComment).filter(
            CodeComment.diagnostic_code_id == diagnostic_code_id,
            CodeComment.is_resolved == False
        ).count()
        
        comments = query.offset(skip).limit(limit).all()
        
        return comments, total, unresolved_count
    
    @staticmethod
    def update_comment(
        db: Session,
        comment_id: int,
        user_id: int,
        comment_data: CodeCommentUpdate
    ) -> Optional[CodeComment]:
        """Update a comment (only by the creator)."""
        comment = db.query(CodeComment).filter(CodeComment.id == comment_id).first()
        if not comment or comment.created_by != user_id:
            return None
        
        if comment_data.content is not None:
            comment.content = comment_data.content
        if comment_data.is_resolved is not None:
            comment.is_resolved = comment_data.is_resolved
        
        db.commit()
        db.refresh(comment)
        return comment
    
    @staticmethod
    def delete_comment(db: Session, comment_id: int, user_id: int) -> bool:
        """Delete a comment (only by the creator or admin)."""
        comment = db.query(CodeComment).filter(CodeComment.id == comment_id).first()
        if not comment or comment.created_by != user_id:
            return False
        
        db.delete(comment)
        db.commit()
        return True
