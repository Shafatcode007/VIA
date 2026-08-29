"""
Tests for cart operations.

NECESSITY: Validates add/update/remove cart items.
LOGIC: Tests stock validation and total calculation.
EDGE-CASE: Insufficient stock, empty cart operations.
"""

import pytest
from app.models.seller import Seller
from app.models.product import Product


async def _setup_seller_and_product(session, user_id):
    seller = Seller(user_id=user_id, name="Cart Test Shop", is_active=True)
    session.add(seller)
    await session.commit()
    await session.refresh(seller)

    product = Product(
        seller_id=seller.id,
        name="Mangoes",
        price=60.0,
        unit="piece",
        stock_quantity=10,
        is_available=True,
    )
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return seller, product


@pytest.mark.asyncio
async def test_get_empty_cart(client, test_user, auth_headers):
    response = await client.get("/api/v1/grocery/cart", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["item_count"] == 0
    assert data["total_cents"] == 0


@pytest.mark.asyncio
async def test_add_to_cart(client, session, test_user, auth_headers):
    seller, product = await _setup_seller_and_product(session, test_user.id)

    response = await client.post("/api/v1/grocery/cart/items", json={
        "product_id": product.id,
        "quantity": 3,
    }, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["item_count"] == 1
    assert data["total_cents"] == 18000


@pytest.mark.asyncio
async def test_add_insufficient_stock(client, session, test_user, auth_headers):
    seller, product = await _setup_seller_and_product(session, test_user.id)

    response = await client.post("/api/v1/grocery/cart/items", json={
        "product_id": product.id,
        "quantity": 999,
    }, headers=auth_headers)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_add_unavailable_product(client, session, test_user, auth_headers):
    seller = Seller(user_id=test_user.id, name="Shop", is_active=True)
    session.add(seller)
    await session.commit()
    await session.refresh(seller)

    product = Product(
        seller_id=seller.id, name="Unavailable", price=10.0,
        unit="piece", stock_quantity=5, is_available=False,
    )
    session.add(product)
    await session.commit()
    await session.refresh(product)

    response = await client.post("/api/v1/grocery/cart/items", json={
        "product_id": product.id,
        "quantity": 1,
    }, headers=auth_headers)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_remove_from_cart(client, session, test_user, auth_headers):
    seller, product = await _setup_seller_and_product(session, test_user.id)

    add_resp = await client.post("/api/v1/grocery/cart/items", json={
        "product_id": product.id,
        "quantity": 2,
    }, headers=auth_headers)
    cart = add_resp.json()
    item_id = cart["items"][0]["id"]

    response = await client.delete(f"/api/v1/grocery/cart/items/{item_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["item_count"] == 0
