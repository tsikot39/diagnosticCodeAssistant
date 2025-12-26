"""
Complete seed script to populate the database with organization, users, and sample codes.
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.organization import Organization
from app.models.user import User
from app.models.diagnostic_code import DiagnosticCode
from app.core.security import get_password_hash


def seed_database():
    """Seed the database with test data."""
    db = SessionLocal()
    
    try:
        print("🌱 Starting database seeding...\n")
        
        # 1. Create default organization
        print("📦 Creating default organization...")
        org = db.query(Organization).filter(Organization.slug == "default-org").first()
        if not org:
            org = Organization(
                name="Default Organization",
                slug="default-org",
                description="Default organization for testing",
                email="admin@default-org.com",
                is_active=True,
                max_users=100,
                max_codes=10000
            )
            db.add(org)
            db.commit()
            db.refresh(org)
            print(f"✅ Created organization: {org.name} (ID: {org.id})")
        else:
            print(f"✅ Organization already exists: {org.name} (ID: {org.id})")
        
        # 2. Create test users
        print("\n👥 Creating test users...")
        users_data = [
            {
                "email": "admin@example.com",
                "username": "admin",
                "full_name": "Admin User",
                "password": "admin123",
                "role": "admin",
                "is_superuser": True,
                "is_active": True,
            },
            {
                "email": "manager@example.com",
                "username": "manager",
                "full_name": "Manager User",
                "password": "manager123",
                "role": "manager",
                "is_superuser": False,
                "is_active": True,
            },
            {
                "email": "user@example.com",
                "username": "user",
                "full_name": "Regular User",
                "password": "user123",
                "role": "user",
                "is_superuser": False,
                "is_active": True,
            },
        ]
        
        for user_data in users_data:
            existing_user = db.query(User).filter(
                (User.email == user_data["email"]) | (User.username == user_data["username"])
            ).first()
            
            if not existing_user:
                user = User(
                    organization_id=org.id,
                    email=user_data["email"],
                    username=user_data["username"],
                    hashed_password=get_password_hash(user_data["password"]),
                    full_name=user_data["full_name"],
                    is_active=user_data["is_active"],
                    is_superuser=user_data["is_superuser"],
                    role=user_data["role"],
                )
                db.add(user)
                db.commit()
                print(f"✅ Created user: {user.username} ({user.role})")
            else:
                print(f"⚠️  User already exists: {user_data['username']}")
        
        # 3. Create sample diagnostic codes
        print("\n🏥 Creating sample diagnostic codes...")
        sample_codes = [
            {
                "code": "ICD-E11.9",
                "description": "Type 2 diabetes mellitus without complications",
                "category": "ENDOCRINE",
                "subcategory": "Diabetes",
                "severity": "medium",
                "is_active": True
            },
            {
                "code": "ICD-I10",
                "description": "Essential (primary) hypertension",
                "category": "CARDIOVASCULAR",
                "subcategory": "Hypertension",
                "severity": "medium",
                "is_active": True
            },
            {
                "code": "ICD-J45.909",
                "description": "Unspecified asthma, uncomplicated",
                "category": "RESPIRATORY",
                "subcategory": "Asthma",
                "severity": "medium",
                "is_active": True
            },
            {
                "code": "ERR-DB001",
                "description": "Database connection timeout",
                "category": "ERROR",
                "subcategory": "Database",
                "severity": "high",
                "is_active": True
            },
            {
                "code": "ERR-AUTH001",
                "description": "Authentication failed - Invalid credentials",
                "category": "ERROR",
                "subcategory": "Authentication",
                "severity": "medium",
                "is_active": True
            },
            {
                "code": "ICD-M79.3",
                "description": "Panniculitis, unspecified",
                "category": "MUSCULOSKELETAL",
                "subcategory": "Soft Tissue",
                "severity": "low",
                "is_active": True
            },
            {
                "code": "ICD-K21.9",
                "description": "Gastro-esophageal reflux disease without esophagitis",
                "category": "DIGESTIVE",
                "subcategory": "GERD",
                "severity": "low",
                "is_active": True
            },
            {
                "code": "ICD-F41.1",
                "description": "Generalized anxiety disorder",
                "category": "MENTAL_HEALTH",
                "subcategory": "Anxiety",
                "severity": "medium",
                "is_active": True
            },
        ]
        
        for code_data in sample_codes:
            existing_code = db.query(DiagnosticCode).filter(
                DiagnosticCode.code == code_data["code"],
                DiagnosticCode.organization_id == org.id
            ).first()
            
            if not existing_code:
                diagnostic_code = DiagnosticCode(
                    organization_id=org.id,
                    **code_data
                )
                db.add(diagnostic_code)
                db.commit()
                print(f"✅ Created code: {code_data['code']}")
            else:
                print(f"⚠️  Code already exists: {code_data['code']}")
        
        print("\n✨ Database seeding completed successfully!")
        print("\n📝 Test Credentials:")
        print("   Admin:   admin@example.com / admin123")
        print("   Manager: manager@example.com / manager123")
        print("   User:    user@example.com / user123")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error during seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
