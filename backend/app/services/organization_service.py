"""
Service for managing organizations (multi-tenancy).
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.models.organization import Organization
from app.models.user import User
from app.models.diagnostic_code import DiagnosticCode
from app.schemas.organization import OrganizationCreate, OrganizationUpdate


class OrganizationService:
    """Service for organization operations."""
    
    @staticmethod
    def create_organization(
        db: Session,
        org_data: OrganizationCreate
    ) -> Organization:
        """Create a new organization."""
        organization = Organization(
            name=org_data.name,
            slug=org_data.slug,
            description=org_data.description,
            email=org_data.email,
            phone=org_data.phone,
            website=org_data.website,
            settings=org_data.settings,
            max_users=org_data.max_users,
            max_codes=org_data.max_codes
        )
        
        db.add(organization)
        db.commit()
        db.refresh(organization)
        return organization
    
    @staticmethod
    def get_organizations(
        db: Session,
        is_active: Optional[bool] = None,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[List[Organization], int]:
        """Get list of organizations."""
        query = db.query(Organization)
        
        if is_active is not None:
            query = query.filter(Organization.is_active == is_active)
        
        total = query.count()
        organizations = query.order_by(desc(Organization.created_at)).offset(skip).limit(limit).all()
        
        return organizations, total
    
    @staticmethod
    def get_organization_by_id(db: Session, org_id: int) -> Optional[Organization]:
        """Get an organization by ID."""
        return db.query(Organization).filter(Organization.id == org_id).first()
    
    @staticmethod
    def get_organization_by_slug(db: Session, slug: str) -> Optional[Organization]:
        """Get an organization by slug."""
        return db.query(Organization).filter(Organization.slug == slug).first()
    
    @staticmethod
    def update_organization(
        db: Session,
        org_id: int,
        org_data: OrganizationUpdate
    ) -> Optional[Organization]:
        """Update an organization."""
        organization = db.query(Organization).filter(Organization.id == org_id).first()
        if not organization:
            return None
        
        update_data = org_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(organization, field, value)
        
        db.commit()
        db.refresh(organization)
        return organization
    
    @staticmethod
    def delete_organization(db: Session, org_id: int) -> bool:
        """Delete an organization."""
        organization = db.query(Organization).filter(Organization.id == org_id).first()
        if not organization:
            return False
        
        db.delete(organization)
        db.commit()
        return True
    
    @staticmethod
    def get_organization_stats(db: Session, org_id: int) -> Optional[dict]:
        """Get statistics for an organization."""
        organization = db.query(Organization).filter(Organization.id == org_id).first()
        if not organization:
            return None
        
        user_count = db.query(func.count(User.id)).filter(User.organization_id == org_id).scalar()
        active_user_count = db.query(func.count(User.id)).filter(
            User.organization_id == org_id,
            User.is_active == True
        ).scalar()
        
        code_count = db.query(func.count(DiagnosticCode.id)).filter(
            DiagnosticCode.organization_id == org_id
        ).scalar()
        inactive_code_count = db.query(func.count(DiagnosticCode.id)).filter(
            DiagnosticCode.organization_id == org_id,
            DiagnosticCode.is_active == False
        ).scalar()
        
        return {
            'organization_id': org_id,
            'user_count': user_count or 0,
            'code_count': code_count or 0,
            'active_user_count': active_user_count or 0,
            'inactive_code_count': inactive_code_count or 0,
            'max_users': organization.max_users,
            'max_codes': organization.max_codes,
            'users_remaining': organization.max_users - (user_count or 0),
            'codes_remaining': organization.max_codes - (code_count or 0)
        }
    
    @staticmethod
    def check_user_limit(db: Session, org_id: int) -> tuple[bool, Optional[str]]:
        """Check if organization has reached user limit."""
        organization = db.query(Organization).filter(Organization.id == org_id).first()
        if not organization:
            return False, "Organization not found"
        
        user_count = db.query(func.count(User.id)).filter(User.organization_id == org_id).scalar()
        if (user_count or 0) >= organization.max_users:
            return False, f"Organization has reached maximum user limit of {organization.max_users}"
        return True, None
    
    @staticmethod
    def check_code_limit(db: Session, org_id: int) -> tuple[bool, Optional[str]]:
        """Check if organization has reached code limit."""
        organization = db.query(Organization).filter(Organization.id == org_id).first()
        if not organization:
            return False, "Organization not found"
        
        code_count = db.query(func.count(DiagnosticCode.id)).filter(
            DiagnosticCode.organization_id == org_id
        ).scalar()
        if (code_count or 0) >= organization.max_codes:
            return False, f"Organization has reached maximum code limit of {organization.max_codes}"
        return True, None
