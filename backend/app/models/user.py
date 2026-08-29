"""
User model for authentication and role-based access control.

This module defines the User SQLAlchemy model used by all VIA features.
Every protected endpoint identifies the caller via this model.
"""

from sqlalchemy import Boolean, Column, DateTime, Integer, String, func

from app.core.database import Base


class User(Base):
    """
    Central identity record for VIA platform users.

    NECESSITY: Every protected endpoint needs to identify the caller.
    LOGIC: Stores credentials, role, and profile data. Roles control
    which features a user can access (RBAC).
    EDGE-CASE: email is unique but nullable to handle OAuth providers
    that might not return an email.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False, default="")
    role = Column(String(20), nullable=False, default="RESIDENT")
    is_active = Column(Boolean, default=True, nullable=False)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
