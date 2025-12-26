"""
Application configuration settings.
"""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""
    
    # API Settings
    PROJECT_NAME: str = "Diagnostic Code Assistant API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "API for managing and searching diagnostic codes"
    API_V1_STR: str = "/api/v1"
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    # Database Settings
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/diagnostic_codes"
    
    # Cache Settings
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL: int = 300  # 5 minutes default
    
    # Security Settings
    SECRET_KEY: str = "your-secret-key-change-in-production-must-be-at-least-32-characters-long"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AI Settings
    GEMINI_API_KEY: str = ""  # Optional: Set for AI-powered search
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow"
    )


settings = Settings()
