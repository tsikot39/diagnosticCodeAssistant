"""
Main FastAPI application entry point for Diagnostic Code Assistant.
"""
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import sentry_sdk

from app.api.v1.api import api_router
from app.core.config import settings
from app.db.database import create_db_and_tables
from app.middleware.security import SecurityHeadersMiddleware
from app.core.exception_handlers import (
    http_exception_handler,
    validation_exception_handler,
    database_exception_handler,
    generic_exception_handler
)

# Initialize Sentry for error tracking
if os.getenv("SENTRY_DSN"):
    sentry_sdk.init(
        dsn=os.getenv("SENTRY_DSN"),
        environment=os.getenv("ENVIRONMENT", "development"),
        traces_sample_rate=0.1,  # 10% of transactions
        profiles_sample_rate=0.1,
    )

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup - skip DB creation during tests
    if not os.getenv("TESTING"):
        create_db_and_tables()
    yield
    # Shutdown
    pass


app = FastAPI(
    title="Diagnostic Code Assistant API",
    description="""
## 🏥 Diagnostic Code Assistant API

A comprehensive REST API for managing diagnostic codes (medical ICD codes, error codes, etc.) with advanced features.

### 🌟 Key Features

* **Authentication**: JWT-based user authentication and authorization
* **RBAC**: Role-based access control (viewer, user, manager, admin)
* **Advanced Search**: Autocomplete, fuzzy matching, and result highlighting
* **Analytics**: Track user activity and code usage statistics
* **Audit Logging**: Complete audit trail for compliance (HIPAA, SOC2)
* **Notifications**: Real-time in-app notifications
* **Bulk Operations**: CSV import/export, bulk updates and deletions
* **Caching**: Redis-powered caching for improved performance

### 🔐 Authentication

Most endpoints require authentication. To authenticate:

1. Register: `POST /api/v1/auth/register`
2. Login: `POST /api/v1/auth/login` (returns JWT token)
3. Include token in subsequent requests: `Authorization: Bearer <token>`

### 👥 User Roles

* **Viewer**: Read-only access to diagnostic codes
* **User**: Can create, read, update, and delete codes (default)
* **Manager**: User permissions + team management capabilities
* **Admin**: Full system access including user management

### 📚 Documentation

* Interactive API docs: `/docs` (Swagger UI)
* Alternative docs: `/redoc` (ReDoc)
* OpenAPI schema: `/openapi.json`

### 🚀 Quick Start

```python
# Login
response = requests.post('/api/v1/auth/login', data={
    'username': 'your_username',
    'password': 'your_password'
})
token = response.json()['access_token']

# Search codes
headers = {'Authorization': f'Bearer {token}'}
codes = requests.get('/api/v1/diagnostic-codes?search=diabetes', headers=headers)
```
    """,
    version="2.0.0",
    contact={
        "name": "API Support",
        "email": "support@diagnosticcode.example.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# Add response compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
@limiter.limit("60/minute")
async def root(request: Request):
    """Root endpoint."""
    return {
        "message": "Welcome to Diagnostic Code Assistant API",
        "version": settings.VERSION,
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
