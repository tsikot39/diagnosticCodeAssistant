"""
AI-powered diagnostic code search service using Google Gemini.
"""
import json
import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.core.config import settings
from app.models.diagnostic_code import DiagnosticCode

logger = logging.getLogger(__name__)

# Initialize Gemini (lazy loading)
_gemini_model = None


def get_gemini_model():
    """Get or initialize Gemini model."""
    global _gemini_model
    
    if not settings.GEMINI_API_KEY:
        return None
    
    if _gemini_model is None:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            _gemini_model = genai.GenerativeModel('gemini-3-flash')
            logger.info("Google Gemini 3 Flash initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {e}")
            return None
    
    return _gemini_model


async def ai_search_codes(
    query: str,
    db: AsyncSession,
    limit: int = 10
) -> List[DiagnosticCode]:
    """
    Use AI to search for diagnostic codes based on natural language query.
    
    Args:
        query: Natural language search query (e.g., "chest pain radiating to left arm")
        db: Database session
        limit: Maximum number of results to return
    
    Returns:
        List of matching diagnostic codes
    """
    model = get_gemini_model()
    
    if not model:
        logger.warning("Gemini not configured, falling back to regular search")
        return await _fallback_search(query, db, limit)
    
    try:
        # Get all available codes from database for context
        result = await db.execute(
            select(DiagnosticCode)
            .where(DiagnosticCode.is_active == True)
            .limit(200)  # Get sample of codes for AI context
        )
        all_codes = result.scalars().all()
        
        # Create a structured list of codes for the AI
        codes_context = [
            {
                "code": code.code,
                "description": code.description,
                "category": code.category,
                "subcategory": code.subcategory,
                "severity": code.severity
            }
            for code in all_codes[:100]  # Limit context to avoid token limits
        ]
        
        # Create prompt for Gemini
        prompt = f"""You are a medical coding assistant. Given the following diagnostic codes database and a search query, identify the most relevant diagnostic codes.

Available codes (sample):
{json.dumps(codes_context, indent=2)}

User query: "{query}"

Based on the query, return a JSON array of the most relevant code identifiers (just the code values like "ICD-E11.9", "ICD-I10", etc.) in order of relevance. Return ONLY the JSON array, no other text.

Example response format: ["ICD-I21.9", "ICD-I25.10", "ICD-I20.0"]

If the query doesn't match any codes well, return an empty array: []
"""
        
        # Get AI response
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Parse AI response
        try:
            # Extract JSON from response (handle cases where AI adds extra text)
            if "[" in response_text and "]" in response_text:
                start = response_text.index("[")
                end = response_text.rindex("]") + 1
                json_str = response_text[start:end]
                suggested_codes = json.loads(json_str)
            else:
                suggested_codes = []
            
            logger.info(f"AI suggested codes: {suggested_codes}")
            
            if not suggested_codes:
                return await _fallback_search(query, db, limit)
            
            # Fetch the suggested codes from database
            result = await db.execute(
                select(DiagnosticCode)
                .where(
                    DiagnosticCode.code.in_(suggested_codes),
                    DiagnosticCode.is_active == True
                )
            )
            codes = result.scalars().all()
            
            # Sort codes by AI suggestion order
            code_dict = {code.code: code for code in codes}
            sorted_codes = [code_dict[c] for c in suggested_codes if c in code_dict]
            
            # If we got fewer results than expected, supplement with fallback search
            if len(sorted_codes) < min(limit, 3):
                fallback_codes = await _fallback_search(query, db, limit)
                # Add fallback codes that aren't already in results
                existing_ids = {code.id for code in sorted_codes}
                for fb_code in fallback_codes:
                    if fb_code.id not in existing_ids and len(sorted_codes) < limit:
                        sorted_codes.append(fb_code)
            
            return sorted_codes[:limit]
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response: {e}. Response: {response_text}")
            return await _fallback_search(query, db, limit)
            
    except Exception as e:
        logger.error(f"AI search error: {e}")
        return await _fallback_search(query, db, limit)


async def _fallback_search(
    query: str,
    db: AsyncSession,
    limit: int = 10
) -> List[DiagnosticCode]:
    """Fallback to regular fuzzy search if AI is not available."""
    search_term = f"%{query}%"
    
    result = await db.execute(
        select(DiagnosticCode)
        .where(
            or_(
                DiagnosticCode.code.ilike(search_term),
                DiagnosticCode.description.ilike(search_term),
                DiagnosticCode.category.ilike(search_term),
                DiagnosticCode.subcategory.ilike(search_term)
            ),
            DiagnosticCode.is_active == True
        )
        .limit(limit)
    )
    
    return result.scalars().all()


async def get_ai_suggestions(
    symptoms: str,
    db: AsyncSession,
    limit: int = 5
) -> Dict[str, Any]:
    """
    Get AI-powered diagnostic code suggestions based on symptoms.
    
    Args:
        symptoms: Natural language description of symptoms
        db: Database session
        limit: Maximum number of suggestions
    
    Returns:
        Dictionary with suggestions and explanations
    """
    model = get_gemini_model()
    
    if not model:
        return {
            "suggestions": await _fallback_search(symptoms, db, limit),
            "explanation": "AI suggestions not available. Showing fuzzy search results.",
            "confidence": "low"
        }
    
    try:
        codes = await ai_search_codes(symptoms, db, limit)
        
        # Get AI explanation for the suggestions
        if codes:
            code_list = ", ".join([f"{c.code} ({c.description})" for c in codes[:3]])
            explanation_prompt = f"""Given the symptoms: "{symptoms}"
And these suggested diagnostic codes: {code_list}

Provide a brief 1-2 sentence explanation of why these codes are relevant. Keep it concise and professional."""
            
            response = model.generate_content(explanation_prompt)
            explanation = response.text.strip()
        else:
            explanation = "No matching diagnostic codes found for the given symptoms."
        
        return {
            "suggestions": codes,
            "explanation": explanation,
            "confidence": "high" if codes else "low"
        }
        
    except Exception as e:
        logger.error(f"Error getting AI suggestions: {e}")
        return {
            "suggestions": await _fallback_search(symptoms, db, limit),
            "explanation": "AI service temporarily unavailable. Showing fuzzy search results.",
            "confidence": "low"
        }
