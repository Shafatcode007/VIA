"""
Repository for seller data access.

NECESSITY: Isolates database operations for sellers.
LOGIC: CRUD operations with async SQLAlchemy queries.
EDGE-CASE: Soft-deactivation preserves historical data.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.seller import Seller


async def create_seller(
    session: AsyncSession,
    user_id: int,
    name: str,
    description: str | None = None,
    address: str | None = None,
    latitude: float | None = None,
    longitude: float | None = None,
    phone: str | None = None,
    delivery_radius_km: float = 5.0,
) -> Seller:
    seller = Seller(
        user_id=user_id,
        name=name,
        description=description,
        address=address,
        latitude=latitude,
        longitude=longitude,
        phone=phone,
        delivery_radius_km=delivery_radius_km,
    )
    session.add(seller)
    await session.flush()
    return seller


async def get_seller_by_id(session: AsyncSession, seller_id: int) -> Seller | None:
    result = await session.execute(select(Seller).where(Seller.id == seller_id))
    return result.scalar_one_or_none()


async def get_sellers_by_user(session: AsyncSession, user_id: int) -> list[Seller]:
    result = await session.execute(
        select(Seller).where(Seller.user_id == user_id, Seller.is_active == True)
    )
    return list(result.scalars().all())


async def list_active_sellers(session: AsyncSession) -> list[Seller]:
    result = await session.execute(select(Seller).where(Seller.is_active == True))
    return list(result.scalars().all())


async def update_seller(session: AsyncSession, seller: Seller, **kwargs) -> Seller:
    for key, value in kwargs.items():
        if value is not None:
            setattr(seller, key, value)
    await session.flush()
    return seller


async def deactivate_seller(session: AsyncSession, seller: Seller) -> Seller:
    seller.is_active = False
    await session.flush()
    return seller
