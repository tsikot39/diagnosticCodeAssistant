"""
Advanced search service with autocomplete and fuzzy matching.
"""
from typing import List, Optional, Dict, Any
from sqlalchemy import func, or_, and_, desc
from sqlalchemy.orm import Session
from difflib import SequenceMatcher

from app.models.diagnostic_code import DiagnosticCode
from app.models.search import RecentSearch, SavedSearch
from app.schemas.search import (
    SearchSuggestion,
    SearchResult,
    SavedSearchCreate,
)


class SearchService:
    """Service for advanced search operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_autocomplete_suggestions(self, query: str, limit: int = 10) -> List[SearchSuggestion]:
        """Get autocomplete suggestions based on partial query."""
        query_lower = query.lower()
        
        # Search in code, description, and category
        results = self.db.query(DiagnosticCode).filter(
            and_(
                DiagnosticCode.is_active == True,
                or_(
                    func.lower(DiagnosticCode.code).like(f"{query_lower}%"),
                    func.lower(DiagnosticCode.description).like(f"%{query_lower}%"),
                    func.lower(DiagnosticCode.category).like(f"{query_lower}%")
                )
            )
        ).limit(limit).all()
        
        suggestions = []
        for code in results:
            # Determine match type
            match_type = "description"
            if code.code.lower().startswith(query_lower):
                match_type = "code"
            elif code.category.lower().startswith(query_lower):
                match_type = "category"
            
            suggestions.append(SearchSuggestion(
                code=code.code,
                description=code.description,
                category=code.category,
                match_type=match_type
            ))
        
        return suggestions

    def advanced_search(
        self,
        query: str,
        fuzzy: bool = False,
        highlight: bool = True,
        category: Optional[str] = None,
        severity: Optional[str] = None,
        is_active: Optional[bool] = None,
        limit: int = 20
    ) -> List[SearchResult]:
        """Advanced search with fuzzy matching and highlighting."""
        query_lower = query.lower()
        
        # Build base query
        db_query = self.db.query(DiagnosticCode)
        
        # Apply filters
        filters = []
        if category:
            filters.append(DiagnosticCode.category == category)
        if severity:
            filters.append(DiagnosticCode.severity == severity)
        if is_active is not None:
            filters.append(DiagnosticCode.is_active == is_active)
        
        if filters:
            db_query = db_query.filter(and_(*filters))
        
        # Search condition
        search_filter = or_(
            func.lower(DiagnosticCode.code).like(f"%{query_lower}%"),
            func.lower(DiagnosticCode.description).like(f"%{query_lower}%")
        )
        
        results = db_query.filter(search_filter).limit(limit * 2).all()  # Get more for fuzzy ranking
        
        # Calculate relevance scores and apply fuzzy matching
        scored_results = []
        for code in results:
            score = self._calculate_relevance(code, query_lower, fuzzy)
            
            result = SearchResult(
                id=code.id,
                code=code.code,
                description=code.description,
                category=code.category,
                severity=code.severity,
                is_active=code.is_active,
                relevance_score=score
            )
            
            # Add highlighting
            if highlight:
                result.highlighted_code = self._highlight_text(code.code, query)
                result.highlighted_description = self._highlight_text(code.description, query)
            
            scored_results.append(result)
        
        # Sort by relevance and limit
        scored_results.sort(key=lambda x: x.relevance_score, reverse=True)
        return scored_results[:limit]

    def _calculate_relevance(self, code: DiagnosticCode, query: str, fuzzy: bool) -> float:
        """Calculate relevance score for search result."""
        score = 0.0
        
        code_lower = code.code.lower()
        desc_lower = code.description.lower()
        
        # Exact match in code (highest priority)
        if query == code_lower:
            score += 100.0
        elif code_lower.startswith(query):
            score += 50.0
        elif query in code_lower:
            score += 25.0
        
        # Match in description
        if query in desc_lower:
            # Score based on position (earlier = better)
            position = desc_lower.find(query)
            score += 20.0 / (position + 1)
        
        # Fuzzy matching
        if fuzzy:
            code_similarity = SequenceMatcher(None, query, code_lower).ratio()
            desc_similarity = SequenceMatcher(None, query, desc_lower).ratio()
            score += (code_similarity * 10.0) + (desc_similarity * 5.0)
        
        return score

    def _highlight_text(self, text: str, query: str) -> str:
        """Add HTML highlighting to matched text."""
        if not text or not query:
            return text
        
        # Case-insensitive replacement with <mark> tags
        import re
        pattern = re.compile(re.escape(query), re.IGNORECASE)
        return pattern.sub(lambda m: f"<mark>{m.group(0)}</mark>", text)

    def track_search(self, user_id: int, query: str):
        """Track a user's search query."""
        # Check if same query exists recently (within last 10 searches)
        recent = self.db.query(RecentSearch).filter(
            RecentSearch.user_id == user_id
        ).order_by(desc(RecentSearch.created_at)).limit(10).all()
        
        # Don't duplicate if same query is in recent searches
        if not any(s.query == query for s in recent):
            search = RecentSearch(user_id=user_id, query=query)
            self.db.add(search)
            self.db.commit()
        
        # Keep only last 50 searches
        total = self.db.query(func.count(RecentSearch.id)).filter(
            RecentSearch.user_id == user_id
        ).scalar()
        
        if total > 50:
            old_searches = self.db.query(RecentSearch).filter(
                RecentSearch.user_id == user_id
            ).order_by(RecentSearch.created_at).limit(total - 50).all()
            
            for s in old_searches:
                self.db.delete(s)
            self.db.commit()

    def get_recent_searches(self, user_id: int, limit: int = 10) -> List[RecentSearch]:
        """Get user's recent searches."""
        return self.db.query(RecentSearch).filter(
            RecentSearch.user_id == user_id
        ).order_by(desc(RecentSearch.created_at)).limit(limit).all()

    def clear_recent_searches(self, user_id: int):
        """Clear all recent searches for a user."""
        self.db.query(RecentSearch).filter(
            RecentSearch.user_id == user_id
        ).delete()
        self.db.commit()

    def get_saved_searches(self, user_id: int) -> List[SavedSearch]:
        """Get user's saved search presets."""
        return self.db.query(SavedSearch).filter(
            SavedSearch.user_id == user_id
        ).order_by(SavedSearch.name).all()

    def save_search(self, user_id: int, search_data: SavedSearchCreate) -> SavedSearch:
        """Save a search preset."""
        # If setting as default, unset other defaults
        if search_data.is_default:
            self.db.query(SavedSearch).filter(
                SavedSearch.user_id == user_id,
                SavedSearch.is_default == True
            ).update({"is_default": False})
        
        search = SavedSearch(
            user_id=user_id,
            name=search_data.name,
            query=search_data.query,
            filters=search_data.filters,
            is_default=search_data.is_default
        )
        
        self.db.add(search)
        self.db.commit()
        self.db.refresh(search)
        return search

    def delete_saved_search(self, user_id: int, search_id: int):
        """Delete a saved search preset."""
        self.db.query(SavedSearch).filter(
            SavedSearch.id == search_id,
            SavedSearch.user_id == user_id
        ).delete()
        self.db.commit()
