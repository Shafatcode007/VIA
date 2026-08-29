"""
Order service for checkout and order management.

NECESSITY: Business logic for placing and tracking orders.
LOGIC: Validates cart, creates orders split by seller, decrements stock atomically.
EDGE-CASE: Uses SELECT FOR UPDATE to prevent race conditions during checkout.
"""

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order, SubOrder
from app.models.cart_item import CartItem
from app.models.product import Product
from app.repositories import order_repository, payment_repository, seller_repository


async def _build_order_detail(session: AsyncSession, order: Order, user_id: int | None = None) -> dict:
    """Build full order detail dict with sub_orders, items, seller names, and payment info."""
    if user_id is not None and order.user_id != user_id:
        return None

    sub_orders = await order_repository.get_sub_orders_by_order(session, order.id)
    sub_order_data = []
    for so in sub_orders:
        items = await order_repository.get_order_items_by_sub_order(session, so.id)
        seller = await seller_repository.get_seller_by_id(session, so.seller_id)
        sub_order_data.append({
            "id": so.id,
            "seller_id": so.seller_id,
            "seller_name": seller.name if seller else f"Seller #{so.seller_id}",
            "status": so.status,
            "subtotal_cents": so.subtotal_cents,
            "items": [
                {
                    "id": i.id,
                    "product_id": i.product_id,
                    "product_name": _get_product_name(session, i.product_id),
                    "quantity": i.quantity,
                    "unit_price_cents": i.unit_price_cents,
                    "total_cents": i.total_cents,
                }
                for i in items
            ],
        })

    payment = await payment_repository.get_payment_by_order_id(session, order.id)
    payment_data = None
    if payment:
        payment_data = {
            "payment_id": payment.id,
            "amount_cents": payment.amount_cents,
            "method": payment.method,
            "status": payment.status,
            "transaction_id": payment.transaction_id,
            "created_at": str(payment.created_at) if payment.created_at else None,
        }

    return {
        "id": order.id,
        "status": order.status,
        "total_cents": order.total_cents,
        "delivery_address": order.delivery_address,
        "sub_orders": sub_order_data,
        "payment": payment_data,
        "created_at": str(order.created_at) if order.created_at else None,
    }


def _get_product_name(session: AsyncSession, product_id: int) -> str:
    """Sync placeholder — actual name resolved in async caller."""
    return f"Product #{product_id}"


async def _resolve_item_names(session: AsyncSession, sub_order_data: list[dict]) -> list[dict]:
    """Resolve product names for order items."""
    for so in sub_order_data:
        for item in so["items"]:
            product = await session.execute(
                select(Product).where(Product.id == item["product_id"])
            )
            product_obj = product.scalar_one_or_none()
            item["product_name"] = product_obj.name if product_obj else f"Product #{item['product_id']}"
            item["unit"] = product_obj.unit if product_obj else "piece"
    return sub_order_data


async def checkout(
    session: AsyncSession, user_id: int, delivery_address: str
) -> dict:
    """
    Convert cart to order(s) with atomic stock decrement.

    NECESSITY: Users finalize purchases; stock must not go negative.
    LOGIC:
      1. Lock cart items with SELECT FOR UPDATE
      2. Lock product rows with SELECT FOR UPDATE
      3. Validate stock availability
      4. Create master order + sub-orders per seller
      5. Create order items
      6. Decrement stock atomically
      7. Deactivate cart
    EDGE-CASE: Rolls back on any failure; prevents overselling.
    """
    cart_result = await session.execute(
        select(CartItem).where(
            CartItem.id.in_(
                select(CartItem.id).join(
                    __import__('app.models.cart', fromlist=['Cart']).Cart,
                    __import__('app.models.cart', fromlist=['Cart']).Cart.id == CartItem.cart_id,
                ).where(
                    __import__('app.models.cart', fromlist=['Cart']).Cart.user_id == user_id,
                    __import__('app.models.cart', fromlist=['Cart']).Cart.is_active == True,
                )
            )
        ).with_for_update()
    )
    cart_items = list(cart_result.scalars().all())

    if not cart_items:
        raise ValueError("Cart is empty")

    product_ids = [ci.product_id for ci in cart_items]
    product_result = await session.execute(
        select(Product).where(Product.id.in_(product_ids)).with_for_update()
    )
    products_map = {p.id: p for p in product_result.scalars().all()}

    for ci in cart_items:
        product = products_map.get(ci.product_id)
        if not product or not product.is_available:
            raise ValueError(f"Product {ci.product_id} not available")
        if product.stock_quantity < ci.quantity:
            raise ValueError(f"Insufficient stock for {product.name}. Available: {product.stock_quantity}")

    from app.models.cart import Cart
    cart_result = await session.execute(
        select(Cart).where(Cart.user_id == user_id, Cart.is_active == True)
    )
    cart = cart_result.scalar_one_or_none()
    if not cart:
        raise ValueError("Cart not found")

    order = await order_repository.create_order(session, user_id, delivery_address)

    seller_items: dict[int, list] = {}
    for ci in cart_items:
        product = products_map[ci.product_id]
        if product.seller_id not in seller_items:
            seller_items[product.seller_id] = []
        seller_items[product.seller_id].append((ci, product))

    total_cents = 0

    for seller_id, items in seller_items.items():
        sub_order = await order_repository.create_sub_order(session, order.id, seller_id)

        subtotal = 0
        for ci, product in items:
            item_total_cents = int(product.price * ci.quantity * 100)
            await order_repository.create_order_item(
                session, sub_order.id, product.id, ci.quantity,
                int(product.price * 100), item_total_cents,
            )
            subtotal += item_total_cents
            await session.execute(
                update(Product)
                .where(Product.id == product.id)
                .values(stock_quantity=Product.stock_quantity - ci.quantity)
            )

        sub_order.subtotal_cents = subtotal
        total_cents += subtotal

    order.total_cents = total_cents

    from app.repositories.cart_repository import deactivate_cart
    await deactivate_cart(session, cart.id)

    detail = await _build_order_detail(session, order)
    return detail


async def get_user_orders(session: AsyncSession, user_id: int) -> list[dict]:
    orders = await order_repository.get_orders_by_user(session, user_id)
    results = []
    for order in orders:
        detail = await _build_order_detail(session, order)
        if detail:
            payment = detail.get("payment")
            detail["payment_status"] = payment["status"] if payment else "none"
            results.append(detail)
    return results


async def get_order_detail(session: AsyncSession, order_id: int, user_id: int) -> dict | None:
    order = await order_repository.get_order_by_id(session, order_id)
    if not order or order.user_id != user_id:
        return None
    return await _build_order_detail(session, order)
