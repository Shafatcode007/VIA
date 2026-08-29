"""Transport endpoints: fare estimate, booking, status tracking, driver panel, payments."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.transport import RideBooking, RideStatus
from app.models.user import User
from app.schemas.transport_schema import (
    BookingCreate,
    BookingOut,
    FareEstimateOut,
    FareEstimateRequest,
    StatusUpdate,
    DriverProfileCreate,
    DriverProfileOut,
    AvailabilityUpdate,
    PaymentRequest,
    PaymentOut,
    NotificationOut,
)
from app.services.transport.fare_estimator import estimate_fare
from app.services.transport_service import TransportService
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/transport", tags=["transport"])


def _to_out(booking: RideBooking) -> BookingOut:
    return BookingOut(
        id=booking.id,
        vehicle_type=booking.vehicle_type.value,
        pickup_label=booking.pickup_label,
        drop_label=booking.drop_label,
        distance_km=booking.distance_km,
        estimated_fare=booking.estimated_fare,
        status=booking.status.value,
        payment_status=booking.payment_status.value,
        payment_method=booking.payment_method,
        transaction_ref=booking.transaction_ref,
        paid_at=booking.paid_at,
        driver_name=booking.driver.name if booking.driver else None,
        vehicle_number=booking.driver.vehicle_number if booking.driver else None,
        created_at=booking.created_at,
    )


@router.post("/fare-estimate", response_model=FareEstimateOut)
async def fare_estimate(payload: FareEstimateRequest) -> FareEstimateOut:
    try:
        fare = estimate_fare(payload.vehicle_type, payload.pickup_lat, payload.pickup_lon, payload.drop_lat, payload.drop_lon)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return FareEstimateOut(
        vehicle_type=fare.vehicle_type,
        base_fare=fare.base_fare,
        distance_km=fare.distance_km,
        distance_cost=fare.distance_cost,
        total_fare=fare.total_fare,
    )


@router.post("/bookings", response_model=BookingOut, status_code=201)
async def create_booking(
    payload: BookingCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> BookingOut:
    service = TransportService(session)
    booking = await service.create_booking(user.id, payload)
    await session.commit()
    return _to_out(booking)


@router.get("/bookings", response_model=list[BookingOut])
async def list_bookings(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> list[BookingOut]:
    bookings = await TransportService(session).list_for_user(user.id)
    return [_to_out(b) for b in bookings]


@router.patch("/bookings/{booking_id}/status", response_model=BookingOut)
async def update_status(
    booking_id: int,
    payload: StatusUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> BookingOut:
    try:
        target = RideStatus(payload.status)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=f"Unknown status: {payload.status}") from exc
    booking = await TransportService(session).transition(booking_id, target, user)
    await session.commit()
    return _to_out(booking)


# Driver panel endpoints
@router.post("/driver/profile", response_model=DriverProfileOut, status_code=201)
async def create_driver_profile(
    payload: DriverProfileCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> DriverProfileOut:
    if user.role != "DRIVER":
        raise HTTPException(status_code=403, detail="Only users with DRIVER role can create driver profiles")
    service = TransportService(session)
    driver = await service.create_driver_profile(user.id, payload.name, payload.vehicle_type, payload.vehicle_number)
    await session.commit()
    return DriverProfileOut(
        id=driver.id,
        name=driver.name,
        phone=driver.phone,
        vehicle_type=driver.vehicle_type.value,
        vehicle_number=driver.vehicle_number,
        is_available=driver.is_available,
        rating=driver.rating,
        created_at=driver.created_at,
    )


@router.get("/driver/bookings", response_model=list[BookingOut])
async def list_driver_bookings(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> list[BookingOut]:
    if user.role != "DRIVER":
        raise HTTPException(status_code=403, detail="Only users with DRIVER role can access driver bookings")
    bookings = await TransportService(session).list_for_driver(user.id)
    return [_to_out(b) for b in bookings]


@router.patch("/driver/availability", response_model=DriverProfileOut)
async def toggle_driver_availability(
    payload: AvailabilityUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> DriverProfileOut:
    if user.role != "DRIVER":
        raise HTTPException(status_code=403, detail="Only users with DRIVER role can toggle availability")
    service = TransportService(session)
    driver = await service.toggle_availability(user.id, payload.is_available)
    await session.commit()
    return DriverProfileOut(
        id=driver.id,
        name=driver.name,
        phone=driver.phone,
        vehicle_type=driver.vehicle_type.value,
        vehicle_number=driver.vehicle_number,
        is_available=driver.is_available,
        rating=driver.rating,
        created_at=driver.created_at,
    )


# Payment endpoint
@router.post("/bookings/{booking_id}/pay", response_model=BookingOut)
async def pay_booking(
    booking_id: int,
    payload: PaymentRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> BookingOut:
    booking = await TransportService(session).pay_ride(booking_id, payload.payment_method)
    await session.commit()
    return _to_out(booking)


# Driver profile GET endpoint
@router.get("/driver/profile", response_model=DriverProfileOut)
async def get_driver_profile(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> DriverProfileOut:
    if user.role != "DRIVER":
        raise HTTPException(status_code=403, detail="Only users with DRIVER role can access driver profile")
    service = TransportService(session)
    driver = await service.get_profile(user.id)
    return DriverProfileOut(
        id=driver.id,
        name=driver.name,
        phone=driver.phone,
        vehicle_type=driver.vehicle_type.value,
        vehicle_number=driver.vehicle_number,
        is_available=driver.is_available,
        rating=driver.rating,
        created_at=driver.created_at,
    )


# Driver requests (incoming ride requests)
@router.get("/driver/requests", response_model=list[BookingOut])
async def driver_requests(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> list[BookingOut]:
    if user.role != "DRIVER":
        raise HTTPException(status_code=403, detail="Only users with DRIVER role can access driver requests")
    requests = await TransportService(session).list_requests(user.id)
    return [_to_out(b) for b in requests]


# Accept booking
@router.post("/driver/bookings/{booking_id}/accept", response_model=BookingOut)
async def accept_booking(
    booking_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> BookingOut:
    if user.role != "DRIVER":
        raise HTTPException(status_code=403, detail="Only users with DRIVER role can accept bookings")
    booking = await TransportService(session).accept_booking(user.id, booking_id)
    await session.commit()
    return _to_out(booking)


# Notifications
@router.get("/notifications", response_model=list[NotificationOut])
async def my_notifications(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> list[NotificationOut]:
    return await NotificationService(session).for_user(user.id)


@router.post("/notifications/read-all")
async def mark_all_read(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    await NotificationService(session).mark_all_read(user.id)
    await session.commit()
    return {"status": "ok"}