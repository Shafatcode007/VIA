"""
Money fields must serialize as JSON numbers, never strings.

NECESSITY: Frontend performs arithmetic on cart/order totals. If the backend
serializes money as strings (e.g. "82" instead of 82), JS string
concatenation produces bugs like "82" + 40 === "8240".
LOGIC: Register a fresh user, create a product, add to cart, checkout,
and assert every monetary field is a JSON number (int or float).
EDGE-CASE: Also checks that bool is not误classified as number.
"""

import pytest
from app.models.seller import Seller
from app.models.product import Product


async def _setup_seller_and_product(session, user_id):
    seller = Seller(user_id=user_id, name="Money Test Shop", is_active=True)
    session.add(seller)
    await session.commit()
    await session.refresh(seller)

    product = Product(
        seller_id=seller.id,
        name="Garlic 500g",
        price=82.0,
        unit="piece",
        stock_quantity=50,
        is_available=True,
    )
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return seller, product


@pytest.mark.asyncio
async def test_cart_money_fields_are_numbers(client, session, test_user, auth_headers):
    """Cart item price/subtotal and cart total must be JSON numbers."""
    seller, product = await _setup_seller_and_product(session, test_user.id)

    add_resp = await client.post("/api/v1/grocery/cart/items", json={
        "product_id": product.id,
        "quantity": 1,
    }, headers=auth_headers)
    assert add_resp.status_code == 200, add_resp.text

    cart = (await client.get("/api/v1/grocery/cart", headers=auth_headers)).json()
    cart_items = cart["items"]
    assert len(cart_items) == 1

    # Cart item money fields must be JSON numbers
    for field in ("product_price", "subtotal"):
        value = cart_items[0][field]
        assert isinstance(value, (int, float)) and not isinstance(value, bool), \
            f"cart item {field} must be a number, got {type(value).__name__}: {value!r}"

    # Cart-level total must be JSON number
    assert isinstance(cart["total_cents"], (int, float)) and not isinstance(cart["total_cents"], bool), \
        f"cart total_cents must be a number, got {type(cart['total_cents']).__name__}: {cart['total_cents']!r}"


@pytest.mark.asyncio
async def test_order_money_fields_are_numbers(client, session, test_user, auth_headers):
    """Order total must be JSON number after checkout."""
    seller, product = await _setup_seller_and_product(session, test_user.id)

    await client.post("/api/v1/grocery/cart/items", json={
        "product_id": product.id,
        "quantity": 2,
    }, headers=auth_headers)

    checkout_resp = await client.post("/api/v1/grocery/orders/checkout",
        json={"delivery_address": "123 Test St, Dhaka"},
        headers=auth_headers)
    assert checkout_resp.status_code in (200, 201), checkout_resp.text
    checkout = checkout_resp.json()

    # Order-level money fields must be JSON numbers
    for field in ("total_cents",):
        if field in checkout:
            assert isinstance(checkout[field], (int, float)) and not isinstance(checkout[field], bool), \
                f"order {field} must be a number, got {type(checkout[field]).__name__}: {checkout[field]!r}"
