"""
Advanced search endpoints with autocomplete.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.db.database import get_db
from app.services.search_service import SearchService
from app.schemas.search import (
    SearchSuggestion,
    SearchResult,
    RecentSearchResponse,
    SavedSearchCreate,
    SavedSearchResponse,
)
from app.core.deps import get_current_active_user
from app.models.user import User

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/autocomplete", response_model=List[SearchSuggestion])
@limiter.limit("100/minute")
async def autocomplete(
    request: Request,
    query: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Get autocomplete suggestions for search query."""
    service = SearchService(db)
    return service.get_autocomplete_suggestions(query, limit)


@router.get("/advanced", response_model=List[SearchResult])
@limiter.limit("100/minute")
async def advanced_search(
    request: Request,
    query: str = Query(..., min_length=1),
    fuzzy: bool = Query(False),
    highlight: bool = Query(True),
    category: Optional[str] = None,
    severity: Optional[str] = None,
    is_active: Optional[bool] = None,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Advanced search with fuzzy matching and highlighting."""
    service = SearchService(db)
    
    # Track search
    service.track_search(current_user.id, query)
    
    return service.advanced_search(
        query=query,
        fuzzy=fuzzy,
        highlight=highlight,
        category=category,
        severity=severity,
        is_active=is_active,
        limit=limit
    )


@router.get("/recent", response_model=List[RecentSearchResponse])
async def get_recent_searches(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get user's recent searches."""
    service = SearchService(db)
    return service.get_recent_searches(current_user.id, limit)


@router.delete("/recent")
async def clear_recent_searches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Clear user's recent searches."""
    service = SearchService(db)
    service.clear_recent_searches(current_user.id)
    return {"message": "Recent searches cleared"}


@router.get("/saved", response_model=List[SavedSearchResponse])
async def get_saved_searches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get user's saved search presets."""
    service = SearchService(db)
    return service.get_saved_searches(current_user.id)


@router.post("/saved", response_model=SavedSearchResponse, status_code=201)
async def create_saved_search(
    search_data: SavedSearchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Save a search preset."""
    service = SearchService(db)
    return service.save_search(current_user.id, search_data)


@router.delete("/saved/{search_id}")
async def delete_saved_search(
    search_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a saved search preset."""
    service = SearchService(db)
    service.delete_saved_search(current_user.id, search_id)
    return {"message": "Saved search deleted"}
