"""
API endpoints for user favorites.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select

from app.db.database import get_db
from app.models.user import User
from app.models.user_favorite import UserFavorite
from app.models.diagnostic_code import DiagnosticCode
from app.schemas.diagnostic_code import DiagnosticCodeResponse
from app.core.deps import get_current_active_user

router = APIRouter()


@router.get("/favorites", response_model=List[DiagnosticCodeResponse])
def get_user_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get current user's favorite diagnostic codes."""
    favorites = db.execute(
        select(DiagnosticCode)
        .join(UserFavorite, UserFavorite.diagnostic_code_id == DiagnosticCode.id)
        .where(UserFavorite.user_id == current_user.id)
        .options(selectinload(DiagnosticCode.organization))
        .order_by(UserFavorite.created_at.desc())
    ).scalars().all()
    
    return favorites


@router.post("/favorites/{code_id}", status_code=status.HTTP_201_CREATED)
def add_to_favorites(
    code_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Add a diagnostic code to user's favorites."""
    # Check if code exists
    code = db.query(DiagnosticCode).filter(DiagnosticCode.id == code_id).first()
    if not code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Diagnostic code not found"
        )
    
    # Check if already favorited
    existing = db.query(UserFavorite).filter(
        UserFavorite.user_id == current_user.id,
        UserFavorite.diagnostic_code_id == code_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code already in favorites"
        )
    
    # Add to favorites
    favorite = UserFavorite(
        user_id=current_user.id,
        diagnostic_code_id=code_id
    )
    db.add(favorite)
    db.commit()
    
    return {"message": "Added to favorites", "code": code.code}


@router.delete("/favorites/{code_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_favorites(
    code_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Remove a diagnostic code from user's favorites."""
    favorite = db.query(UserFavorite).filter(
        UserFavorite.user_id == current_user.id,
        UserFavorite.diagnostic_code_id == code_id
    ).first()
    
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Code not in favorites"
        )
    
    db.delete(favorite)
    db.commit()
    
    return None


@router.get("/favorites/check/{code_id}")
def is_favorite(
    code_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Check if a code is in user's favorites."""
    favorite = db.query(UserFavorite).filter(
        UserFavorite.user_id == current_user.id,
        UserFavorite.diagnostic_code_id == code_id
    ).first()
    
    return {"is_favorite": favorite is not None}
