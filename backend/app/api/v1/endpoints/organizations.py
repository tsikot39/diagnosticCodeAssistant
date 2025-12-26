"""
API endpoints for organization management.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_active_user
from app.core.rbac import RoleChecker
from app.db.database import get_db
from app.models.user import User
from app.services.organization_service import OrganizationService
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse,
    OrganizationList,
    OrganizationStats
)

router = APIRouter()
allow_admin = RoleChecker(["admin"])


@router.post("", response_model=OrganizationResponse, status_code=201)
def create_organization(
    org_data: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin)
):
    """
    Create a new organization.
    
    **Admin only.** Organizations provide data isolation for multi-tenancy.
    Each organization has its own users, diagnostic codes, and settings.
    
    **Slug Requirements:**
    - Lowercase letters, numbers, and hyphens only
    - Must be unique across all organizations
    - Used in URLs and API calls
    """
    # Check if slug already exists
    existing_org = OrganizationService.get_organization_by_slug(db, org_data.slug)
    if existing_org:
        raise HTTPException(
            status_code=400,
            detail=f"Organization with slug '{org_data.slug}' already exists"
        )
    
    organization = OrganizationService.create_organization(db, org_data)
    return organization


@router.get("", response_model=OrganizationList)
def get_organizations(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin)
):
    """
    Get list of all organizations.
    
    **Admin only.** Returns paginated list of organizations with filtering options.
    """
    organizations, total = OrganizationService.get_organizations(
        db=db,
        is_active=is_active,
        skip=skip,
        limit=limit
    )
    
    return OrganizationList(organizations=organizations, total=total)


@router.get("/{org_id}", response_model=OrganizationResponse)
def get_organization(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific organization by ID.
    
    Users can only view their own organization unless they're admin.
    """
    organization = OrganizationService.get_organization_by_id(db, org_id)
    
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Check permission (own org or admin)
    if current_user.organization_id != org_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this organization")
    
    return organization


@router.get("/slug/{slug}", response_model=OrganizationResponse)
def get_organization_by_slug(
    slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin)
):
    """
    Get an organization by slug.
    
    **Admin only.** Useful for looking up organizations by their URL-friendly identifier.
    """
    organization = OrganizationService.get_organization_by_slug(db, slug)
    
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    return organization


@router.put("/{org_id}", response_model=OrganizationResponse)
def update_organization(
    org_id: int,
    org_data: OrganizationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin)
):
    """
    Update an organization.
    
    **Admin only.** Update organization details, settings, or limits.
    """
    updated_org = OrganizationService.update_organization(db, org_id, org_data)
    
    if not updated_org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    return updated_org


@router.delete("/{org_id}", status_code=204)
def delete_organization(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin)
):
    """
    Delete an organization.
    
    **Admin only. Warning:** This will delete all associated users and diagnostic codes.
    Use with extreme caution in production environments.
    """
    success = OrganizationService.delete_organization(db, org_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Organization not found")


@router.get("/{org_id}/stats", response_model=OrganizationStats)
def get_organization_stats(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get statistics for an organization.
    
    Shows usage metrics including:
    - Total users and codes
    - Active vs inactive counts
    - Remaining capacity before limits
    
    Users can only view stats for their own organization unless they're admin.
    """
    # Check permission
    if current_user.organization_id != org_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view these statistics")
    
    stats = OrganizationService.get_organization_stats(db, org_id)
    
    if not stats:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    return stats
