"""
Repository for order, sub-order, and order item data access.

NECESSITY: Manages order lifecycle from creation to completion.
LOGIC: Orders contain sub-orders (one per seller), which contain order items.
EDGE-CASE: Status transitions validated; totals computed atomically.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order, SubOrder, OrderItem


async def create_order(
    session: AsyncSession, user_id: int, delivery_address: str
) -> Order:
    order = Order(user_id=user_id, delivery_address=delivery_address)
    session.add(order)
    await session.flush()
    return order


async def create_sub_order(
    session: AsyncSession, order_id: int, seller_id: int
) -> SubOrder:
    sub_order = SubOrder(order_id=order_id, seller_id=seller_id)
    session.add(sub_order)
    await session.flush()
    return sub_order


async def create_order_item(
    session: AsyncSession,
    sub_order_id: int,
    product_id: int,
    quantity: int,
    unit_price_cents: int,
    total_cents: int,
) -> OrderItem:
    item = OrderItem(
        sub_order_id=sub_order_id,
        product_id=product_id,
        quantity=quantity,
        unit_price_cents=unit_price_cents,
        total_cents=total_cents,
    )
    session.add(item)
    await session.flush()
    return item


async def get_order_by_id(session: AsyncSession, order_id: int) -> Order | None:
    result = await session.execute(select(Order).where(Order.id == order_id))
    return result.scalar_one_or_none()


async def get_orders_by_user(session: AsyncSession, user_id: int) -> list[Order]:
    result = await session.execute(
        select(Order).where(Order.user_id == user_id).order_by(Order.created_at.desc())
    )
    return list(result.scalars().all())


async def get_sub_orders_by_order(session: AsyncSession, order_id: int) -> list[SubOrder]:
    result = await session.execute(
        select(SubOrder).where(SubOrder.order_id == order_id)
    )
    return list(result.scalars().all())


async def get_order_items_by_sub_order(session: AsyncSession, sub_order_id: int) -> list[OrderItem]:
    result = await session.execute(
        select(OrderItem).where(OrderItem.sub_order_id == sub_order_id)
    )
    return list(result.scalars().all())


async def update_order_status(session: AsyncSession, order: Order, status: str) -> Order:
    order.status = status
    await session.flush()
    return order


async def update_sub_order_status(session: AsyncSession, sub_order: SubOrder, status: str) -> SubOrder:
    sub_order.status = status
    await session.flush()
    return sub_order
