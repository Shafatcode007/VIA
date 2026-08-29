"""Transport booking workflow: create, driver dispatch via notifications, status machine, driver panel, payments."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.transport import Driver, RideBooking, RideStatus, VehicleType, PaymentStatus
from app.models.user import User
from app.models.notification import Notification
from app.schemas.transport_schema import BookingCreate
from app.services.transport.fare_estimator import estimate_fare, FareEstimate, BOOKABLE_VEHICLES
from app.services.notification_service import NotificationService

ALLOWED_TRANSITIONS: dict[RideStatus, set[RideStatus]] = {
    RideStatus.REQUESTED: {RideStatus.ACCEPTED, RideStatus.CANCELLED},
    RideStatus.ACCEPTED: {RideStatus.IN_PROGRESS, RideStatus.CANCELLED},
    RideStatus.IN_PROGRESS: {RideStatus.COMPLETED},
    RideStatus.COMPLETED: set(),
    RideStatus.CANCELLED: set(),
}


class TransportService:
    """All transport business logic lives here; routers stay thin."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_booking(self, user_id: int, payload: BookingCreate) -> RideBooking:
        fare = estimate_fare(payload.vehicle_type, payload.pickup_lat, payload.pickup_lon, payload.drop_lat, payload.drop_lon)
        booking = RideBooking(
            user_id=user_id,
            vehicle_type=VehicleType(fare.vehicle_type),
            pickup_lat=payload.pickup_lat,
            pickup_lon=payload.pickup_lon,
            pickup_label=payload.pickup_label,
            drop_lat=payload.drop_lat,
            drop_lon=payload.drop_lon,
            drop_label=payload.drop_label,
            distance_km=fare.distance_km,
            estimated_fare=fare.total_fare,
            status=RideStatus.REQUESTED,
        )
        self.session.add(booking)
        await self.session.flush()
        
        # Notify all matching available drivers
        drivers = (await self.session.execute(
            select(Driver).where(
                Driver.vehicle_type == booking.vehicle_type,
                Driver.is_available.is_(True),
                Driver.user_id.is_not(None),
            )
        )).scalars().all()
        
        notifier = NotificationService(self.session)
        for driver in drivers:
            notifier.queue(
                driver.user_id, "RIDE_REQUEST",
                f"New {booking.vehicle_type.value.upper()} request",
                f"Ride #{booking.id} · {booking.distance_km} km · ৳{booking.estimated_fare}",
                ride_id=booking.id,
            )
        
        await self.session.flush()
        await self.session.refresh(booking, ["driver"])
        return booking

    async def list_for_user(self, user_id: int) -> list[RideBooking]:
        result = await self.session.execute(
            select(RideBooking)
            .where(RideBooking.user_id == user_id)
            .options(selectinload(RideBooking.driver))
            .order_by(RideBooking.created_at.desc())
        )
        return list(result.scalars().all())

    async def list_for_driver(self, user_id: int) -> list[RideBooking]:
        result = await self.session.execute(
            select(RideBooking)
            .join(Driver, Driver.id == RideBooking.driver_id)
            .where(Driver.user_id == user_id)
            .options(selectinload(RideBooking.driver))
            .order_by(RideBooking.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_profile(self, user_id: int) -> Driver:
        driver = (await self.session.execute(select(Driver).where(Driver.user_id == user_id))).scalars().first()
        if driver is None:
            raise HTTPException(status_code=404, detail="Driver profile not found")
        return driver

    async def list_requests(self, driver_user_id: int) -> list[RideBooking]:
        driver = await self.get_profile(driver_user_id)
        result = await self.session.execute(
            select(RideBooking)
            .where(RideBooking.status == RideStatus.REQUESTED, RideBooking.vehicle_type == driver.vehicle_type)
            .order_by(RideBooking.created_at.desc())
        )
        return list(result.scalars().all())

    async def accept_booking(self, driver_user_id: int, booking_id: int) -> RideBooking:
        driver = await self.get_profile(driver_user_id)
        booking = await self.session.get(RideBooking, booking_id, with_for_update=True)
        if booking is None:
            raise HTTPException(status_code=404, detail="Booking not found")
        if booking.status != RideStatus.REQUESTED:
            raise HTTPException(status_code=409, detail="Trip already taken or closed")
        if driver.vehicle_type != booking.vehicle_type:
            raise HTTPException(status_code=409, detail="Vehicle type does not match this request")
        booking.driver_id = driver.id
        booking.status = RideStatus.ACCEPTED
        await self.session.flush()
        NotificationService(self.session).queue(
            booking.user_id, "RIDE_ACCEPTED",
            f"Driver {driver.name} accepted ride #{booking.id}",
            ride_id=booking.id,
        )
        await self.session.refresh(booking, ["driver"])
        return booking

    async def transition(self, booking_id: int, target: RideStatus, user: User) -> RideBooking:
        from sqlalchemy.orm import selectinload
        booking = await self.session.get(RideBooking, booking_id, with_for_update=True, options=[selectinload(RideBooking.driver)])
        if booking is None:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Authorization: only booking owner, assigned driver (via user_id), or admin can transition
        is_owner = booking.user_id == user.id
        is_driver = booking.driver_id is not None and booking.driver.user_id == user.id
        is_admin = user.role == "ADMIN"
        
        if not (is_owner or is_driver or is_admin):
            raise HTTPException(status_code=403, detail="Not authorized to update this booking")
        
        # Passenger can only CANCEL from REQUESTED or ACCEPTED
        if is_owner and not is_driver and not is_admin:
            if target != RideStatus.CANCELLED:
                raise HTTPException(status_code=403, detail="Passengers can only cancel rides")
            if booking.status not in {RideStatus.REQUESTED, RideStatus.ACCEPTED}:
                raise HTTPException(status_code=409, detail=f"Cannot cancel from {booking.status.value}")
        
        if target not in ALLOWED_TRANSITIONS[booking.status]:
            raise HTTPException(status_code=409, detail=f"Invalid transition {booking.status.value} -> {target.value}")
        
        booking.status = target
        await self.session.flush()
        
        # Queue PAYMENT_DUE notification when ride is completed
        if target == RideStatus.COMPLETED:
            NotificationService(self.session).queue(
                booking.user_id, "PAYMENT_DUE",
                f"Ride #{booking.id} completed — pay ৳{booking.estimated_fare}",
                ride_id=booking.id,
            )
        
        await self.session.refresh(booking, ["driver"])
        return booking

    # Driver panel methods
    async def create_driver_profile(self, user_id: int, name: str, vehicle_type: str, vehicle_number: str) -> Driver:
        key = vehicle_type.strip().lower()
        if key not in BOOKABLE_VEHICLES:
            raise HTTPException(status_code=422, detail=f"Unsupported vehicle type: {vehicle_type}")
        existing = (await self.session.execute(select(Driver).where(Driver.user_id == user_id))).scalars().first()
        if existing is not None:
            raise HTTPException(status_code=409, detail="Driver profile already exists")
        driver = Driver(user_id=user_id, name=name, vehicle_type=VehicleType(key), vehicle_number=vehicle_number)
        self.session.add(driver)
        await self.session.flush()
        return driver

    async def toggle_availability(self, user_id: int, is_available: bool) -> Driver:
        result = await self.session.execute(select(Driver).where(Driver.user_id == user_id))
        driver = result.scalars().first()
        if driver is None:
            raise HTTPException(status_code=404, detail="Driver profile not found")
        driver.is_available = is_available
        await self.session.flush()
        await self.session.refresh(driver)
        return driver

    async def pay_ride(self, booking_id: int, method: str) -> RideBooking:
        booking = await self.session.get(RideBooking, booking_id, with_for_update=True, options=[selectinload(RideBooking.driver)])
        if booking is None:
            raise HTTPException(status_code=404, detail="Booking not found")
        if booking.status != RideStatus.COMPLETED:
            raise HTTPException(status_code=409, detail="Ride must be COMPLETED before payment")
        if booking.payment_status == PaymentStatus.PAID:
            return booking  # idempotent: repeated pay returns the same paid state
        booking.payment_status = PaymentStatus.PAID
        booking.payment_method = method
        booking.transaction_ref = f"RIDE-{booking.id}-{uuid4().hex[:8].upper()}"
        booking.paid_at = datetime.now(timezone.utc)
        await self.session.flush()
        
        # Queue PAYMENT_RECEIVED notification for driver
        if booking.driver and booking.driver.user_id:
            NotificationService(self.session).queue(
                booking.driver.user_id, "PAYMENT_RECEIVED",
                f"Payment received for ride #{booking.id}",
                ride_id=booking.id,
            )
        
        return booking