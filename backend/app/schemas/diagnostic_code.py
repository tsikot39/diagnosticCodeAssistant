"""
Pydantic schemas for Diagnostic Code.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class DiagnosticCodeBase(BaseModel):
    """Base schema for Diagnostic Code."""
    
    code: str = Field(..., min_length=1, max_length=50, description="Diagnostic code")
    description: str = Field(..., min_length=1, description="Code description")
    category: Optional[str] = Field(None, max_length=100, description="Code category")
    subcategory: Optional[str] = Field(None, max_length=100, description="Code subcategory")
    severity: Optional[str] = Field(None, description="Severity level")
    is_active: bool = Field(True, description="Whether the code is active")


class DiagnosticCodeCreate(DiagnosticCodeBase):
    """Schema for creating a new Diagnostic Code."""
    pass


class DiagnosticCodeUpdate(BaseModel):
    """Schema for updating a Diagnostic Code."""
    
    description: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    severity: Optional[str] = None
    is_active: Optional[bool] = None


class DiagnosticCodeResponse(DiagnosticCodeBase):
    """Schema for Diagnostic Code response."""
    
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DiagnosticCodeList(BaseModel):
    """Schema for list of Diagnostic Codes."""
    
    total: int
    items: List[DiagnosticCodeResponse]
    skip: int
    limit: int
