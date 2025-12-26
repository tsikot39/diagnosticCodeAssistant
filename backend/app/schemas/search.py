"""
Search schemas for request/response validation.
"""
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel


class SearchSuggestion(BaseModel):
    """Autocomplete suggestion."""
    code: str
    description: str
    category: str
    match_type: str  # code, description, category

    class Config:
        from_attributes = True


class SearchResult(BaseModel):
    """Search result with highlighting."""
    id: int
    code: str
    description: str
    category: str
    severity: str
    is_active: bool
    highlighted_code: Optional[str] = None
    highlighted_description: Optional[str] = None
    relevance_score: float

    class Config:
        from_attributes = True


class RecentSearchResponse(BaseModel):
    """Recent search response."""
    id: int
    query: str
    created_at: datetime

    class Config:
        from_attributes = True


class SavedSearchCreate(BaseModel):
    """Saved search creation."""
    name: str
    query: str
    filters: Optional[Dict[str, Any]] = None
    is_default: bool = False


class SavedSearchResponse(BaseModel):
    """Saved search response."""
    id: int
    name: str
    query: str
    filters: Optional[Dict[str, Any]] = None
    is_default: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
