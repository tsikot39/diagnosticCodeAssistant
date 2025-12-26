"""
Pydantic schemas for organization endpoints.
"""
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, validator
import re


class OrganizationBase(BaseModel):
    """Base schema for organization."""
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=50, pattern=r'^[a-z0-9-]+$')
    description: Optional[str] = None
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    website: Optional[str] = Field(None, max_length=255)
    settings: Optional[Dict[str, Any]] = None
    
    @validator('slug')
    def validate_slug(cls, v):
        if not re.match(r'^[a-z0-9-]+$', v):
            raise ValueError('Slug must contain only lowercase letters, numbers, and hyphens')
        return v


class OrganizationCreate(OrganizationBase):
    """Schema for creating an organization."""
    max_users: int = Field(10, ge=1, le=1000, description="Maximum number of users")
    max_codes: int = Field(10000, ge=1, le=1000000, description="Maximum number of codes")


class OrganizationUpdate(BaseModel):
    """Schema for updating an organization."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    website: Optional[str] = Field(None, max_length=255)
    settings: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    max_users: Optional[int] = Field(None, ge=1, le=1000)
    max_codes: Optional[int] = Field(None, ge=1, le=1000000)


class OrganizationResponse(OrganizationBase):
    """Response schema for organization."""
    id: int
    is_active: bool
    max_users: int
    max_codes: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class OrganizationList(BaseModel):
    """Response schema for list of organizations."""
    organizations: list[OrganizationResponse]
    total: int


class OrganizationStats(BaseModel):
    """Response schema for organization statistics."""
    organization_id: int
    user_count: int
    code_count: int
    active_user_count: int
    inactive_code_count: int
    max_users: int
    max_codes: int
    users_remaining: int
    codes_remaining: int
