"""Transport TDD suite: estimator, auth guard, booking lifecycle."""

import uuid
import pytest
import pytest_asyncio
from fastapi.testclient import TestClient

from app.main import app
from app.models.transport import Driver, VehicleType
from app.core.security import hash_password, create_access_token


POINT = {"pickup_lat": 23.7808, "pickup_lon": 90.4074, "drop_lat": 23.8103, "drop_lon": 90.4125}


async def _auth_header(client: pytest.fixture, role: str = "RESIDENT") -> dict:
    email = f"transport_{uuid.uuid4().hex[:8]}@example.com"
    resp = await client.post("/api/v1/auth/register", json={"email": email, "password": "Transport@123", "full_name": "T User", "role": role})
    assert resp.status_code in (200, 201), resp.text
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def test_user_transport(session):
    from app.models.user import User
    unique = uuid.uuid4().hex[:8]
    user = User(
        email=f"transport_{unique}@example.com",
        hashed_password=hash_password("Transport@123"),
        full_name="T User",
        role="RESIDENT",
        is_active=True,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest_asyncio.fixture
async def auth_headers_transport(test_user_transport):
    from app.core.security import create_access_token
    token = create_access_token(data={"sub": str(test_user_transport.id), "email": test_user_transport.email, "role": test_user_transport.role})
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def seeded_drivers(session):
    drivers = [
        Driver(name="Rahim Uddin", phone="+8801712345670", vehicle_type=VehicleType.EV, vehicle_number="DHAKA-EV-001", rating=4.8, is_available=True),
        Driver(name="Karim Hassan", phone="+8801712345671", vehicle_type=VehicleType.EV, vehicle_number="DHAKA-EV-002", rating=4.6, is_available=True),
        Driver(name="Abdul Salam", phone="+8801712345672", vehicle_type=VehicleType.CAR, vehicle_number="DHAKA-CAR-001", rating=4.7, is_available=True),
        Driver(name="Mohammad Ali", phone="+8801712345673", vehicle_type=VehicleType.CAR, vehicle_number="DHAKA-CAR-002", rating=4.5, is_available=True),
        Driver(name="Salim Reza", phone="+8801712345674", vehicle_type=VehicleType.AUTO, vehicle_number="DHAKA-AUTO-001", rating=4.4, is_available=True),
        Driver(name="Jahangir Hossain", phone="+8801712345675", vehicle_type=VehicleType.AUTO, vehicle_number="DHAKA-AUTO-002", rating=4.3, is_available=True),
    ]
    for d in drivers:
        session.add(d)
    await session.commit()
    return drivers


@pytest.mark.asyncio
async def test_fare_estimate_returns_numbers(client):
    res = await client.post("/api/v1/transport/fare-estimate", json={"vehicle_type": "ev", **POINT})
    assert res.status_code == 200
    body = res.json()
    assert body["total_fare"] >= body["base_fare"] > 0
    assert body["distance_km"] > 0


@pytest.mark.asyncio
async def test_fare_estimate_rejects_unknown_vehicle(client):
    res = await client.post("/api/v1/transport/fare-estimate", json={"vehicle_type": "helicopter", **POINT})
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_booking_requires_auth(client):
    res = await client.post("/api/v1/transport/bookings", json={"vehicle_type": "ev", **POINT})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_booking_lifecycle_and_invalid_transition(client, auth_headers_transport, seeded_drivers, session):
    # Passenger books a ride
    created = await client.post("/api/v1/transport/bookings", json={"vehicle_type": "car", **POINT}, headers=auth_headers_transport)
    assert created.status_code == 201, created.text
    booking = created.json()
    assert booking["status"] in ("REQUESTED", "ACCEPTED")
    assert booking["estimated_fare"] > 0
    booking_id = booking["id"]

    listed = await client.get("/api/v1/transport/bookings", headers=auth_headers_transport)
    assert listed.status_code == 200
    assert any(b["id"] == booking_id for b in listed.json())

    # Passenger can only CANCEL, not advance
    invalid_advance = await client.patch(f"/api/v1/transport/bookings/{booking_id}/status", json={"status": "IN_PROGRESS"}, headers=auth_headers_transport)
    assert invalid_advance.status_code == 403

# Create a driver user and profile for testing
    driver_email = f"driver_test_{uuid.uuid4().hex[:8]}@example.com"
    driver_reg = await client.post("/api/v1/auth/register", json={"email": driver_email, "password": "Driver@123", "role": "DRIVER", "full_name": "Test Driver"})
    assert driver_reg.status_code in (200, 201)
    driver_token = driver_reg.json()["access_token"]
    driver_auth = {"Authorization": f"Bearer {driver_token}"}
    
    # Create driver profile
    profile = await client.post("/api/v1/transport/driver/profile", json={"name": "Test Driver", "vehicle_type": "car", "vehicle_number": "DHK-TEST-001"}, headers=driver_auth)
    assert profile.status_code == 201, profile.text
    driver_profile = profile.json()
    driver_id = driver_profile["id"]
    
    # Now assign the booking to this driver (simulate driver acceptance)
    from sqlalchemy import select
    from app.models.transport import RideBooking, RideStatus
    async with session.begin():
        result = await session.execute(select(RideBooking).where(RideBooking.id == booking_id))
        booking_obj = result.scalar_one()
        booking_obj.driver_id = driver_id
        booking_obj.status = RideStatus.ACCEPTED
        await session.commit()
    
    # Now driver can START the trip (from ACCEPTED to IN_PROGRESS)
    start = await client.patch(f"/api/v1/transport/bookings/{booking_id}/status", json={"status": "IN_PROGRESS"}, headers=driver_auth)
    assert start.status_code == 200
    
    # Then driver can COMPLETE the trip (from IN_PROGRESS to COMPLETED)
    complete = await client.patch(f"/api/v1/transport/bookings/{booking_id}/status", json={"status": "COMPLETED"}, headers=driver_auth)
    assert complete.status_code == 200

    # Invalid transition from COMPLETED
    invalid = await client.patch(f"/api/v1/transport/bookings/{booking_id}/status", json={"status": "IN_PROGRESS"}, headers=driver_auth)
    assert invalid.status_code == 409


@pytest.mark.asyncio
async def test_cancel_then_no_reopen(client, auth_headers_transport, seeded_drivers):
    created = await client.post("/api/v1/transport/bookings", json={"vehicle_type": "bike", **POINT}, headers=auth_headers_transport)
    booking_id = created.json()["id"]
    cancel = await client.patch(f"/api/v1/transport/bookings/{booking_id}/status", json={"status": "CANCELLED"}, headers=auth_headers_transport)
    assert cancel.status_code == 200
    reopen = await client.patch(f"/api/v1/transport/bookings/{booking_id}/status", json={"status": "ACCEPTED"}, headers=auth_headers_transport)
    assert reopen.status_code == 403  # Passenger can only cancel, not advance


@pytest.mark.asyncio
async def test_driver_profile_validation_case_and_duplicate(client, auth_headers_transport, seeded_drivers):
    # Use DRIVER auth for driver-specific endpoints
    driver_auth = await _auth_header(client, role="DRIVER")
    
    # Test invalid vehicle type
    bad = await client.post("/api/v1/transport/driver/profile", json={"name": "X", "vehicle_type": "helicopter", "vehicle_number": "DHK-1"}, headers=driver_auth)
    assert bad.status_code == 422

    # Test valid profile with case-insensitive vehicle type
    ok = await client.post("/api/v1/transport/driver/profile", json={"name": "Neel Rahman", "vehicle_type": "Car", "vehicle_number": "DHK-KA-123"}, headers=driver_auth)
    assert ok.status_code == 201, ok.text
    assert ok.json()["vehicle_type"] == "car"

    # Test duplicate profile rejection
    dup = await client.post("/api/v1/transport/driver/profile", json={"name": "Neel Rahman", "vehicle_type": "car", "vehicle_number": "DHK-KA-123"}, headers=driver_auth)
    assert dup.status_code == 409


@pytest.mark.asyncio
async def test_profile_endpoint_branch_contract(client) -> None:
    auth = await _auth_header(client, role="DRIVER")
    assert (await client.get("/api/v1/transport/driver/profile", headers=auth)).status_code == 404
    await client.post("/api/v1/transport/driver/profile", json={"name": "Neel", "vehicle_type": "car", "vehicle_number": "DHK-KA-123"}, headers=auth)
    profile = await client.get("/api/v1/transport/driver/profile", headers=auth)
    assert profile.status_code == 200
    assert profile.json()["vehicle_number"] == "DHK-KA-123"
    requests = await client.get("/api/v1/transport/driver/requests", headers=auth)
    assert requests.status_code == 200 and isinstance(requests.json(), list)