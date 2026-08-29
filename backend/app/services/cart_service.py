"""
Cart service for shopping cart operations.

NECESSITY: Business logic for cart management.
LOGIC: Validates stock, calculates totals, groups items by seller.
EDGE-CASE: Prevents overselling; handles out-of-stock items.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories import cart_repository, product_repository
from app.schemas.order_schema import CartItemResponse, CartResponse


async def get_cart_with_details(session: AsyncSession, user_id: int) -> CartResponse:
    """
    Get user's active cart with product details.

    NECESSITY: Users need to see cart contents before checkout.
    LOGIC: Fetches cart, enriches items with product data.
    EDGE-CASE: Creates empty cart if none exists.
    """
    cart = await cart_repository.create_or_get_cart(session, user_id)
    items = await cart_repository.get_cart_items(session, cart.id)

    cart_items = []
    total_cents = 0

    for item in items:
        product = await product_repository.get_product_by_id(session, item.product_id)
        if product:
            subtotal = product.price * item.quantity
            total_cents += int(subtotal * 100)
            cart_items.append(CartItemResponse(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                product_name=product.name,
                product_price=product.price,
                subtotal=subtotal,
            ))

    return CartResponse(
        id=cart.id,
        items=cart_items,
        total_cents=total_cents,
        item_count=len(cart_items),
    )


async def add_to_cart(
    session: AsyncSession, user_id: int, product_id: int, quantity: int
) -> CartResponse:
    """
    Add item to user's cart.

    NECESSITY: Users add products before checkout.
    LOGIC: Validates product exists and has stock, then adds.
    EDGE-CASE: Raises ValueError if product unavailable or insufficient stock.
    """
    product = await product_repository.get_product_by_id(session, product_id)
    if not product or not product.is_available:
        raise ValueError("Product not available")

    if product.stock_quantity < quantity:
        raise ValueError(f"Insufficient stock. Available: {product.stock_quantity}")

    cart = await cart_repository.create_or_get_cart(session, user_id)
    await cart_repository.add_item_to_cart(session, cart.id, product_id, quantity)

    return await get_cart_with_details(session, user_id)


async def update_cart_item(
    session: AsyncSession, user_id: int, item_id: int, quantity: int
) -> CartResponse:
    """
    Update quantity of a cart item.

    NECESSITY: Users modify cart before checkout.
    LOGIC: Validates new quantity against stock.
    EDGE-CASE: Raises ValueError if insufficient stock.
    """
    item = await cart_repository.update_cart_item_quantity(session, item_id, quantity)
    if not item:
        raise ValueError("Cart item not found")

    product = await product_repository.get_product_by_id(session, item.product_id)
    if product and product.stock_quantity < quantity:
        raise ValueError(f"Insufficient stock. Available: {product.stock_quantity}")

    return await get_cart_with_details(session, user_id)


async def remove_from_cart(
    session: AsyncSession, user_id: int, item_id: int
) -> CartResponse:
    """
    Remove item from cart.

    NECESSITY: Users remove unwanted items.
    LOGIC: Deletes cart item, returns updated cart.
    EDGE-CASE: Returns cart even if item not found.
    """
    await cart_repository.remove_cart_item(session, item_id)
    return await get_cart_with_details(session, user_id)
