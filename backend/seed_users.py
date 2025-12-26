"""
Seed script to create test users with different roles.
Run this after running migrations: python seed_users.py
"""
import sys
from pathlib import Path

# Add the backend directory to the Python path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.models.user import User
from app.core.security import get_password_hash


def create_test_users(db: Session):
    """Create test users with different roles."""
    
    test_users = [
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
        {
            "email": "viewer@example.com",
            "username": "viewer",
            "full_name": "Viewer User",
            "password": "viewer123",
            "role": "viewer",
            "is_superuser": False,
            "is_active": True,
        },
        {
            "email": "inactive@example.com",
            "username": "inactive",
            "full_name": "Inactive User",
            "password": "inactive123",
            "role": "user",
            "is_superuser": False,
            "is_active": False,
        },
    ]
    
    created = 0
    skipped = 0
    
    for user_data in test_users:
        # Check if user already exists
        existing = db.query(User).filter(
            (User.email == user_data["email"]) | (User.username == user_data["username"])
        ).first()
        
        if existing:
            print(f"⏭️  Skipped {user_data['username']} (already exists)")
            skipped += 1
            continue
        
        # Create new user
        password = user_data.pop("password")
        user = User(
            **user_data,
            hashed_password=get_password_hash(password)
        )
        
        db.add(user)
        print(f"✅ Created {user_data['username']} ({user_data['role']})")
        created += 1
    
    db.commit()
    
    print(f"\n📊 Summary: {created} users created, {skipped} skipped")
    print("\n🔐 Test Credentials:")
    print("=" * 50)
    for user_data in test_users:
        if user_data['is_active']:
            print(f"Role: {user_data['role']:8} | Username: {user_data['username']:10} | Password: {user_data['password']}")
    print("=" * 50)


def main():
    """Main function to seed test users."""
    print("🌱 Seeding test users...\n")
    
    db = SessionLocal()
    try:
        create_test_users(db)
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()
    
    print("\n✨ Done!")


if __name__ == "__main__":
    main()
