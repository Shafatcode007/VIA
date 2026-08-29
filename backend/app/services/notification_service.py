"""Create and fetch in-app notifications."""

from __future__ import annotations

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification


class NotificationService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def queue(self, user_id: int, kind: str, title: str, body: str | None = None, ride_id: int | None = None) -> None:
        self.session.add(Notification(user_id=user_id, kind=kind, title=title, body=body, ride_id=ride_id))

    async def for_user(self, user_id: int, limit: int = 20) -> list[Notification]:
        result = await self.session.execute(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def mark_all_read(self, user_id: int) -> None:
        await self.session.execute(
            update(Notification).where(Notification.user_id == user_id, Notification.read.is_(False)).values(read=True)
        )