"""
Diagnostic Codes API endpoints.
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.db.database import get_db
from app.schemas.diagnostic_code import (
    DiagnosticCodeCreate,
    DiagnosticCodeUpdate,
    DiagnosticCodeResponse,
    DiagnosticCodeList,
)
from app.services.diagnostic_code_service import DiagnosticCodeService
from app.services.audit_service import AuditService
from app.services.version_service import VersionService
from app.services.webhook_service import WebhookService
from app.services.ai_search import ai_search_codes, get_ai_suggestions
from app.core.deps import get_current_active_user
from app.core.rbac import require_editor, require_viewer
from app.models.user import User

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("", response_model=DiagnosticCodeList)
@limiter.limit("100/minute")
async def get_diagnostic_codes(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer),
):
    """Get list of diagnostic codes with optional filters."""
    service = DiagnosticCodeService(db)
    
    # Filter by user's organization
    organization_id = current_user.organization_id if current_user else None
    
    codes = service.get_codes(
        skip=skip,
        limit=limit,
        search=search,
        category=category,
        severity=severity,
        is_active=is_active,
        organization_id=organization_id,
    )
    total = service.count_codes(
        search=search,
        category=category,
        severity=severity,
        is_active=is_active,
        organization_id=organization_id,
    )
    
    return DiagnosticCodeList(
        total=total,
        items=codes,
        skip=skip,
        limit=limit,
    )


@router.get("/{code_id}", response_model=DiagnosticCodeResponse)
async def get_diagnostic_code(
    code_id: int,
    current_user: User = Depends(require_viewer),
    db: Session = Depends(get_db),
):
    """Get a specific diagnostic code by ID."""
    service = DiagnosticCodeService(db)
    organization_id = current_user.organization_id if current_user else None
    code = service.get_code_by_id(code_id, organization_id)
    if not code:
        raise HTTPException(status_code=404, detail="Diagnostic code not found")
    return code


@router.get("/by-code/{code}", response_model=DiagnosticCodeResponse)
async def get_diagnostic_code_by_code(
    code: str,
    current_user: User = Depends(require_viewer),
    db: Session = Depends(get_db),
):
    """Get a specific diagnostic code by code string."""
    service = DiagnosticCodeService(db)
    organization_id = current_user.organization_id if current_user else None
    diagnostic_code = service.get_code_by_code(code, organization_id)
    if not diagnostic_code:
        raise HTTPException(status_code=404, detail="Diagnostic code not found")
    return diagnostic_code


@router.post("", response_model=DiagnosticCodeResponse, status_code=201)
async def create_diagnostic_code(
    request: Request,
    code_data: DiagnosticCodeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new diagnostic code."""
    service = DiagnosticCodeService(db)
    
    # Use user's organization
    organization_id = current_user.organization_id if current_user else None
    
    # Check if code already exists in this organization
    existing_code = service.get_code_by_code(code_data.code, organization_id)
    if existing_code:
        raise HTTPException(
            status_code=400,
            detail=f"Diagnostic code '{code_data.code}' already exists in this organization"
        )
    
    try:
        new_code = service.create_code(code_data, organization_id)
    except ValueError as e:
        # Organization limit exceeded
        raise HTTPException(status_code=400, detail=str(e))
    
    # Create version snapshot
    VersionService.create_version(
        db=db,
        diagnostic_code=new_code,
        change_type="CREATE",
        user_id=current_user.id,
        change_summary="Code created",
        changed_fields=["all"]
    )
    
    # Trigger webhooks
    await WebhookService.trigger_webhooks(
        db=db,
        event_type="code.created",
        payload={
            "id": new_code.id,
            "code": new_code.code,
            "description": new_code.description,
            "category": new_code.category,
            "severity": new_code.severity,
            "user_id": current_user.id
        }
    )
    
    # Log the creation
    AuditService.log_code_create(
        db=db,
        code_id=new_code.id,
        user_id=current_user.id,
        code_data=code_data.dict(),
        ip=request.client.host if request.client else None
    )
    
    return new_code


@router.put("/{code_id}", response_model=DiagnosticCodeResponse)
async def update_diagnostic_code(
    request: Request,
    code_id: int,
    code_data: DiagnosticCodeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a diagnostic code."""
    service = DiagnosticCodeService(db)
    
    # Get old data for audit trail
    old_code = service.get_code_by_id(code_id)
    if not old_code:
        raise HTTPException(status_code=404, detail="Diagnostic code not found")
    
    old_data = {
        "code": old_code.code,
        "description": old_code.description,
        "category": old_code.category,
        "severity": old_code.severity,
        "is_active": old_code.is_active
    }
    
    updated_code = service.update_code(code_id, code_data)
    
    # Track changed fields
    changed_fields = {}
    update_dict = code_data.dict(exclude_unset=True)
    for field, new_value in update_dict.items():
        old_value = getattr(old_code, field, None)
        if old_value != new_value:
            changed_fields[field] = {"old": str(old_value), "new": str(new_value)}
    
    # Create version snapshot
    if changed_fields:
        VersionService.create_version(
            db=db,
            code_id=code_id,
            user_id=current_user.id,
            change_type="UPDATE",
            changed_fields=changed_fields,
            comment="Code updated"
        )
        
        # Trigger webhooks
        await WebhookService.trigger_webhooks(
            db=db,
            event_type="code.updated",
            payload={
                "id": updated_code.id,
                "code": updated_code.code,
                "changed_fields": list(changed_fields.keys()),
                "user_id": current_user.id
            }
        )
    
    # Log the update
    AuditService.log_code_update(
        db=db,
        code_id=code_id,
        user_id=current_user.id,
        old_data=old_data,
        new_data=update_dict,
        ip=request.client.host if request.client else None
    )
    
    return updated_code


@router.delete("/{code_id}", status_code=204)
async def delete_diagnostic_code(
    request: Request,
    code_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a diagnostic code."""
    service = DiagnosticCodeService(db)
    
    # Get code data before deletion for audit trail
    code = service.get_code_by_id(code_id)
    if not code:
        raise HTTPException(status_code=404, detail="Diagnostic code not found")
    
    code_data = {
        "code": code.code,
        "description": code.description,
        "category": code.category,
        "severity": code.severity,
        "is_active": code.is_active
    }
    
    # Create version snapshot before deletion
    VersionService.create_version(
        db=db,
        diagnostic_code=code,
        change_type="DELETE",
        user_id=current_user.id,
        change_summary="Code deleted",
        changed_fields=["status"]
    )
    
    # Trigger webhooks
    await WebhookService.trigger_webhooks(
        db=db,
        event_type="code.deleted",
        payload={
            "id": code_id,
            "code": code_data["code"],
            "user_id": current_user.id
        }
    )
    
    service.delete_code(code_id)
    
    # Log the deletion
    AuditService.log_code_delete(
        db=db,
        code_id=code_id,
        user_id=current_user.id,
        code_data=code_data,
        ip=request.client.host if request.client else None
    )


@router.get("/search/ai", response_model=List[DiagnosticCodeResponse])
@limiter.limit("30/minute")  # Lower limit for AI searches
async def ai_search(
    request: Request,
    query: str = Query(..., min_length=3, description="Natural language search query"),
    limit: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer),
):
    """
    AI-powered search for diagnostic codes using natural language.
    
    Examples:
    - "chest pain radiating to left arm"
    - "frequent urination and excessive thirst"
    - "shortness of breath with wheezing"
    """
    try:
        codes = await ai_search_codes(query, db, limit)
        return codes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI search failed: {str(e)}")


@router.post("/suggest/symptoms", response_model=Dict[str, Any])
@limiter.limit("20/minute")
async def suggest_from_symptoms(
    request: Request,
    symptoms: str = Query(..., min_length=5, description="Description of symptoms"),
    limit: int = Query(5, ge=1, le=10),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer),
):
    """
    Get AI-powered diagnostic code suggestions based on symptoms description.
    Returns suggestions with explanations and confidence level.
    """
    try:
        result = await get_ai_suggestions(symptoms, db, limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI suggestions failed: {str(e)}")
