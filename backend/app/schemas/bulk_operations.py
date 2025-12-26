"""
Schemas for bulk import/export operations.
"""
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class BulkCodeImport(BaseModel):
    """Schema for bulk importing diagnostic codes."""
    
    code: str = Field(..., min_length=1, max_length=50)
    description: str = Field(..., min_length=1)
    category: str
    severity: Optional[str] = None
    is_active: bool = True
    extra_data: Optional[dict] = None


class BulkImportRequest(BaseModel):
    """Request schema for bulk import."""
    
    codes: List[BulkCodeImport] = Field(..., min_items=1, max_items=1000)
    skip_duplicates: bool = True
    update_existing: bool = False


class BulkImportResponse(BaseModel):
    """Response schema for bulk import."""
    
    total: int
    created: int
    updated: int
    skipped: int
    errors: List[dict] = []
    
    class Config:
        from_attributes = True


class BulkExportFormat(BaseModel):
    """Schema for export format specification."""
    
    format: str = Field(default="json", pattern="^(json|csv)$")
    include_inactive: bool = False
    category: Optional[str] = None
    severity: Optional[str] = None
