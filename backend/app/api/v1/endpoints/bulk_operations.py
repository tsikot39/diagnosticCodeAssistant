"""
API endpoints for bulk import/export operations.
"""
import csv
import io
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.db.database import get_db
from app.models.user import User
from app.models.diagnostic_code import DiagnosticCode
from app.schemas.bulk_operations import (
    BulkImportRequest,
    BulkImportResponse,
    BulkExportFormat
)
from app.schemas.diagnostic_code import DiagnosticCodeCreate
from app.core.deps import get_current_active_user
from app.services.diagnostic_code_service import DiagnosticCodeService


router = APIRouter()


@router.post("/bulk/import", response_model=BulkImportResponse)
def bulk_import_codes(
    request: BulkImportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Bulk import diagnostic codes.
    
    - **codes**: List of diagnostic codes to import (max 1000)
    - **skip_duplicates**: Skip codes that already exist
    - **update_existing**: Update existing codes with new data
    """
    service = DiagnosticCodeService(db)
    
    total = len(request.codes)
    created = 0
    updated = 0
    skipped = 0
    errors = []
    
    for idx, code_data in enumerate(request.codes):
        try:
            # Check if code already exists
            existing = db.query(DiagnosticCode).filter(
                and_(
                    DiagnosticCode.code == code_data.code,
                    DiagnosticCode.organization_id == current_user.organization_id
                )
            ).first()
            
            if existing:
                if request.update_existing:
                    # Update existing code
                    for field, value in code_data.model_dump(exclude_unset=True).items():
                        setattr(existing, field, value)
                    existing.updated_at = db.func.now()
                    updated += 1
                elif request.skip_duplicates:
                    skipped += 1
                    continue
                else:
                    errors.append({
                        "index": idx,
                        "code": code_data.code,
                        "error": "Code already exists"
                    })
                    continue
            else:
                # Create new code
                new_code = DiagnosticCode(
                    organization_id=current_user.organization_id,
                    **code_data.model_dump()
                )
                db.add(new_code)
                created += 1
            
        except Exception as e:
            errors.append({
                "index": idx,
                "code": code_data.code,
                "error": str(e)
            })
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to commit changes: {str(e)}"
        )
    
    return BulkImportResponse(
        total=total,
        created=created,
        updated=updated,
        skipped=skipped,
        errors=errors
    )


@router.post("/bulk/export")
def bulk_export_codes(
    export_params: BulkExportFormat,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Bulk export diagnostic codes in JSON or CSV format.
    
    - **format**: Export format (json or csv)
    - **include_inactive**: Include inactive codes
    - **category**: Filter by category (optional)
    - **severity**: Filter by severity (optional)
    """
    # Build query
    query = db.query(DiagnosticCode).filter(
        DiagnosticCode.organization_id == current_user.organization_id
    )
    
    if not export_params.include_inactive:
        query = query.filter(DiagnosticCode.is_active == True)
    
    if export_params.category:
        query = query.filter(DiagnosticCode.category == export_params.category)
    
    if export_params.severity:
        query = query.filter(DiagnosticCode.severity == export_params.severity)
    
    codes = query.all()
    
    if export_params.format == "csv":
        # Generate CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            "code", "description", "category", "severity", 
            "is_active", "created_at", "updated_at"
        ])
        
        # Write data
        for code in codes:
            writer.writerow([
                code.code,
                code.description,
                code.category,
                code.severity,
                code.is_active,
                code.created_at.isoformat() if code.created_at else "",
                code.updated_at.isoformat() if code.updated_at else ""
            ])
        
        # Return CSV response
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=diagnostic_codes_{current_user.organization_id}.csv"
            }
        )
    
    else:
        # Return JSON
        return {
            "total": len(codes),
            "codes": [
                {
                    "code": c.code,
                    "description": c.description,
                    "category": c.category,
                    "severity": c.severity,
                    "is_active": c.is_active,
                    "extra_data": c.extra_data,
                    "created_at": c.created_at.isoformat() if c.created_at else None,
                    "updated_at": c.updated_at.isoformat() if c.updated_at else None
                }
                for c in codes
            ]
        }
