"""Pydantic contracts for the transport module."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class FareEstimateRequest(BaseModel):
    vehicle_type: str
    pickup_lat: float = Field(ge=-90, le=90)
    pickup_lon: float = Field(ge=-180, le=180)
    drop_lat: float = Field(ge=-90, le=90)
    drop_lon: float = Field(ge=-180, le=180)


class FareEstimateOut(BaseModel):
    vehicle_type: str
    base_fare: float
    distance_km: float
    distance_cost: float
    total_fare: float


class BookingCreate(FareEstimateRequest):
    pickup_label: str | None = None
    drop_label: str | None = None


class BookingOut(BaseModel):
    id: int
    vehicle_type: str
    pickup_label: str | None = None
    drop_label: str | None = None
    distance_km: float
    estimated_fare: float
    status: str
    payment_status: str
    payment_method: str | None = None
    transaction_ref: str | None = None
    paid_at: datetime | None = None
    driver_name: str | None = None
    vehicle_number: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class StatusUpdate(BaseModel):
    status: str


# Driver profile schemas
class DriverProfileCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    vehicle_type: str
    vehicle_number: str = Field(min_length=1, max_length=20)


class DriverProfileOut(BaseModel):
    id: int
    name: str
    phone: str | None = None
    vehicle_type: str
    vehicle_number: str
    is_available: bool
    rating: float
    created_at: datetime

    model_config = {"from_attributes": True}


class AvailabilityUpdate(BaseModel):
    is_available: bool


# Payment schemas
class PaymentRequest(BaseModel):
    payment_method: str = Field(pattern="^(bkash|nagad|card|cash)$")


class PaymentOut(BaseModel):
    payment_status: str
    payment_method: str | None = None
    transaction_ref: str | None = None
    paid_at: datetime | None = None

    model_config = {"from_attributes": True}


# Notification schemas
class NotificationOut(BaseModel):
    id: int
    kind: str
    title: str
    body: str | None = None
    ride_id: int | None = None
    read: bool
    created_at: datetime

    model_config = {"from_attributes": True}