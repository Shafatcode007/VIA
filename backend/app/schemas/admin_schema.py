"""Pydantic schemas for admin endpoints."""

from datetime import datetime
from pydantic import BaseModel


class AdminUserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    phone: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AdminUserListOut(BaseModel):
    users: list[AdminUserOut]
    total: int


class AdminUserToggleOut(BaseModel):
    id: int
    email: str
    is_active: bool


class AdminAnalyticsOut(BaseModel):
    users_by_role: dict[str, int]
    total_orders: int
    total_revenue_cents: int
    total_rides: int
    total_ride_revenue_cents: int
    top_sellers: list[dict]
