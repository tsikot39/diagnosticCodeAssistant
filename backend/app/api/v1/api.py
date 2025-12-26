"""
Main API router that includes all endpoint routers.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import (
    diagnostic_codes, health, auth, analytics, audit, search, users, bulk,
    notifications, versions, webhooks, organizations, favorites, bulk_operations
)

api_router = APIRouter()

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["authentication"]
)

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["users"]
)

api_router.include_router(
    favorites.router,
    prefix="/users",
    tags=["favorites"]
)

api_router.include_router(
    diagnostic_codes.router,
    prefix="/diagnostic-codes",
    tags=["diagnostic-codes"]
)

api_router.include_router(
    bulk.router,
    prefix="/bulk",
    tags=["bulk-operations"]
)

api_router.include_router(
    bulk_operations.router,
    prefix="/api/v1",
    tags=["bulk-operations"]
)

api_router.include_router(
    search.router,
    prefix="/search",
    tags=["search"]
)

api_router.include_router(
    notifications.router,
    prefix="/notifications",
    tags=["notifications"]
)

api_router.include_router(
    versions.router,
    prefix="/codes",
    tags=["version-control"]
)

api_router.include_router(
    webhooks.router,
    prefix="/webhooks",
    tags=["webhooks"]
)

api_router.include_router(
    organizations.router,
    prefix="/organizations",
    tags=["organizations"]
)

api_router.include_router(
    analytics.router,
    prefix="/analytics",
    tags=["analytics"]
)

api_router.include_router(
    audit.router,
    prefix="/audit",
    tags=["audit"]
)

api_router.include_router(
    health.router,
    tags=["health"]
)
