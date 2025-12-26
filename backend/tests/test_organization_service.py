"""
Tests for organization service and multi-tenancy.
"""
import pytest
from sqlalchemy.orm import Session

from app.services.organization_service import OrganizationService
from app.services.diagnostic_code_service import DiagnosticCodeService
from app.models.organization import Organization
from app.models.user import User
from app.models.diagnostic_code import DiagnosticCode
from app.schemas.organization import OrganizationCreate, OrganizationUpdate
from app.schemas.diagnostic_code import DiagnosticCodeCreate


@pytest.fixture
def test_organization(db: Session):
    """Create a test organization."""
    org = Organization(
        name="Test Organization",
        slug="test-org",
        is_active=True,
        max_users=10,
        max_codes=1000
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


@pytest.fixture
def second_organization(db: Session):
    """Create a second organization for isolation tests."""
    org = Organization(
        name="Second Organization",
        slug="second-org",
        is_active=True,
        max_users=5,
        max_codes=500
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


class TestOrganizationService:
    """Test suite for OrganizationService."""

    def test_create_organization(self, db: Session):
        """Test creating an organization."""
        org_data = OrganizationCreate(
            name="New Company",
            slug="new-company",
            description="A test company",
            max_users=20,
            max_codes=5000
        )

        org = OrganizationService.create_organization(db, org_data)

        assert org is not None
        assert org.name == "New Company"
        assert org.slug == "new-company"
        assert org.is_active is True
        assert org.max_users == 20
        assert org.max_codes == 5000

    def test_get_organization(self, db: Session, test_organization: Organization):
        """Test retrieving an organization by ID."""
        org = OrganizationService.get_organization_by_id(db, test_organization.id)

        assert org is not None
        assert org.id == test_organization.id
        assert org.name == "Test Organization"

    def test_get_organizations(self, db: Session, test_organization: Organization):
        """Test retrieving all organizations."""
        orgs, total = OrganizationService.get_organizations(db, skip=0, limit=10)

        assert len(orgs) >= 1
        assert any(o.id == test_organization.id for o in orgs)

    def test_update_organization(self, db: Session, test_organization: Organization):
        """Test updating an organization."""
        update_data = OrganizationUpdate(
            name="Updated Organization",
            max_users=15,
            is_active=False
        )

        updated = OrganizationService.update_organization(
            db,
            test_organization.id,
            update_data
        )

        assert updated is not None
        assert updated.name == "Updated Organization"
        assert updated.max_users == 15
        assert updated.is_active is False
        # Slug should remain unchanged
        assert updated.slug == test_organization.slug

    def test_delete_organization(self, db: Session, test_organization: Organization):
        """Test deleting an organization."""
        result = OrganizationService.delete_organization(db, test_organization.id)

        assert result is True

        # Verify deletion
        deleted = db.query(Organization).filter(
            Organization.id == test_organization.id
        ).first()
        assert deleted is None

    def test_get_organization_stats(self, db: Session, test_organization: Organization):
        """Test getting organization statistics."""
        # Create some users
        for i in range(3):
            user = User(
                email=f"user{i}@test.com",
                username=f"user{i}",
                hashed_password="hashed",
                role="user",
                is_active=True,
                organization_id=test_organization.id
            )
            db.add(user)

        # Create some codes
        for i in range(5):
            code = DiagnosticCode(
                code=f"TEST{i:03d}",
                description=f"Test code {i}",
                category="Test",
                severity="low",
                is_active=True,
                organization_id=test_organization.id
            )
            db.add(code)
        db.commit()

        stats = OrganizationService.get_organization_stats(db, test_organization.id)

        assert stats is not None
        assert stats["user_count"] == 3
        assert stats["code_count"] == 5
        assert stats["max_users"] == 10
        assert stats["max_codes"] == 1000
        assert stats["users_remaining"] == 7
        assert stats["codes_remaining"] == 995

    def test_check_user_limit_within_limit(self, db: Session, test_organization: Organization):
        """Test user limit check when under limit."""
        # Create 5 users (under limit of 10)
        for i in range(5):
            user = User(
                email=f"user{i}@test.com",
                username=f"user{i}",
                hashed_password="hashed",
                role="user",
                is_active=True,
                organization_id=test_organization.id
            )
            db.add(user)
        db.commit()

        can_create, message = OrganizationService.check_user_limit(
            db,
            test_organization.id
        )

        assert can_create is True
        assert message is None

    def test_check_user_limit_at_limit(self, db: Session, test_organization: Organization):
        """Test user limit check when at limit."""
        # Create 10 users (at limit)
        for i in range(10):
            user = User(
                email=f"user{i}@test.com",
                username=f"user{i}",
                hashed_password="hashed",
                role="user",
                is_active=True,
                organization_id=test_organization.id
            )
            db.add(user)
        db.commit()

        can_create, message = OrganizationService.check_user_limit(
            db,
            test_organization.id
        )

        assert can_create is False
        assert "maximum user limit" in message.lower()

    def test_check_code_limit_within_limit(self, db: Session, test_organization: Organization):
        """Test code limit check when under limit."""
        # Create 100 codes (under limit of 1000)
        for i in range(100):
            code = DiagnosticCode(
                code=f"TEST{i:03d}",
                description=f"Test code {i}",
                category="Test",
                severity="low",
                is_active=True,
                organization_id=test_organization.id
            )
            db.add(code)
        db.commit()

        can_create, message = OrganizationService.check_code_limit(
            db,
            test_organization.id
        )

        assert can_create is True
        assert message is None

    def test_check_code_limit_at_limit(self, db: Session, test_organization: Organization):
        """Test code limit check when at limit."""
        # Set low limit for testing
        test_organization.max_codes = 5
        db.commit()

        # Create 5 codes (at limit)
        for i in range(5):
            code = DiagnosticCode(
                code=f"TEST{i:03d}",
                description=f"Test code {i}",
                category="Test",
                severity="low",
                is_active=True,
                organization_id=test_organization.id
            )
            db.add(code)
        db.commit()

        can_create, message = OrganizationService.check_code_limit(
            db,
            test_organization.id
        )

        assert can_create is False
        assert "maximum code limit" in message.lower()


class TestMultiTenancyIsolation:
    """Test suite for multi-tenancy data isolation."""

    def test_code_isolation_between_organizations(
        self,
        db: Session,
        test_organization: Organization,
        second_organization: Organization
    ):
        """Test that codes are isolated between organizations."""
        # Create codes for org 1
        for i in range(3):
            code = DiagnosticCode(
                code=f"ORG1-{i:03d}",
                description=f"Org 1 code {i}",
                category="Test",
                severity="low",
                is_active=True,
                organization_id=test_organization.id
            )
            db.add(code)

        # Create codes for org 2
        for i in range(2):
            code = DiagnosticCode(
                code=f"ORG2-{i:03d}",
                description=f"Org 2 code {i}",
                category="Test",
                severity="low",
                is_active=True,
                organization_id=second_organization.id
            )
            db.add(code)
        db.commit()

        # Get codes for org 1
        service = DiagnosticCodeService(db)
        org1_codes = service.get_codes(organization_id=test_organization.id)

        # Get codes for org 2
        org2_codes = service.get_codes(organization_id=second_organization.id)

        assert len(org1_codes) == 3
        assert len(org2_codes) == 2
        assert all(c.organization_id == test_organization.id for c in org1_codes)
        assert all(c.organization_id == second_organization.id for c in org2_codes)

    def test_code_uniqueness_per_organization(
        self,
        db: Session,
        test_organization: Organization,
        second_organization: Organization
    ):
        """Test that same code can exist in different organizations."""
        # Create code "DUPLICATE" in org 1
        code1 = DiagnosticCode(
            code="DUPLICATE",
            description="Org 1 version",
            category="Test",
            severity="low",
            is_active=True,
            organization_id=test_organization.id
        )
        db.add(code1)
        db.commit()

        # Create same code "DUPLICATE" in org 2 (should succeed)
        code2 = DiagnosticCode(
            code="DUPLICATE",
            description="Org 2 version",
            category="Test",
            severity="high",
            is_active=True,
            organization_id=second_organization.id
        )
        db.add(code2)
        db.commit()

        # Both should exist
        service = DiagnosticCodeService(db)
        org1_code = service.get_code_by_code("DUPLICATE", test_organization.id)
        org2_code = service.get_code_by_code("DUPLICATE", second_organization.id)

        assert org1_code is not None
        assert org2_code is not None
        assert org1_code.id != org2_code.id
        assert org1_code.description == "Org 1 version"
        assert org2_code.description == "Org 2 version"

    def test_user_isolation_between_organizations(
        self,
        db: Session,
        test_organization: Organization,
        second_organization: Organization
    ):
        """Test that users are isolated between organizations."""
        # Create users for org 1
        for i in range(3):
            user = User(
                email=f"org1user{i}@test.com",
                username=f"org1user{i}",
                hashed_password="hashed",
                role="user",
                is_active=True,
                organization_id=test_organization.id
            )
            db.add(user)

        # Create users for org 2
        for i in range(2):
            user = User(
                email=f"org2user{i}@test.com",
                username=f"org2user{i}",
                hashed_password="hashed",
                role="user",
                is_active=True,
                organization_id=second_organization.id
            )
            db.add(user)
        db.commit()

        # Get stats for each org
        stats1 = OrganizationService.get_organization_stats(db, test_organization.id)
        stats2 = OrganizationService.get_organization_stats(db, second_organization.id)

        assert stats1["user_count"] == 3
        assert stats2["user_count"] == 2

    def test_limit_enforcement_per_organization(
        self,
        db: Session,
        test_organization: Organization,
        second_organization: Organization
    ):
        """Test that limits are enforced per organization."""
        # Set different limits
        test_organization.max_codes = 5
        second_organization.max_codes = 10
        db.commit()

        # Fill org 1 to limit
        for i in range(5):
            code = DiagnosticCode(
                code=f"ORG1-{i:03d}",
                description=f"Code {i}",
                category="Test",
                severity="low",
                is_active=True,
                organization_id=test_organization.id
            )
            db.add(code)
        db.commit()

        # Org 1 should be at limit
        can_create1, msg1 = OrganizationService.check_code_limit(
            db,
            test_organization.id
        )
        assert can_create1 is False

        # Org 2 should still have capacity
        can_create2, msg2 = OrganizationService.check_code_limit(
            db,
            second_organization.id
        )
        assert can_create2 is True
