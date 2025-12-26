"""
Pydantic schemas for code version endpoints.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class CodeVersionBase(BaseModel):
    """Base schema for code version."""
    code: str
    description: str
    category: Optional[str] = None
    severity: Optional[str] = None
    is_active: bool = True
    metadata: Optional[Dict[str, Any]] = None


class CodeVersionResponse(CodeVersionBase):
    """Response schema for code version."""
    id: int
    diagnostic_code_id: int
    version_number: int
    change_type: str
    change_summary: Optional[str] = None
    changed_fields: Optional[List[str]] = None
    created_by: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class CodeVersionList(BaseModel):
    """Response schema for list of versions."""
    versions: List[CodeVersionResponse]
    total: int
    code_id: int
    current_version: int


class CodeVersionCompare(BaseModel):
    """Response schema for comparing two versions."""
    code_id: int
    version_from: CodeVersionResponse
    version_to: CodeVersionResponse
    differences: Dict[str, Dict[str, Any]]  # field_name: {old: value, new: value}


class CodeCommentBase(BaseModel):
    """Base schema for code comment."""
    content: str = Field(..., min_length=1, max_length=5000)


class CodeCommentCreate(CodeCommentBase):
    """Schema for creating a comment."""
    version_id: Optional[int] = None


class CodeCommentUpdate(BaseModel):
    """Schema for updating a comment."""
    content: Optional[str] = Field(None, min_length=1, max_length=5000)
    is_resolved: Optional[bool] = None


class CodeCommentResponse(CodeCommentBase):
    """Response schema for code comment."""
    id: int
    diagnostic_code_id: int
    version_id: Optional[int] = None
    is_resolved: bool
    created_by: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CodeCommentList(BaseModel):
    """Response schema for list of comments."""
    comments: List[CodeCommentResponse]
    total: int
    unresolved_count: int


class RestoreVersionRequest(BaseModel):
    """Request schema for restoring a version."""
    version_id: int
    comment: Optional[str] = Field(None, max_length=500, description="Optional comment explaining the restore")
