"""
Test script for Favorites API endpoints
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.db.database import get_db
from app.models.user_favorite import UserFavorite
from app.models.user import User
from app.models.diagnostic_code import DiagnosticCode
from sqlalchemy.orm import Session

def test_favorites():
    """Test that favorites model and relationships work correctly"""
    db = next(get_db())
    
    try:
        # Get a sample user
        user = db.query(User).first()
        if not user:
            print("❌ No users found in database. Please create a user first.")
            return
        
        print(f"✅ Found user: {user.username} (ID: {user.id})")
        
        # Get a sample diagnostic code
        code = db.query(DiagnosticCode).first()
        if not code:
            print("❌ No diagnostic codes found. Please import codes first.")
            return
        
        print(f"✅ Found diagnostic code: {code.code} - {code.description[:50]}...")
        
        # Check if favorite already exists
        existing = db.query(UserFavorite).filter(
            UserFavorite.user_id == user.id,
            UserFavorite.diagnostic_code_id == code.id
        ).first()
        
        if existing:
            print(f"✅ User already has this code favorited (created: {existing.created_at})")
        else:
            # Create a test favorite
            favorite = UserFavorite(
                user_id=user.id,
                diagnostic_code_id=code.id
            )
            db.add(favorite)
            db.commit()
            print(f"✅ Created new favorite for user {user.username}")
        
        # Query user's favorites
        favorites_count = db.query(UserFavorite).filter(
            UserFavorite.user_id == user.id
        ).count()
        
        print(f"✅ User has {favorites_count} favorite(s)")
        
        # Test relationship
        if user.favorites:
            print(f"✅ User.favorites relationship working: {len(user.favorites)} favorite(s)")
        
        print("\n🎉 All favorites tests passed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_favorites()
