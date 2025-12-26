"""
Bulk operations endpoints for diagnostic codes.
"""
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import csv
import io

from app.db.database import get_db
from app.core.rbac import require_editor
from app.models.user import User
from app.models.diagnostic_code import DiagnosticCode
from app.schemas.diagnostic_code import DiagnosticCodeCreate, DiagnosticCodeResponse
from app.services.diagnostic_code_service import DiagnosticCodeService
from app.services.audit_service import AuditService

router = APIRouter()


@router.post("/import-csv", response_model=dict)
async def import_codes_from_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor)
):
    """Import diagnostic codes from CSV file."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    contents = await file.read()
    csv_file = io.StringIO(contents.decode('utf-8'))
    reader = csv.DictReader(csv_file)
    
    service = DiagnosticCodeService(db)
    created = 0
    updated = 0
    errors = []
    
    for row_num, row in enumerate(reader, start=2):  # Start at 2 (header is row 1)
        try:
            # Map CSV columns to schema fields
            code_data = DiagnosticCodeCreate(
                code=row.get('code', '').strip(),
                description=row.get('description', '').strip(),
                category=row.get('category', '').strip() or None,
                severity=row.get('severity', '').strip() or None,
                is_active=row.get('is_active', 'true').lower() in ('true', '1', 'yes', 'active')
            )
            
            # Check if code exists
            existing = service.get_code_by_code(code_data.code)
            
            if existing:
                # Update existing code
                from app.schemas.diagnostic_code import DiagnosticCodeUpdate
                update_data = DiagnosticCodeUpdate(
                    description=code_data.description,
                    category=code_data.category,
                    severity=code_data.severity,
                    is_active=code_data.is_active
                )
                service.update_code(existing.id, update_data)
                updated += 1
            else:
                # Create new code
                new_code = service.create_code(code_data)
                created += 1
                
                # Log creation
                AuditService.log_code_create(
                    db=db,
                    code_id=new_code.id,
                    user_id=current_user.id,
                    code_data=code_data.model_dump()
                )
                
        except Exception as e:
            errors.append(f"Row {row_num}: {str(e)}")
    
    return {
        "success": True,
        "created": created,
        "updated": updated,
        "errors": errors if errors else None,
        "total_processed": created + updated
    }


@router.post("/export-csv")
async def export_codes_to_csv(
    category: str = None,
    severity: str = None,
    is_active: bool = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor)
):
    """Export diagnostic codes to CSV format."""
    service = DiagnosticCodeService(db)
    
    # Get all codes matching filters
    codes = service.get_codes(
        skip=0,
        limit=10000,  # Large limit for export
        category=category,
        severity=severity,
        is_active=is_active
    )
    
    # Generate CSV
    output = io.StringIO()
    fieldnames = ['code', 'description', 'category', 'severity', 'is_active']
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    
    writer.writeheader()
    for code in codes:
        writer.writerow({
            'code': code.code,
            'description': code.description,
            'category': code.category or '',
            'severity': code.severity or '',
            'is_active': 'true' if code.is_active else 'false'
        })
    
    csv_content = output.getvalue()
    
    return {
        "success": True,
        "filename": "diagnostic_codes_export.csv",
        "content": csv_content,
        "count": len(codes)
    }


@router.post("/bulk-update")
async def bulk_update_codes(
    code_ids: List[int],
    category: str = None,
    severity: str = None,
    is_active: bool = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor)
):
    """Bulk update multiple diagnostic codes."""
    if not code_ids:
        raise HTTPException(status_code=400, detail="No code IDs provided")
    
    from app.schemas.diagnostic_code import DiagnosticCodeUpdate
    service = DiagnosticCodeService(db)
    
    update_data = DiagnosticCodeUpdate(
        category=category,
        severity=severity,
        is_active=is_active
    )
    
    updated_count = 0
    errors = []
    
    for code_id in code_ids:
        try:
            code = service.update_code(code_id, update_data)
            if code:
                updated_count += 1
                
                # Log update
                AuditService.log_action(
                    db=db,
                    action="bulk_update",
                    resource_type="diagnostic_code",
                    user_id=current_user.id,
                    resource_id=code_id,
                    changes=update_data.model_dump(exclude_unset=True)
                )
        except Exception as e:
            errors.append(f"Code ID {code_id}: {str(e)}")
    
    return {
        "success": True,
        "updated": updated_count,
        "total": len(code_ids),
        "errors": errors if errors else None
    }


@router.delete("/bulk-delete")
async def bulk_delete_codes(
    code_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor)
):
    """Bulk delete multiple diagnostic codes."""
    if not code_ids:
        raise HTTPException(status_code=400, detail="No code IDs provided")
    
    service = DiagnosticCodeService(db)
    deleted_count = 0
    errors = []
    
    for code_id in code_ids:
        try:
            # Get code before deletion for audit
            code = service.get_code_by_id(code_id)
            if code:
                code_data = {
                    "code": code.code,
                    "description": code.description,
                    "category": code.category,
                    "severity": code.severity,
                    "is_active": code.is_active
                }
                
                if service.delete_code(code_id):
                    deleted_count += 1
                    
                    # Log deletion
                    AuditService.log_code_delete(
                        db=db,
                        code_id=code_id,
                        user_id=current_user.id,
                        code_data=code_data
                    )
        except Exception as e:
            errors.append(f"Code ID {code_id}: {str(e)}")
    
    return {
        "success": True,
        "deleted": deleted_count,
        "total": len(code_ids),
        "errors": errors if errors else None
    }
