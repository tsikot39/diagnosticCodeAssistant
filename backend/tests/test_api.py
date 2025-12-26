"""
Integration tests for Diagnostic Codes API endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from app.models.diagnostic_code import DiagnosticCode


@pytest.mark.integration
class TestDiagnosticCodesAPI:
    """Tests for diagnostic codes API endpoints."""

    def test_get_codes_empty(self, client):
        """Test getting codes when database is empty."""
        response = client.get("/api/v1/diagnostic-codes")
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["items"] == []
        assert data["skip"] == 0
        assert data["limit"] == 100

    def test_create_code(self, client, sample_diagnostic_code_data):
        """Test creating a new diagnostic code."""
        response = client.post(
            "/api/v1/diagnostic-codes",
            json=sample_diagnostic_code_data
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["code"] == sample_diagnostic_code_data["code"]
        assert data["description"] == sample_diagnostic_code_data["description"]
        assert data["category"] == sample_diagnostic_code_data["category"]
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_create_code_duplicate(self, client, create_diagnostic_code, test_org):
        """Test creating a code with duplicate code string."""
        duplicate_data = {
            "code": create_diagnostic_code.code,
            "description": "Different description",
            "is_active": True,
            "organization_id": test_org.id,
        }
        
        response = client.post(
            "/api/v1/diagnostic-codes",
            json=duplicate_data
        )
        
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    def test_create_code_invalid_data(self, client, test_org):
        """Test creating a code with invalid data."""
        invalid_data = {
            "code": "",  # Empty code
            "description": "Test",
            "organization_id": test_org.id,
        }
        
        response = client.post(
            "/api/v1/diagnostic-codes",
            json=invalid_data
        )
        
        assert response.status_code == 422  # Validation error

    def test_create_code_missing_required_fields(self, client, test_org):
        """Test creating a code without required fields."""
        incomplete_data = {
            "code": "TEST",
            # Missing description
            "organization_id": test_org.id,
        }
        
        response = client.post(
            "/api/v1/diagnostic-codes",
            json=incomplete_data
        )
        
        assert response.status_code == 422

    def test_get_codes_list(self, client, db, test_org):
        """Test getting list of codes."""
        # Create test codes
        codes_data = [
            {"code": "E11.9", "description": "Diabetes", "category": "ENDOCRINE", "organization_id": test_org.id},
            {"code": "I10", "description": "Hypertension", "category": "CARDIOVASCULAR", "organization_id": test_org.id},
            {"code": "J44.9", "description": "COPD", "category": "RESPIRATORY", "organization_id": test_org.id},
        ]
        for data in codes_data:
            db.add(DiagnosticCode(**data))
        db.commit()
        
        response = client.get("/api/v1/diagnostic-codes")
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3
        assert len(data["items"]) == 3

    def test_get_codes_with_pagination(self, client, db, test_org):
        """Test pagination of codes."""
        # Create 10 codes
        for i in range(10):
            db.add(DiagnosticCode(code=f"C{i:02d}", description=f"Code {i}", organization_id=test_org.id))
        db.commit()
        
        # Get first page
        response = client.get("/api/v1/diagnostic-codes?skip=0&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 10
        assert len(data["items"]) == 5
        assert data["skip"] == 0
        assert data["limit"] == 5
        
        # Get second page
        response = client.get("/api/v1/diagnostic-codes?skip=5&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 5

    def test_get_codes_with_search(self, client, db, test_org):
        """Test searching codes."""
        codes_data = [
            {"code": "E11.9", "description": "Type 2 diabetes mellitus", "organization_id": test_org.id},
            {"code": "E10.9", "description": "Type 1 diabetes mellitus", "organization_id": test_org.id},
            {"code": "I10", "description": "Essential hypertension", "organization_id": test_org.id},
        ]
        for data in codes_data:
            db.add(DiagnosticCode(**data))
        db.commit()
        
        # Search by description
        response = client.get("/api/v1/diagnostic-codes?search=diabetes")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        
        # Search by code
        response = client.get("/api/v1/diagnostic-codes?search=E11")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1

    def test_get_codes_with_category_filter(self, client, db, test_org):
        """Test filtering by category."""
        codes_data = [
            {"code": "E11.9", "description": "Diabetes", "category": "ENDOCRINE", "organization_id": test_org.id},
            {"code": "E10.9", "description": "Diabetes T1", "category": "ENDOCRINE", "organization_id": test_org.id},
            {"code": "I10", "description": "Hypertension", "category": "CARDIOVASCULAR", "organization_id": test_org.id},
        ]
        for data in codes_data:
            db.add(DiagnosticCode(**data))
        db.commit()
        
        response = client.get("/api/v1/diagnostic-codes?category=ENDOCRINE")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2

    def test_get_codes_with_severity_filter(self, client, db, test_org):
        """Test filtering by severity."""
        codes_data = [
            {"code": "C1", "description": "Low", "severity": "low", "organization_id": test_org.id},
            {"code": "C2", "description": "High", "severity": "high", "organization_id": test_org.id},
        ]
        for data in codes_data:
            db.add(DiagnosticCode(**data))
        db.commit()
        
        response = client.get("/api/v1/diagnostic-codes?severity=high")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1

    def test_get_codes_with_active_filter(self, client, db, test_org):
        """Test filtering by active status."""
        db.add(DiagnosticCode(code="A1", description="Active", is_active=True, organization_id=test_org.id))
        db.add(DiagnosticCode(code="A2", description="Inactive", is_active=False, organization_id=test_org.id))
        db.commit()
        
        response = client.get("/api/v1/diagnostic-codes?is_active=true")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        
        response = client.get("/api/v1/diagnostic-codes?is_active=false")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1

    def test_get_code_by_id(self, client, create_diagnostic_code):
        """Test getting a specific code by ID."""
        response = client.get(f"/api/v1/diagnostic-codes/{create_diagnostic_code.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == create_diagnostic_code.id
        assert data["code"] == create_diagnostic_code.code

    def test_get_code_by_id_not_found(self, client):
        """Test getting a non-existent code by ID."""
        response = client.get("/api/v1/diagnostic-codes/99999")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_get_code_by_code_string(self, client, create_diagnostic_code):
        """Test getting a code by code string."""
        response = client.get(f"/api/v1/diagnostic-codes/by-code/{create_diagnostic_code.code}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == create_diagnostic_code.code

    def test_get_code_by_code_string_not_found(self, client):
        """Test getting a non-existent code by code string."""
        response = client.get("/api/v1/diagnostic-codes/by-code/NONEXISTENT")
        
        assert response.status_code == 404

    def test_update_code(self, client, create_diagnostic_code):
        """Test updating a code."""
        update_data = {
            "description": "Updated description",
            "severity": "high",
        }
        
        response = client.put(
            f"/api/v1/diagnostic-codes/{create_diagnostic_code.id}",
            json=update_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["description"] == "Updated description"
        assert data["severity"] == "high"
        # Original values should remain
        assert data["code"] == create_diagnostic_code.code

    def test_update_code_not_found(self, client):
        """Test updating a non-existent code."""
        update_data = {"description": "Updated"}
        
        response = client.put(
            "/api/v1/diagnostic-codes/99999",
            json=update_data
        )
        
        assert response.status_code == 404

    def test_update_code_partial(self, client, create_diagnostic_code):
        """Test partial update."""
        update_data = {"severity": "critical"}
        
        response = client.put(
            f"/api/v1/diagnostic-codes/{create_diagnostic_code.id}",
            json=update_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["severity"] == "critical"
        assert data["description"] == create_diagnostic_code.description

    def test_delete_code(self, client, create_diagnostic_code):
        """Test deleting a code."""
        code_id = create_diagnostic_code.id
        
        response = client.delete(f"/api/v1/diagnostic-codes/{code_id}")
        
        assert response.status_code == 204
        
        # Verify it's deleted
        response = client.get(f"/api/v1/diagnostic-codes/{code_id}")
        assert response.status_code == 404

    def test_delete_code_not_found(self, client):
        """Test deleting a non-existent code."""
        response = client.delete("/api/v1/diagnostic-codes/99999")
        
        assert response.status_code == 404

    def test_complex_filtering(self, client, db, test_org):
        """Test complex filtering with multiple parameters."""
        codes_data = [
            {"code": "E11.9", "description": "Diabetes Type 2", "category": "ENDOCRINE", "severity": "medium", "is_active": True, "organization_id": test_org.id},
            {"code": "E10.9", "description": "Diabetes Type 1", "category": "ENDOCRINE", "severity": "high", "is_active": True, "organization_id": test_org.id},
            {"code": "E11.8", "description": "Diabetes complications", "category": "ENDOCRINE", "severity": "high", "is_active": False, "organization_id": test_org.id},
            {"code": "I10", "description": "Hypertension", "category": "CARDIOVASCULAR", "severity": "medium", "is_active": True, "organization_id": test_org.id},
        ]
        for data in codes_data:
            db.add(DiagnosticCode(**data))
        db.commit()
        
        # Active + ENDOCRINE + high severity
        response = client.get(
            "/api/v1/diagnostic-codes"
            "?category=ENDOCRINE&severity=high&is_active=true"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["code"] == "E10.9"

    def test_pagination_limits(self, client):
        """Test pagination limit constraints."""
        # Limit too high should be capped
        response = client.get("/api/v1/diagnostic-codes?limit=1000")
        assert response.status_code == 422  # Validation error
        
        # Negative skip should fail
        response = client.get("/api/v1/diagnostic-codes?skip=-1")
        assert response.status_code == 422

    def test_root_endpoint(self, client):
        """Test root API endpoint."""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data

    def test_openapi_docs(self, client):
        """Test OpenAPI documentation endpoint."""
        response = client.get("/api/v1/openapi.json")
        
        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "paths" in data
