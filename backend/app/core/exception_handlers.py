"""
Global exception handlers for standardized error responses.
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import uuid

logger = logging.getLogger(__name__)


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions with standardized response."""
    request_id = str(uuid.uuid4())
    
    # Log the error
    logger.error(
        f"HTTP {exc.status_code} - {exc.detail}",
        extra={
            "request_id": request_id,
            "path": request.url.path,
            "method": request.method
        }
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status_code": exc.status_code,
            "error": get_error_name(exc.status_code),
            "message": exc.detail,
            "details": None,
            "request_id": request_id
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with detailed information."""
    request_id = str(uuid.uuid4())
    
    # Log validation errors
    logger.warning(
        f"Validation error: {exc.errors()}",
        extra={
            "request_id": request_id,
            "path": request.url.path,
            "method": request.method
        }
    )
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status_code": 422,
            "error": "Validation Error",
            "message": "Request validation failed",
            "details": [
                {
                    "loc": error.get("loc"),
                    "msg": error.get("msg"),
                    "type": error.get("type"),
                    "ctx": error.get("ctx")
                }
                for error in exc.errors()
            ],
            "request_id": request_id
        }
    )


async def database_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle database errors."""
    request_id = str(uuid.uuid4())
    
    # Log database errors
    logger.error(
        f"Database error: {str(exc)}",
        extra={
            "request_id": request_id,
            "path": request.url.path,
            "method": request.method
        },
        exc_info=True
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status_code": 500,
            "error": "Database Error",
            "message": "An error occurred while processing your request",
            "details": None,
            "request_id": request_id
        }
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions."""
    request_id = str(uuid.uuid4())
    
    # Log unexpected errors
    logger.error(
        f"Unexpected error: {str(exc)}",
        extra={
            "request_id": request_id,
            "path": request.url.path,
            "method": request.method
        },
        exc_info=True
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status_code": 500,
            "error": "Internal Server Error",
            "message": "An unexpected error occurred",
            "details": None,
            "request_id": request_id
        }
    )


def get_error_name(status_code: int) -> str:
    """Get human-readable error name from status code."""
    error_names = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        405: "Method Not Allowed",
        409: "Conflict",
        422: "Validation Error",
        429: "Too Many Requests",
        500: "Internal Server Error",
        502: "Bad Gateway",
        503: "Service Unavailable",
    }
    return error_names.get(status_code, "Error")
