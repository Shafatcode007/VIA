"""
Authentication API router.

NECESSITY: Provides registration, login, and profile endpoints.
LOGIC: Thin router that delegates to auth_service.
EDGE-CASE: Returns appropriate HTTP status codes for each scenario.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth_schema import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services import auth_service
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    Register a new user account.

    NECESSITY: New users need accounts to use the platform.
    LOGIC: Validates input, creates user, returns JWT token.
    EDGE-CASE: Returns 409 if email already registered.
    """
    try:
        return await auth_service.register_user(db, data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    Authenticate a user and return JWT token.

    NECESSITY: Users need to log in to access protected features.
    LOGIC: Validates credentials, returns token.
    EDGE-CASE: Returns 401 on invalid credentials.
    """
    try:
        return await auth_service.authenticate_user(db, data.email, data.password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """
    Get current authenticated user profile.

    NECESSITY: Frontend needs user data for UI rendering.
    LOGIC: Returns the authenticated user's profile.
    EDGE-CASE: None - user is guaranteed by dependency.
    """
    return UserResponse.model_validate(current_user)


@router.post("/become-driver")
async def become_driver(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> dict:
    """
    Upgrade current user to DRIVER role and issue a new JWT.

    NECESSITY: Users must opt-in to become drivers; role claim lives in JWT.
    LOGIC: Updates user role to DRIVER, re-issues JWT with new claim.
    EDGE-CASE: Admin accounts cannot switch; already-DRIVER is idempotent.
    """
    if current_user.role == "ADMIN":
        raise HTTPException(status_code=409, detail="Admin accounts cannot switch to Driver")
    if current_user.role == "DRIVER":
        # Idempotent: reissue token with current role
        token = create_access_token(data={"sub": str(current_user.id), "email": current_user.email, "role": "DRIVER"})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {"id": current_user.id, "email": current_user.email, "role": "DRIVER", "name": current_user.full_name},
        }
    current_user.role = "DRIVER"
    await session.commit()
    token = create_access_token(data={"sub": str(current_user.id), "email": current_user.email, "role": "DRIVER"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": current_user.id, "email": current_user.email, "role": "DRIVER", "name": current_user.full_name},
    }
