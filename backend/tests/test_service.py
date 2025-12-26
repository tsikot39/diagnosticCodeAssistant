"""
Unit tests for DiagnosticCodeService.
"""
import pytest
from app.services.diagnostic_code_service import DiagnosticCodeService
from app.schemas.diagnostic_code import DiagnosticCodeCreate, DiagnosticCodeUpdate
from app.models.diagnostic_code import DiagnosticCode


@pytest.mark.unit
class TestDiagnosticCodeService:
    """Tests for DiagnosticCodeService."""

    def test_create_code(self, db, sample_diagnostic_code_data, test_org):
        """Test creating a diagnostic code."""
        service = DiagnosticCodeService(db)
        code_data = DiagnosticCodeCreate(**sample_diagnostic_code_data)
        
        code = service.create_code(code_data, organization_id=test_org.id)
        
        assert code.id is not None
        assert code.code == sample_diagnostic_code_data["code"]
        assert code.description == sample_diagnostic_code_data["description"]
        assert code.category == sample_diagnostic_code_data["category"]
        assert code.organization_id == test_org.id

    def test_get_code_by_id(self, db, create_diagnostic_code):
        """Test getting a code by ID."""
        service = DiagnosticCodeService(db)
        
        code = service.get_code_by_id(create_diagnostic_code.id)
        
        assert code is not None
        assert code.id == create_diagnostic_code.id
        assert code.code == create_diagnostic_code.code

    def test_get_code_by_id_not_found(self, db):
        """Test getting a non-existent code by ID."""
        service = DiagnosticCodeService(db)
        
        code = service.get_code_by_id(99999)
        
        assert code is None

    def test_get_code_by_code(self, db, create_diagnostic_code):
        """Test getting a code by code string."""
        service = DiagnosticCodeService(db)
        
        code = service.get_code_by_code(create_diagnostic_code.code)
        
        assert code is not None
        assert code.code == create_diagnostic_code.code

    def test_get_code_by_code_not_found(self, db):
        """Test getting a non-existent code by code string."""
        service = DiagnosticCodeService(db)
        
        code = service.get_code_by_code("NONEXISTENT")
        
        assert code is None

    def test_get_codes_no_filters(self, db, test_org):
        """Test getting all codes without filters."""
        service = DiagnosticCodeService(db)
        
        # Create test codes
        codes_data = [
            {"code": "E11.9", "description": "Diabetes", "category": "ENDOCRINE", "organization_id": test_org.id},
            {"code": "I10", "description": "Hypertension", "category": "CARDIOVASCULAR", "organization_id": test_org.id},
            {"code": "J44.9", "description": "COPD", "category": "RESPIRATORY", "organization_id": test_org.id},
        ]
        for data in codes_data:
            code = DiagnosticCode(**data)
            db.add(code)
        db.commit()
        
        codes = service.get_codes()
        
        assert len(codes) == 3

    def test_get_codes_with_search(self, db, test_org):
        """Test searching codes by text."""
        service = DiagnosticCodeService(db)
        
        codes_data = [
            {"code": "E11.9", "description": "Type 2 diabetes mellitus", "category": "ENDOCRINE", "organization_id": test_org.id},
            {"code": "E10.9", "description": "Type 1 diabetes mellitus", "category": "ENDOCRINE", "organization_id": test_org.id},
            {"code": "I10", "description": "Essential hypertension", "category": "CARDIOVASCULAR", "organization_id": test_org.id},
        ]
        for data in codes_data:
            db.add(DiagnosticCode(**data))
        db.commit()
        
        # Search by description
        codes = service.get_codes(search="diabetes")
        assert len(codes) == 2
        
        # Search by code
        codes = service.get_codes(search="E11")
        assert len(codes) == 1
        assert codes[0].code == "E11.9"

    def test_get_codes_with_category_filter(self, db, test_org):
        """Test filtering codes by category."""
        service = DiagnosticCodeService(db)
        
        codes_data = [
            {"code": "E11.9", "description": "Diabetes", "category": "ENDOCRINE", "organization_id": test_org.id},
            {"code": "E10.9", "description": "Diabetes Type 1", "category": "ENDOCRINE", "organization_id": test_org.id},
            {"code": "I10", "description": "Hypertension", "category": "CARDIOVASCULAR", "organization_id": test_org.id},
        ]
        for data in codes_data:
            db.add(DiagnosticCode(**data))
        db.commit()
        
        codes = service.get_codes(category="ENDOCRINE")
        
        assert len(codes) == 2
        assert all(c.category == "ENDOCRINE" for c in codes)

    def test_get_codes_with_severity_filter(self, db, test_org):
        """Test filtering codes by severity."""
        service = DiagnosticCodeService(db)
        
        codes_data = [
            {"code": "C1", "description": "Low severity", "severity": "low", "organization_id": test_org.id},
            {"code": "C2", "description": "High severity", "severity": "high", "organization_id": test_org.id},
            {"code": "C3", "description": "Medium severity", "severity": "medium", "organization_id": test_org.id},
        ]
        for data in codes_data:
            db.add(DiagnosticCode(**data))
        db.commit()
        
        codes = service.get_codes(severity="high")
        
        assert len(codes) == 1
        assert codes[0].severity == "high"

    def test_get_codes_with_active_filter(self, db, test_org):
        """Test filtering codes by active status."""
        service = DiagnosticCodeService(db)
        
        active_code = DiagnosticCode(code="A1", description="Active", is_active=True, organization_id=test_org.id)
        inactive_code = DiagnosticCode(code="A2", description="Inactive", is_active=False, organization_id=test_org.id)
        db.add_all([active_code, inactive_code])
        db.commit()
        
        codes = service.get_codes(is_active=True)
        assert len(codes) == 1
        assert codes[0].is_active is True
        
        codes = service.get_codes(is_active=False)
        assert len(codes) == 1
        assert codes[0].is_active is False

    def test_get_codes_with_pagination(self, db, test_org):
        """Test pagination of codes."""
        service = DiagnosticCodeService(db)
        
        # Create 10 codes
        for i in range(10):
            code = DiagnosticCode(code=f"C{i}", description=f"Code {i}", organization_id=test_org.id)
            db.add(code)
        db.commit()
        
        # Get first 5
        codes = service.get_codes(skip=0, limit=5)
        assert len(codes) == 5
        
        # Get next 5
        codes = service.get_codes(skip=5, limit=5)
        assert len(codes) == 5

    def test_count_codes(self, db, test_org):
        """Test counting codes."""
        service = DiagnosticCodeService(db)
        
        # Initially should be 0
        count = service.count_codes()
        assert count == 0
        
        # Add codes
        for i in range(5):
            db.add(DiagnosticCode(code=f"C{i}", description=f"Code {i}", organization_id=test_org.id))
        db.commit()
        
        count = service.count_codes()
        assert count == 5

    def test_count_codes_with_filters(self, db, test_org):
        """Test counting codes with filters."""
        service = DiagnosticCodeService(db)
        
        codes_data = [
            {"code": "E11.9", "description": "Diabetes", "category": "ENDOCRINE", "is_active": True, "organization_id": test_org.id},
            {"code": "E10.9", "description": "Diabetes T1", "category": "ENDOCRINE", "is_active": False, "organization_id": test_org.id},
            {"code": "I10", "description": "Hypertension", "category": "CARDIOVASCULAR", "is_active": True, "organization_id": test_org.id},
        ]
        for data in codes_data:
            db.add(DiagnosticCode(**data))
        db.commit()
        
        # Count by category
        count = service.count_codes(category="ENDOCRINE")
        assert count == 2
        
        # Count by active status
        count = service.count_codes(is_active=True)
        assert count == 2
        
        # Count with search
        count = service.count_codes(search="diabetes")
        assert count == 2

    def test_update_code(self, db, create_diagnostic_code):
        """Test updating a code."""
        service = DiagnosticCodeService(db)
        update_data = DiagnosticCodeUpdate(
            description="Updated description",
            severity="high",
        )
        
        updated_code = service.update_code(create_diagnostic_code.id, update_data)
        
        assert updated_code is not None
        assert updated_code.description == "Updated description"
        assert updated_code.severity == "high"
        # Original values should remain
        assert updated_code.code == create_diagnostic_code.code
        assert updated_code.category == create_diagnostic_code.category

    def test_update_code_not_found(self, db):
        """Test updating a non-existent code."""
        service = DiagnosticCodeService(db)
        update_data = DiagnosticCodeUpdate(description="Updated")
        
        result = service.update_code(99999, update_data)
        
        assert result is None

    def test_update_code_partial(self, db, create_diagnostic_code):
        """Test partial update of a code."""
        service = DiagnosticCodeService(db)
        original_description = create_diagnostic_code.description
        
        update_data = DiagnosticCodeUpdate(severity="critical")
        updated_code = service.update_code(create_diagnostic_code.id, update_data)
        
        assert updated_code.severity == "critical"
        assert updated_code.description == original_description

    def test_delete_code(self, db, create_diagnostic_code):
        """Test deleting a code."""
        service = DiagnosticCodeService(db)
        code_id = create_diagnostic_code.id
        
        result = service.delete_code(code_id)
        
        assert result is True
        # Verify it's deleted
        deleted_code = service.get_code_by_id(code_id)
        assert deleted_code is None

    def test_delete_code_not_found(self, db):
        """Test deleting a non-existent code."""
        service = DiagnosticCodeService(db)
        
        result = service.delete_code(99999)
        
        assert result is False

    def test_complex_query(self, db, test_org):
        """Test complex query with multiple filters."""
        service = DiagnosticCodeService(db)
        
        codes_data = [
            {"code": "E11.9", "description": "Diabetes Type 2", "category": "ENDOCRINE", "severity": "medium", "is_active": True, "organization_id": test_org.id},
            {"code": "E10.9", "description": "Diabetes Type 1", "category": "ENDOCRINE", "severity": "high", "is_active": True, "organization_id": test_org.id},
            {"code": "E11.8", "description": "Diabetes with complications", "category": "ENDOCRINE", "severity": "high", "is_active": False, "organization_id": test_org.id},
            {"code": "I10", "description": "Hypertension", "category": "CARDIOVASCULAR", "severity": "medium", "is_active": True, "organization_id": test_org.id},
        ]
        for data in codes_data:
            db.add(DiagnosticCode(**data))
        db.commit()
        
        # Active, ENDOCRINE, high severity
        codes = service.get_codes(
            category="ENDOCRINE",
            severity="high",
            is_active=True
        )
        assert len(codes) == 1
        assert codes[0].code == "E10.9"
        
        # Search diabetes + active
        codes = service.get_codes(
            search="diabetes",
            is_active=True
        )
        assert len(codes) == 2
