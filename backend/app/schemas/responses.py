"""
Standardized error response schemas and exception handlers.
"""
from typing import Optional, Any, Dict
from pydantic import BaseModel


class ErrorDetail(BaseModel):
    """Detailed error information."""
    
    loc: Optional[list] = None
    msg: str
    type: str
    ctx: Optional[Dict[str, Any]] = None


class ErrorResponse(BaseModel):
    """Standardized API error response."""
    
    status_code: int
    error: str
    message: str
    details: Optional[list[ErrorDetail]] = None
    request_id: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "status_code": 404,
                "error": "Not Found",
                "message": "Diagnostic code with ID 123 not found",
                "details": None,
                "request_id": "req_abc123"
            }
        }


class SuccessResponse(BaseModel):
    """Standardized success response."""
    
    status_code: int = 200
    message: str
    data: Optional[Any] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "status_code": 200,
                "message": "Operation completed successfully",
                "data": {"id": 123, "code": "A01.0"}
            }
        }
