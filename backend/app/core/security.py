"""
Security module for JWT authentication and password hashing.

NECESSITY: Provides cryptographic utilities for auth flow.
LOGIC: Uses bcrypt for password hashing and python-jose for JWT.
EDGE-CASE: All tokens have expiry to prevent indefinite sessions.
"""

from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    """
    Hash a plain-text password using bcrypt.

    NECESSITY: Passwords must never be stored in plain text.
    LOGIC: bcrypt automatically generates a salt and hashes the password.
    EDGE-CASE: None - bcrypt handles all edge cases internally.
    """
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against a bcrypt hash.

    NECESSITY: Login requires password verification.
    LOGIC: bcrypt.checkpw compares the password against the stored hash.
    EDGE-CASE: Returns False on any error (wrong password, malformed hash).
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Create a JWT access token.

    NECESSITY: Stateless authentication requires tokens.
    LOGIC: Encodes user data (id, email, role) into a signed JWT.
    EDGE-CASE: Default expiry is ACCESS_TOKEN_EXPIRE_MINUTES from config.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict:
    """
    Decode and validate a JWT access token.

    NECESSITY: Every protected request must validate the token.
    LOGIC: Decodes the JWT and returns the payload dict.
    EDGE-CASE: Raises JWTError on expired or invalid tokens.
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
