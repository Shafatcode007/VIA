"""
Authentication service for user registration and login.

NECESSITY: Business logic for auth operations.
LOGIC: Coordinates between repository, security, and schema layers.
EDGE-CASE: Handles duplicate emails, invalid credentials, inactive users.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.repositories.user_repository import create_user, get_user_by_email
from app.schemas.auth_schema import RegisterRequest, TokenResponse, UserResponse


async def register_user(session: AsyncSession, data: RegisterRequest) -> TokenResponse:
    """
    Register a new user and return authentication token.

    NECESSITY: New users need accounts to use protected features.
    LOGIC: Checks email uniqueness, hashes password, creates user, returns token.
    EDGE-CASE: If email already exists, raises ValueError with clear message.
    """
    existing = await get_user_by_email(session, data.email.lower())
    if existing:
        raise ValueError("Email already registered")

    hashed = hash_password(data.password)
    user = await create_user(
        session=session,
        email=data.email.lower(),
        hashed_password=hashed,
        full_name=data.full_name,
        role=data.role,
        phone=data.phone,
    )

    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


async def authenticate_user(session: AsyncSession, email: str, password: str) -> TokenResponse:
    """
    Authenticate a user with email and password.

    NECESSITY: Login requires credential verification.
    LOGIC: Looks up user, verifies password, returns token.
    EDGE-CASE: Raises ValueError on invalid credentials or inactive user.
    """
    user = await get_user_by_email(session, email.lower())
    if not user:
        raise ValueError("Invalid email or password")

    if not verify_password(password, user.hashed_password):
        raise ValueError("Invalid email or password")

    if not user.is_active:
        raise ValueError("Account is deactivated")

    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )
