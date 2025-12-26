"""
Unit tests for DiagnosticCode model.
"""
import pytest
from datetime import datetime
from app.models.diagnostic_code import DiagnosticCode


@pytest.mark.unit
class TestDiagnosticCodeModel:
    """Tests for DiagnosticCode database model."""

    def test_create_diagnostic_code(self, db, test_org):
        """Test creating a diagnostic code."""
        code = DiagnosticCode(
            code="E11.9",
            description="Type 2 diabetes mellitus without complications",
            category="ENDOCRINE",
            subcategory="Diabetes",
            severity="medium",
            is_active=True,
            organization_id=test_org.id,
        )
        db.add(code)
        db.commit()
        db.refresh(code)

        assert code.id is not None
        assert code.code == "E11.9"
        assert code.description == "Type 2 diabetes mellitus without complications"
        assert code.category == "ENDOCRINE"
        assert code.subcategory == "Diabetes"
        assert code.severity == "medium"
        assert code.is_active is True
        assert isinstance(code.created_at, datetime)
        assert isinstance(code.updated_at, datetime)

    def test_diagnostic_code_defaults(self, db, test_org):
        """Test default values for diagnostic code."""
        code = DiagnosticCode(
            code="TEST",
            description="Test code",
            organization_id=test_org.id,
        )
        db.add(code)
        db.commit()
        db.refresh(code)

        assert code.is_active is True
        assert code.category is None
        assert code.subcategory is None
        assert code.severity is None
        assert code.created_at is not None
        assert code.updated_at is not None

    def test_unique_code_constraint(self, db, test_org):
        """Test that code must be unique."""
        code1 = DiagnosticCode(code="UNIQUE", description="First", organization_id=test_org.id)
        db.add(code1)
        db.commit()

        code2 = DiagnosticCode(code="UNIQUE", description="Second", organization_id=test_org.id)
        db.add(code2)
        
        with pytest.raises(Exception):  # SQLAlchemy IntegrityError
            db.commit()

    def test_diagnostic_code_repr(self, db, test_org):
        """Test string representation."""
        code = DiagnosticCode(
            code="TEST",
            description="A very long description that should be truncated in the representation",
            organization_id=test_org.id,
        )
        db.add(code)
        db.commit()

        repr_str = repr(code)
        assert "TEST" in repr_str
        assert "<DiagnosticCode" in repr_str

    def test_update_diagnostic_code(self, db, test_org):
        """Test updating a diagnostic code."""
        code = DiagnosticCode(code="UPDATE", description="Original", organization_id=test_org.id)
        db.add(code)
        db.commit()
        original_updated_at = code.updated_at

        code.description = "Updated description"
        code.severity = "high"
        db.commit()
        db.refresh(code)

        assert code.description == "Updated description"
        assert code.severity == "high"
        # Note: onupdate may not trigger in SQLite for testing

    def test_delete_diagnostic_code(self, db, test_org):
        """Test deleting a diagnostic code."""
        code = DiagnosticCode(code="DELETE", description="To be deleted", organization_id=test_org.id)
        db.add(code)
        db.commit()
        code_id = code.id

        db.delete(code)
        db.commit()

        deleted_code = db.query(DiagnosticCode).filter(DiagnosticCode.id == code_id).first()
        assert deleted_code is None

    def test_query_by_category(self, db, test_org):
        """Test querying codes by category."""
        code1 = DiagnosticCode(code="C1", description="Cat1", category="ENDOCRINE", organization_id=test_org.id)
        code2 = DiagnosticCode(code="C2", description="Cat2", category="CARDIOVASCULAR", organization_id=test_org.id)
        code3 = DiagnosticCode(code="C3", description="Cat3", category="ENDOCRINE", organization_id=test_org.id)
        
        db.add_all([code1, code2, code3])
        db.commit()

        endocrine_codes = db.query(DiagnosticCode).filter(
            DiagnosticCode.category == "ENDOCRINE"
        ).all()
        
        assert len(endocrine_codes) == 2
        assert all(c.category == "ENDOCRINE" for c in endocrine_codes)

    def test_query_by_active_status(self, db, test_org):
        """Test querying codes by active status."""
        active_code = DiagnosticCode(code="A1", description="Active", is_active=True, organization_id=test_org.id)
        inactive_code = DiagnosticCode(code="A2", description="Inactive", is_active=False, organization_id=test_org.id)
        
        db.add_all([active_code, inactive_code])
        db.commit()

        active_codes = db.query(DiagnosticCode).filter(DiagnosticCode.is_active == True).all()
        assert len(active_codes) == 1
        assert active_codes[0].code == "A1"

        inactive_codes = db.query(DiagnosticCode).filter(DiagnosticCode.is_active == False).all()
        assert len(inactive_codes) == 1
        assert inactive_codes[0].code == "A2"
