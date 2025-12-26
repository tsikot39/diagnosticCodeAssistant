"""
Tests for version control service.
"""
import pytest
from datetime import datetime
from sqlalchemy.orm import Session

from app.services.version_service import VersionService
from app.models.diagnostic_code import DiagnosticCode
from app.models.code_version import CodeVersion, CodeComment
from app.models.user import User


@pytest.fixture
def test_user(db: Session):
    """Create a test user."""
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password="hashed",
        role="user",
        is_active=True,
        organization_id=1
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_code(db: Session):
    """Create a test diagnostic code."""
    code = DiagnosticCode(
        code="TEST001",
        description="Test code",
        category="Testing",
        severity="low",
        is_active=True,
        organization_id=1
    )
    db.add(code)
    db.commit()
    db.refresh(code)
    return code


class TestVersionService:
    """Test suite for VersionService."""

    def test_create_version(self, db: Session, test_code: DiagnosticCode, test_user: User):
        """Test creating a version snapshot."""
        version = VersionService.create_version(
            db=db,
            diagnostic_code=test_code,
            user_id=test_user.id,
            change_type="CREATE",
            change_summary="First version",
            changed_fields=["all"]
        )

        assert version is not None
        assert version.diagnostic_code_id == test_code.id
        assert version.created_by == test_user.id
        assert version.change_type == "CREATE"
        assert version.version_number == 1
        assert version.change_summary == "First version"
        assert version.code == "TEST001"
        assert version.description == "Test code"

    def test_version_numbering(self, db: Session, test_code: DiagnosticCode, test_user: User):
        """Test version numbers increment correctly."""
        v1 = VersionService.create_version(
            db=db,
            diagnostic_code=test_code,
            user_id=test_user.id,
            change_type="CREATE",
            changed_fields=["all"],
            change_summary="Version 1"
        )

        v2 = VersionService.create_version(
            db=db,
            diagnostic_code=test_code,
            user_id=test_user.id,
            change_type="UPDATE",
            changed_fields=["description"],
            change_summary="Version 2"
        )

        assert v1.version_number == 1
        assert v2.version_number == 2

    def test_get_versions(self, db: Session, test_code: DiagnosticCode, test_user: User):
        """Test retrieving version history."""
        # Create multiple versions
        for i in range(5):
            VersionService.create_version(
                db=db,
                diagnostic_code=test_code,
                user_id=test_user.id,
                change_type="UPDATE",
                changed_fields=["iteration"],
                change_summary=f"Version {i+1}"
            )

        versions, total = VersionService.get_versions(db, test_code.id, skip=0, limit=10)

        assert total == 5
        assert len(versions) == 5
        # Should be ordered newest first
        assert versions[0].version_number == 5
        assert versions[-1].version_number == 1

    def test_get_versions_pagination(self, db: Session, test_code: DiagnosticCode, test_user: User):
        """Test pagination of version history."""
        # Create 10 versions
        for i in range(10):
            VersionService.create_version(
                db=db,
                diagnostic_code=test_code,
                user_id=test_user.id,
                change_type="UPDATE",
                changed_fields=["iteration"],
                change_summary=f"Version {i+1}"
            )

        # Get first page
        versions, total = VersionService.get_versions(db, test_code.id, skip=0, limit=5)
        assert total == 10
        assert len(versions) == 5
        assert versions[0].version_number == 10

        # Get second page
        versions, total = VersionService.get_versions(db, test_code.id, skip=5, limit=5)
        assert total == 10
        assert len(versions) == 5
        assert versions[0].version_number == 5

    def test_get_version_by_id(self, db: Session, test_code: DiagnosticCode, test_user: User):
        """Test retrieving a specific version."""
        created = VersionService.create_version(
            db=db,
            diagnostic_code=test_code,
            user_id=test_user.id,
            change_type="CREATE",
            changed_fields=["all"],
            change_summary="Test version"
        )

        retrieved = VersionService.get_version_by_id(db, created.id)

        assert retrieved is not None
        assert retrieved.id == created.id
        assert retrieved.change_summary == "Test version"

    def test_compare_versions(self, db: Session, test_code: DiagnosticCode, test_user: User):
        """Test comparing two versions."""
        v1 = VersionService.create_version(
            db=db,
            diagnostic_code=test_code,
            user_id=test_user.id,
            change_type="CREATE",
            changed_fields=["all"],
            change_summary="V1"
        )

        # Update the code
        test_code.description = "Updated description"
        test_code.severity = "high"
        db.commit()

        v2 = VersionService.create_version(
            db=db,
            diagnostic_code=test_code,
            user_id=test_user.id,
            change_type="UPDATE",
            changed_fields=["description", "severity"],
            change_summary="V2"
        )

        differences = VersionService.compare_versions(db, v1.id, v2.id)

        assert "description" in differences
        assert differences["description"]["old"] == "Test code"
        assert differences["description"]["new"] == "Updated description"
        assert "severity" in differences
        assert differences["severity"]["old"] == "low"
        assert differences["severity"]["new"] == "high"

    def test_restore_version(self, db: Session, test_code: DiagnosticCode, test_user: User):
        """Test restoring to a previous version."""
        # Create initial version
        v1 = VersionService.create_version(
            db=db,
            diagnostic_code=test_code,
            user_id=test_user.id,
            change_type="CREATE",
            changed_fields=["all"],
            change_summary="Original"
        )

        # Modify code
        test_code.description = "Changed description"
        db.commit()

        v2 = VersionService.create_version(
            db=db,
            diagnostic_code=test_code,
            user_id=test_user.id,
            change_type="UPDATE",
            changed_fields=["description"],
            change_summary="Modified"
        )

        # Restore to v1
        restored_code = VersionService.restore_version(
            db=db,
            diagnostic_code_id=test_code.id,
            version_id=v1.id,
            user_id=test_user.id,
            comment="Restoring to original"
        )

        assert restored_code is not None
        assert restored_code.description == "Test code"  # Restored to original

        # Check that a RESTORE version was created
        versions, total = VersionService.get_versions(db, test_code.id, skip=0, limit=10)
        assert total == 3  # CREATE, UPDATE, RESTORE
        assert versions[0].change_type == "RESTORE"
        assert "Restoring to original" in versions[0].change_summary

    def test_create_comment(self, db: Session, test_code: DiagnosticCode, test_user: User):
        """Test adding a comment to a version."""
        version = VersionService.create_version(
            db=db,
            diagnostic_code=test_code,
            user_id=test_user.id,
            change_type="CREATE",
            changed_fields=["all"],
            change_summary="V1"
        )

        from app.schemas.code_version import CodeCommentCreate
        comment_data = CodeCommentCreate(
            version_id=version.id,
            content="This is a test comment"
        )

        comment = VersionService.create_comment(
            db=db,
            diagnostic_code_id=test_code.id,
            user_id=test_user.id,
            comment_data=comment_data
        )

        assert comment is not None
        assert comment.version_id == version.id
        assert comment.created_by == test_user.id
        assert comment.content == "This is a test comment"

    def test_get_comments(self, db: Session, test_code: DiagnosticCode, test_user: User):
        """Test retrieving comments for a code."""
        version = VersionService.create_version(
            db=db,
            diagnostic_code=test_code,
            user_id=test_user.id,
            change_type="CREATE",
            changed_fields=["all"],
            change_summary="V1"
        )

        # Create multiple comments
        from app.schemas.code_version import CodeCommentCreate
        for i in range(3):
            comment_data = CodeCommentCreate(
                version_id=version.id,
                content=f"Comment {i+1}"
            )
            VersionService.create_comment(
                db=db,
                diagnostic_code_id=test_code.id,
                user_id=test_user.id,
                comment_data=comment_data
            )

        comments, total, unresolved = VersionService.get_comments(
            db=db,
            diagnostic_code_id=test_code.id,
            skip=0,
            limit=10
        )

        assert total == 3
        assert len(comments) == 3

    def test_update_comment(self, db: Session, test_code: DiagnosticCode, test_user: User):
        """Test updating a comment."""
        version = VersionService.create_version(
            db=db,
            diagnostic_code=test_code,
            user_id=test_user.id,
            change_type="CREATE",
            changed_fields=["all"],
            change_summary="V1"
        )

        from app.schemas.code_version import CodeCommentCreate, CodeCommentUpdate
        comment_data = CodeCommentCreate(
            version_id=version.id,
            content="Original content"
        )
        comment = VersionService.create_comment(
            db=db,
            diagnostic_code_id=test_code.id,
            user_id=test_user.id,
            comment_data=comment_data
        )

        # Update comment
        update_data = CodeCommentUpdate(content="Updated content")
        updated = VersionService.update_comment(db, comment.id, test_user.id, update_data)

        assert updated is not None
        assert updated.content == "Updated content"

    def test_delete_comment(self, db: Session, test_code: DiagnosticCode, test_user: User):
        """Test deleting a comment."""
        version = VersionService.create_version(
            db=db,
            diagnostic_code=test_code,
            user_id=test_user.id,
            change_type="CREATE",
            changed_fields=["all"],
            change_summary="V1"
        )

        from app.schemas.code_version import CodeCommentCreate
        comment_data = CodeCommentCreate(
            version_id=version.id,
            content="To be deleted"
        )
        comment = VersionService.create_comment(
            db=db,
            diagnostic_code_id=test_code.id,
            user_id=test_user.id,
            comment_data=comment_data
        )

        # Delete comment
        result = VersionService.delete_comment(db, comment.id, test_user.id)
        assert result is True

        # Verify it's deleted
        deleted = db.query(CodeComment).filter(CodeComment.id == comment.id).first()
        assert deleted is None

    def test_version_isolation_by_code(self, db: Session, test_user: User):
        """Test that versions are isolated per code."""
        code1 = DiagnosticCode(
            code="CODE1",
            description="Code 1",
            category="Test",
            severity="low",
            is_active=True,
            organization_id=1
        )
        code2 = DiagnosticCode(
            code="CODE2",
            description="Code 2",
            category="Test",
            severity="low",
            is_active=True,
            organization_id=1
        )
        db.add_all([code1, code2])
        db.commit()

        # Create versions for both codes
        VersionService.create_version(db, code1, "CREATE", test_user.id, "C1V1", [])
        VersionService.create_version(db, code1, "UPDATE", test_user.id, "C1V2", [])
        VersionService.create_version(db, code2, "CREATE", test_user.id, "C2V1", [])

        # Check isolation
        code1_versions, code1_total = VersionService.get_versions(db, code1.id, 0, 10)
        code2_versions, code2_total = VersionService.get_versions(db, code2.id, 0, 10)

        assert code1_total == 2
        assert code2_total == 1
        assert all(v.diagnostic_code_id == code1.id for v in code1_versions)
        assert all(v.diagnostic_code_id == code2.id for v in code2_versions)
