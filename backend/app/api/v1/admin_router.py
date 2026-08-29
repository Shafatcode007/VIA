"""Admin API router — all endpoints require ADMIN role."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_role
from app.core.database import get_db
from app.models.user import User
from app.schemas.admin_schema import (
    AdminAnalyticsOut,
    AdminUserListOut,
    AdminUserOut,
    AdminUserToggleOut,
)
from app.services import admin_service

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=AdminUserListOut)
async def list_users(
    _admin: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    users = await admin_service.list_all_users(db)
    return AdminUserListOut(
        users=[AdminUserOut.model_validate(u) for u in users],
        total=len(users),
    )


@router.patch("/users/{user_id}/toggle-active", response_model=AdminUserToggleOut)
async def toggle_user_active(
    user_id: int,
    _admin: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    user = await admin_service.toggle_user_active(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return AdminUserToggleOut(id=user.id, email=user.email, is_active=user.is_active)


@router.get("/analytics", response_model=AdminAnalyticsOut)
async def get_analytics(
    _admin: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    data = await admin_service.get_analytics(db)
    return AdminAnalyticsOut(**data)
