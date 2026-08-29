"""In-app notifications (poll-based) for drivers and passengers."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    kind: Mapped[str] = mapped_column(String(40))  # RIDE_REQUEST | RIDE_ACCEPTED | PAYMENT_DUE | PAYMENT_RECEIVED
    title: Mapped[str] = mapped_column(String(120))
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    ride_id: Mapped[int | None] = mapped_column(ForeignKey("ride_bookings.id"), nullable=True)
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())