"""
Repository for product data access.

NECESSITY: Isolates database operations for products.
LOGIC: CRUD with filters for seller catalog and search.
EDGE-CASE: stock_quantity checked atomically to prevent overselling.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product


async def create_product(
    session: AsyncSession,
    seller_id: int,
    name: str,
    price: float,
    unit: str = "piece",
    canonical_item_id: int | None = None,
    description: str | None = None,
    stock_quantity: int = 0,
    image_url: str | None = None,
    is_available: bool = True,
) -> Product:
    product = Product(
        seller_id=seller_id,
        canonical_item_id=canonical_item_id,
        name=name,
        description=description,
        price=price,
        unit=unit,
        stock_quantity=stock_quantity,
        image_url=image_url,
        is_available=is_available,
    )
    session.add(product)
    await session.flush()
    return product


async def get_product_by_id(session: AsyncSession, product_id: int) -> Product | None:
    result = await session.execute(select(Product).where(Product.id == product_id))
    return result.scalar_one_or_none()


async def list_products_by_seller(session: AsyncSession, seller_id: int) -> list[Product]:
    result = await session.execute(
        select(Product).where(Product.seller_id == seller_id, Product.is_available == True)
    )
    return list(result.scalars().all())


async def search_products(session: AsyncSession, query: str) -> list[Product]:
    result = await session.execute(
        select(Product).where(
            Product.name.ilike(f"%{query}%"),
            Product.is_available == True,
        )
    )
    return list(result.scalars().all())


async def list_available_products(session: AsyncSession) -> list[Product]:
    result = await session.execute(select(Product).where(Product.is_available == True))
    return list(result.scalars().all())


async def update_product(session: AsyncSession, product: Product, **kwargs) -> Product:
    for key, value in kwargs.items():
        if value is not None:
            setattr(product, key, value)
    await session.flush()
    return product


async def decrement_stock(session: AsyncSession, product: Product, quantity: int) -> Product:
    product.stock_quantity -= quantity
    await session.flush()
    return product
