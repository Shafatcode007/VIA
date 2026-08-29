"""Transport domain models: mock drivers and ride bookings."""

from __future__ import annotations

import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String, func, TypeDecorator
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class VehicleType(str, enum.Enum):
    BIKE = "bike"
    EV = "ev"
    CAR = "car"
    CAR_XL = "car_xl"
    AUTO = "auto"  # legacy read-only


class RideStatus(str, enum.Enum):
    REQUESTED = "REQUESTED"
    ACCEPTED = "ACCEPTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class PaymentStatus(str, enum.Enum):
    UNPAID = "UNPAID"
    PAID = "PAID"


class EnumValue(TypeDecorator):
    """Store enum as its value (string) in DB, convert to/from enum in Python."""
    impl = String
    cache_ok = True

    def __init__(self, enum_class: type[enum.Enum], *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.enum_class = enum_class
        self._values = {e.value: e for e in enum_class}

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, self.enum_class):
            return value.value
        if isinstance(value, str) and value in self._values:
            return value
        raise ValueError(f"Invalid {self.enum_class.__name__}: {value}")

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return self._values.get(value)


class Driver(Base):
    __tablename__ = "drivers"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(120))
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    vehicle_type: Mapped[VehicleType] = mapped_column(EnumValue(VehicleType))
    vehicle_number: Mapped[str] = mapped_column(String(20))
    is_available: Mapped[bool] = mapped_column(default=True)
    rating: Mapped[float] = mapped_column(Float, default=4.5)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    bookings: Mapped[list["RideBooking"]] = relationship(back_populates="driver")


class RideBooking(Base):
    __tablename__ = "ride_bookings"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    driver_id: Mapped[int | None] = mapped_column(ForeignKey("drivers.id"), nullable=True)
    vehicle_type: Mapped[VehicleType] = mapped_column(EnumValue(VehicleType))
    pickup_lat: Mapped[float] = mapped_column(Float)
    pickup_lon: Mapped[float] = mapped_column(Float)
    pickup_label: Mapped[str | None] = mapped_column(String(200), nullable=True)
    drop_lat: Mapped[float] = mapped_column(Float)
    drop_lon: Mapped[float] = mapped_column(Float)
    drop_label: Mapped[str | None] = mapped_column(String(200), nullable=True)
    distance_km: Mapped[float] = mapped_column(Float)
    estimated_fare: Mapped[float] = mapped_column(Float)
    status: Mapped[RideStatus] = mapped_column(EnumValue(RideStatus), default=RideStatus.REQUESTED, index=True)
    payment_status: Mapped[PaymentStatus] = mapped_column(EnumValue(PaymentStatus), default=PaymentStatus.UNPAID, index=True)
    payment_method: Mapped[str | None] = mapped_column(String(20), nullable=True)
    transaction_ref: Mapped[str | None] = mapped_column(String(40), nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    driver: Mapped[Driver | None] = relationship(back_populates="bookings")