"""
Repository for cart and cart item data access.

NECESSITY: Manages shopping cart state per user.
LOGIC: One active cart per user; items reference products.
EDGE-CASE: create_or_get_cart prevents duplicate active carts.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cart import Cart
from app.models.cart_item import CartItem


async def create_or_get_cart(session: AsyncSession, user_id: int) -> Cart:
    result = await session.execute(
        select(Cart).where(Cart.user_id == user_id, Cart.is_active == True)
    )
    cart = result.scalar_one_or_none()
    if cart:
        return cart

    cart = Cart(user_id=user_id)
    session.add(cart)
    await session.flush()
    return cart


async def get_cart_by_id(session: AsyncSession, cart_id: int) -> Cart | None:
    result = await session.execute(select(Cart).where(Cart.id == cart_id))
    return result.scalar_one_or_none()


async def add_item_to_cart(
    session: AsyncSession, cart_id: int, product_id: int, quantity: int
) -> CartItem:
    result = await session.execute(
        select(CartItem).where(
            CartItem.cart_id == cart_id,
            CartItem.product_id == product_id,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.quantity += quantity
        await session.flush()
        return existing

    item = CartItem(cart_id=cart_id, product_id=product_id, quantity=quantity)
    session.add(item)
    await session.flush()
    return item


async def get_cart_items(session: AsyncSession, cart_id: int) -> list[CartItem]:
    result = await session.execute(
        select(CartItem).where(CartItem.cart_id == cart_id)
    )
    return list(result.scalars().all())


async def update_cart_item_quantity(
    session: AsyncSession, item_id: int, quantity: int
) -> CartItem | None:
    result = await session.execute(
        select(CartItem).where(CartItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    if item:
        item.quantity = quantity
        await session.flush()
    return item


async def remove_cart_item(session: AsyncSession, item_id: int) -> bool:
    result = await session.execute(
        select(CartItem).where(CartItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    if item:
        await session.delete(item)
        await session.flush()
        return True
    return False


async def clear_cart(session: AsyncSession, cart_id: int) -> None:
    result = await session.execute(
        select(CartItem).where(CartItem.cart_id == cart_id)
    )
    for item in result.scalars().all():
        await session.delete(item)
    await session.flush()


async def deactivate_cart(session: AsyncSession, cart_id: int) -> None:
    result = await session.execute(select(Cart).where(Cart.id == cart_id))
    cart = result.scalar_one_or_none()
    if cart:
        cart.is_active = False
        await session.flush()
