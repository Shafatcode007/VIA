"""
Pydantic schemas for authentication requests and responses.

NECESSITY: Validates all auth-related API inputs/outputs.
LOGIC: Pydantic ensures type safety and automatic OpenAPI docs.
EDGE-CASE: Password validation prevents weak passwords.
"""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """Request body for user registration."""

    email: EmailStr
    password: str = Field(min_length=6, description="Password must be at least 6 characters")
    full_name: str = Field(min_length=1, max_length=255)
    role: str = Field(default="RESIDENT", pattern="^(RESIDENT|LANDLORD|SELLER|DRIVER)$")
    phone: str | None = None


class LoginRequest(BaseModel):
    """Request body for user login."""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Response body for user data."""

    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    phone: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """Response body for successful authentication."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
