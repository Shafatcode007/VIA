"""
Repository for canonical item data access.

NECESSITY: Manages the canonical product name registry.
LOGIC: CRUD for normalized product names and categories.
EDGE-CASE: name uniqueness enforced at DB level.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.canonical_item import CanonicalItem


async def create_canonical_item(
    session: AsyncSession,
    name: str,
    category: str = "uncategorized",
    unit_type: str = "piece",
) -> CanonicalItem:
    item = CanonicalItem(name=name, category=category, unit_type=unit_type)
    session.add(item)
    await session.flush()
    return item


async def get_canonical_item_by_id(session: AsyncSession, item_id: int) -> CanonicalItem | None:
    result = await session.execute(
        select(CanonicalItem).where(CanonicalItem.id == item_id)
    )
    return result.scalar_one_or_none()


async def search_canonical_items(session: AsyncSession, query: str) -> list[CanonicalItem]:
    result = await session.execute(
        select(CanonicalItem).where(CanonicalItem.name.ilike(f"%{query}%"))
    )
    return list(result.scalars().all())


async def list_canonical_items(session: AsyncSession) -> list[CanonicalItem]:
    result = await session.execute(select(CanonicalItem).order_by(CanonicalItem.name))
    return list(result.scalars().all())
