"""
Business logic for Diagnostic Code operations.
"""
from typing import List, Optional
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import or_, func, text

from app.models.diagnostic_code import DiagnosticCode
from app.schemas.diagnostic_code import DiagnosticCodeCreate, DiagnosticCodeUpdate
from app.core.cache import cache
from app.core.config import Settings

settings = Settings()


class DiagnosticCodeService:
    """Service for managing diagnostic codes."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def _get_cache_key(self, prefix: str, **kwargs) -> str:
        """Generate cache key from parameters."""
        key_parts = [prefix]
        for k, v in sorted(kwargs.items()):
            if v is not None:
                key_parts.append(f"{k}:{v}")
        return ":".join(key_parts)
    
    def get_codes(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        category: Optional[str] = None,
        severity: Optional[str] = None,
        is_active: Optional[bool] = None,
        organization_id: Optional[int] = None,
    ) -> List[DiagnosticCode]:
        """Get list of diagnostic codes with optional filters."""
        # Try cache first
        cache_key = self._get_cache_key(
            "codes:list",
            skip=skip,
            limit=limit,
            search=search,
            category=category,
            severity=severity,
            is_active=is_active,
            organization_id=organization_id
        )
        
        cached = cache.get(cache_key)
        if cached is not None:
            # Convert dict back to DiagnosticCode objects
            return [DiagnosticCode(**item) for item in cached]
        
        # Query database with optimizations
        # Eager load relationships to prevent N+1 queries
        query = self.db.query(DiagnosticCode).options(
            selectinload(DiagnosticCode.organization)
        )
        
        # Apply filters (uses indexes for optimal performance)
        if search:
            # Use full-text search for description (utilizes GIN index on description_tsv)
            # For code search, use ILIKE with pattern matching (utilizes index on code)
            search_pattern = f"%{search}%"
            
            # Convert search term to tsquery format (handle spaces and special chars)
            search_tsquery = " & ".join(search.split())
            
            query = query.filter(
                or_(
                    DiagnosticCode.code.ilike(search_pattern),
                    # Full-text search on description using tsvector (much faster for text search)
                    text("description_tsv @@ to_tsquery('english', :search_term)")
                )
            ).params(search_term=search_tsquery)
        
        if category:
            # Utilizes idx_diagnostic_codes_category
            query = query.filter(DiagnosticCode.category == category)
        
        if severity:
            # Utilizes idx_diagnostic_codes_severity
            query = query.filter(DiagnosticCode.severity == severity)
        
        if is_active is not None:
            # Utilizes idx_diagnostic_codes_is_active
            query = query.filter(DiagnosticCode.is_active == is_active)
        
        # Organization filtering for multi-tenancy
        # Utilizes idx_diagnostic_codes_organization_id
        if organization_id is not None:
            query = query.filter(DiagnosticCode.organization_id == organization_id)
        
        # Order by indexed column for better performance
        query = query.order_by(DiagnosticCode.id)
        
        results = query.offset(skip).limit(limit).all()
        
        # Cache results (convert to dict for JSON serialization)
        cache_data = [
            {
                "id": item.id,
                "code": item.code,
                "description": item.description,
                "category": item.category,
                "subcategory": item.subcategory,
                "severity": item.severity,
                "is_active": item.is_active,
                "created_at": item.created_at.isoformat() if item.created_at else None,
                "updated_at": item.updated_at.isoformat() if item.updated_at else None,
            }
            for item in results
        ]
        cache.set(cache_key, cache_data, ttl=settings.CACHE_TTL)
        
        return results
    
    def count_codes(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        severity: Optional[str] = None,
        is_active: Optional[bool] = None,
        organization_id: Optional[int] = None,
    ) -> int:
        """Count diagnostic codes with optional filters."""
        query = self.db.query(func.count(DiagnosticCode.id))
        
        # Apply same filters as get_codes
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    DiagnosticCode.code.ilike(search_pattern),
                    DiagnosticCode.description.ilike(search_pattern),
                )
            )
        
        if category:
            query = query.filter(DiagnosticCode.category == category)
        
        if severity:
            query = query.filter(DiagnosticCode.severity == severity)
        
        if is_active is not None:
            query = query.filter(DiagnosticCode.is_active == is_active)
        
        # Organization filtering
        if organization_id is not None:
            query = query.filter(DiagnosticCode.organization_id == organization_id)
        
        return query.scalar()
    
    def get_code_by_id(self, code_id: int, organization_id: Optional[int] = None) -> Optional[DiagnosticCode]:
        """Get diagnostic code by ID."""
        # Try cache first
        cache_key = f"codes:id:{code_id}:org:{organization_id}"
        cached = cache.get(cache_key)
        if cached:
            return DiagnosticCode(**cached)
        
        query = self.db.query(DiagnosticCode).filter(DiagnosticCode.id == code_id)
        
        # Organization filtering
        if organization_id is not None:
            query = query.filter(DiagnosticCode.organization_id == organization_id)
        
        result = query.first()
        
        if result:
            # Cache single code
            cache_data = {
                "id": result.id,
                "code": result.code,
                "description": result.description,
                "category": result.category,
                "subcategory": result.subcategory,
                "severity": result.severity,
                "is_active": result.is_active,
                "created_at": result.created_at.isoformat() if result.created_at else None,
                "updated_at": result.updated_at.isoformat() if result.updated_at else None,
            }
            cache.set(cache_key, cache_data, ttl=settings.CACHE_TTL)
        
        return result
    
    def get_code_by_code(self, code: str, organization_id: Optional[int] = None) -> Optional[DiagnosticCode]:
        """Get diagnostic code by code string."""
        query = self.db.query(DiagnosticCode).filter(DiagnosticCode.code == code)
        if organization_id is not None:
            query = query.filter(DiagnosticCode.organization_id == organization_id)
        return query.first()
    
    def create_code(self, code_data: DiagnosticCodeCreate, organization_id: int) -> DiagnosticCode:
        """Create a new diagnostic code."""
        # Check organization code limit
        from app.services.organization_service import OrganizationService
        if not OrganizationService.check_code_limit(self.db, organization_id):
            raise ValueError(f"Organization has reached maximum code limit")
        
        db_code = DiagnosticCode(**code_data.model_dump(), organization_id=organization_id)
        
        self.db.add(db_code)
        self.db.commit()
        self.db.refresh(db_code)
        
        # Invalidate list caches
        cache.delete_pattern("codes:list:*")
        
        return db_code
    
    def update_code(
        self,
        code_id: int,
        code_data: DiagnosticCodeUpdate
    ) -> Optional[DiagnosticCode]:
        """Update a diagnostic code."""
        db_code = self.get_code_by_id(code_id)
        if not db_code:
            return None
        
        update_data = code_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_code, field, value)
        
        self.db.commit()
        self.db.refresh(db_code)
        
        # Invalidate caches
        cache.delete(f"codes:id:{code_id}")
        cache.delete_pattern("codes:list:*")
        
        return db_code
    
    def delete_code(self, code_id: int) -> bool:
        """Delete a diagnostic code."""
        db_code = self.get_code_by_id(code_id)
        if not db_code:
            return False
        
        self.db.delete(db_code)
        self.db.commit()
        
        # Invalidate caches
        cache.delete(f"codes:id:{code_id}")
        cache.delete_pattern("codes:list:*")
        
        return True
