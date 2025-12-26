"""Health check endpoint for monitoring."""
from fastapi import APIRouter, status
from sqlalchemy import text
from app.db.database import get_db

router = APIRouter()

@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Health check endpoint for monitoring and load balancers."""
    return {
        "status": "healthy",
        "service": "diagnostic-code-assistant-api",
        "version": "1.0.0"
    }

@router.get("/health/db", status_code=status.HTTP_200_OK)
async def database_health_check():
    """Check database connectivity."""
    try:
        db = next(get_db())
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }
