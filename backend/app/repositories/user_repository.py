"""
User repository for database operations.

NECESSITY: Separates database queries from business logic.
LOGIC: All user DB operations go through this repository.
EDGE-CASE: Handles unique constraint violations gracefully.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


async def create_user(
    session: AsyncSession,
    email: str,
    hashed_password: str,
    full_name: str,
    role: str = "RESIDENT",
    phone: str | None = None,
) -> User:
    """
    Create a new user in the database.

    NECESSITY: Registration requires inserting a user record.
    LOGIC: Creates User object, adds to session, flushes to get ID.
    EDGE-CASE: Caller must handle IntegrityError for duplicate email.
    """
    user = User(
        email=email,
        hashed_password=hashed_password,
        full_name=full_name,
        role=role,
        phone=phone,
    )
    session.add(user)
    await session.flush()
    return user


async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    """
    Find a user by email address.

    NECESSITY: Login requires looking up user by email.
    LOGIC: Case-sensitive email lookup (emails normalized before storage).
    EDGE-CASE: Returns None if no user found.
    """
    result = await session.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(session: AsyncSession, user_id: int) -> User | None:
    """
    Find a user by ID.

    NECESSITY: Token validation requires fetching user by ID.
    EDGE-CASE: Returns None if user doesn't exist.
    """
    result = await session.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def list_users(session: AsyncSession) -> list[User]:
    """
    List all users.

    NECESSITY: Admin dashboard needs user listing.
    EDGE-CASE: Returns empty list if no users exist.
    """
    result = await session.execute(select(User).order_by(User.created_at.desc()))
    return list(result.scalars().all())


async def update_user_status(session: AsyncSession, user_id: int, is_active: bool) -> User | None:
    """
    Activate or deactivate a user.

    NECESSITY: Admin needs to disable problematic accounts.
    EDGE-CASE: Returns None if user doesn't exist.
    """
    user = await get_user_by_id(session, user_id)
    if user:
        user.is_active = is_active
        await session.flush()
    return user
