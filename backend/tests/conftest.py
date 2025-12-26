"""
Pytest configuration and fixtures for backend tests.
"""
import os
import pytest
import sys
from pathlib import Path
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

# Set testing environment variable before importing app
os.environ["TESTING"] = "1"

# Add parent directory to path to import main
sys.path.insert(0, str(Path(__file__).parent.parent))

from main import app
from app.db.database import Base, get_db
from app.models.diagnostic_code import DiagnosticCode
from app.models.organization import Organization
from app.models.user import User
from app.core.deps import get_current_active_user
from app.core.deps import get_current_active_user
from app.core.rbac import require_viewer, require_editor

# Use in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db: Session, test_user: User) -> Generator[TestClient, None, None]:
    """Create a test client with database and auth dependency overrides."""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    def override_get_current_user():
        return test_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_active_user] = override_get_current_user
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_org(db: Session) -> Organization:
    """Create a test organization."""
    org = Organization(
        name="Test Organization",
        slug="test-org",
        description="Test organization for unit tests",
        is_active=True,
        max_users=10,
        max_codes=10000,
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


@pytest.fixture
def test_user(db: Session, test_org: Organization) -> User:
    """Create a test user."""
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password="$2b$12$KIXqjvN3d0xFoXkL8qN9uuCWl8S2P.KR3pJ4Y4K5Pp1Kw8k7Z9kFO",  # hashed "password"
        full_name="Test User",
        role="admin",
        is_active=True,
        organization_id=test_org.id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def sample_diagnostic_code_data() -> dict:
    """Sample diagnostic code data for testing."""
    return {
        "code": "E11.9",
        "description": "Type 2 diabetes mellitus without complications",
        "category": "ENDOCRINE",
        "subcategory": "Diabetes",
        "severity": "medium",
        "is_active": True,
    }


@pytest.fixture
def create_diagnostic_code(db: Session, sample_diagnostic_code_data: dict, test_org: Organization) -> DiagnosticCode:
    """Create a diagnostic code in the database."""
    code = DiagnosticCode(**sample_diagnostic_code_data, organization_id=test_org.id)
    db.add(code)
    db.commit()
    db.refresh(code)
    return code
