"""Seed mock drivers for transport module."""

from __future__ import annotations

import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, engine
from app.core.security import hash_password
from app.models.transport import Driver
from app.models.user import User


DRIVERS_DATA = [
    {"name": "Rahim Uddin", "phone": "+8801712345670", "vehicle_type": "ev", "vehicle_number": "DHAKA-EV-001", "rating": 4.8, "is_available": True},
    {"name": "Karim Hassan", "phone": "+8801712345671", "vehicle_type": "ev", "vehicle_number": "DHAKA-EV-002", "rating": 4.6, "is_available": True},
    {"name": "Abdul Salam", "phone": "+8801712345672", "vehicle_type": "cng", "vehicle_number": "DHAKA-CNG-001", "rating": 4.7, "is_available": True},
    {"name": "Mohammad Ali", "phone": "+8801712345673", "vehicle_type": "cng", "vehicle_number": "DHAKA-CNG-002", "rating": 4.5, "is_available": True},
    {"name": "Salim Reza", "phone": "+8801712345674", "vehicle_type": "auto", "vehicle_number": "DHAKA-AUTO-001", "rating": 4.4, "is_available": True},
    {"name": "Jahangir Hossain", "phone": "+8801712345675", "vehicle_type": "auto", "vehicle_number": "DHAKA-AUTO-002", "rating": 4.3, "is_available": True},
    # New vehicle types for Phase 1
    {"name": "Kamal Hossain", "phone": "+8801712345676", "vehicle_type": "bike", "vehicle_number": "DHAKA-BIKE-001", "rating": 4.9, "is_available": True},
    {"name": "Rashid Ahmed", "phone": "+8801712345677", "vehicle_type": "bike", "vehicle_number": "DHAKA-BIKE-002", "rating": 4.7, "is_available": True},
    {"name": "Faruk Mia", "phone": "+8801712345678", "vehicle_type": "car", "vehicle_number": "DHAKA-CAR-001", "rating": 4.8, "is_available": True},
    {"name": "Habib Rahman", "phone": "+8801712345679", "vehicle_type": "car", "vehicle_number": "DHAKA-CAR-002", "rating": 4.6, "is_available": True},
    {"name": "Masud Rana", "phone": "+8801712345680", "vehicle_type": "car_xl", "vehicle_number": "DHAKA-XL-001", "rating": 4.7, "is_available": True},
    {"name": "Nazmul Islam", "phone": "+8801712345681", "vehicle_type": "car_xl", "vehicle_number": "DHAKA-XL-002", "rating": 4.5, "is_available": True},
]


async def seed_drivers(session: AsyncSession) -> None:
    """Insert drivers if they don't exist (by vehicle_number)."""
    result = await session.execute(select(Driver))
    existing = list(result.scalars().all())
    existing_vehicle_numbers = {d.vehicle_number for d in existing}
    
    new_count = 0
    for d in DRIVERS_DATA:
        if d["vehicle_number"] not in existing_vehicle_numbers:
            driver = Driver(**d)
            session.add(driver)
            new_count += 1
    
    if new_count > 0:
        await session.flush()
        print(f"Seeded {new_count} new drivers.")
    else:
        print(f"All drivers already seeded ({len(existing)} found). Skipping.")


async def seed_demo_driver_user(session: AsyncSession) -> None:
    """Create demo driver user (driver@via.test) linked to a car driver."""
    # Check if demo driver user already exists
    result = await session.execute(select(User).where(User.email == "driver@via.test"))
    existing_user = result.scalars().first()
    if existing_user:
        print("Demo driver user already exists. Skipping.")
        return

    # Create the user
    demo_user = User(
        email="driver@via.test",
        hashed_password=hash_password("Driver@123"),
        full_name="Demo Driver",
        role="DRIVER",
        is_active=True,
    )
    session.add(demo_user)
    await session.flush()
    
    # Check if a car driver already exists for this user
    result = await session.execute(select(Driver).where(Driver.user_id == demo_user.id))
    existing_driver = result.scalars().first()
    if existing_driver:
        print("Demo driver profile already exists. Skipping.")
        return

    # Create a car driver linked to the demo user
    demo_driver = Driver(
        user_id=demo_user.id,
        name="Salim Reza",
        phone="+8801712345699",
        vehicle_type="car",
        vehicle_number="DHAKA-CAR-999",
        rating=4.9,
        is_available=True,
    )
    session.add(demo_driver)
    await session.flush()
    print("Created demo driver user and linked car driver profile.")


async def main() -> None:
    async with AsyncSessionLocal() as session:
        try:
            await seed_drivers(session)
            await seed_demo_driver_user(session)
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())