"""
Tests for order and payment flow.

NECESSITY: Validates checkout, order tracking, and payment.
LOGIC: Tests end-to-end purchase flow.
EDGE-CASE: Empty cart checkout, duplicate payments.
"""

import pytest
from app.models.seller import Seller
from app.models.product import Product


async def _setup_checkout_data(session, user_id):
    seller = Seller(user_id=user_id + 1000, name="Order Shop", is_active=True)
    session.add(seller)
    await session.commit()
    await session.refresh(seller)

    product = Product(
        seller_id=seller.id, name="Tea Leaves", price=200.0,
        unit="kg", stock_quantity=50, is_available=True,
    )
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return seller, product


@pytest.mark.asyncio
async def test_checkout_empty_cart(client, test_user, auth_headers):
    response = await client.post("/api/v1/grocery/orders/checkout", json={
        "delivery_address": "123 Main St",
    }, headers=auth_headers)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_checkout_with_items(client, session, test_user, auth_headers):
    seller, product = await _setup_checkout_data(session, test_user.id)

    await client.post("/api/v1/grocery/cart/items", json={
        "product_id": product.id,
        "quantity": 2,
    }, headers=auth_headers)

    response = await client.post("/api/v1/grocery/orders/checkout", json={
        "delivery_address": "456 Oak Ave, Dhaka",
    }, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["total_cents"] == 40000
    assert "sub_orders" in data
    assert len(data["sub_orders"]) > 0


@pytest.mark.asyncio
async def test_list_orders(client, session, test_user, auth_headers):
    response = await client.get("/api/v1/grocery/orders", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "orders" in data


@pytest.mark.asyncio
async def test_pay_order(client, session, test_user, auth_headers):
    seller, product = await _setup_checkout_data(session, test_user.id)

    await client.post("/api/v1/grocery/cart/items", json={
        "product_id": product.id,
        "quantity": 1,
    }, headers=auth_headers)

    checkout_resp = await client.post("/api/v1/grocery/orders/checkout", json={
        "delivery_address": "789 Pine Rd",
    }, headers=auth_headers)
    order_id = checkout_resp.json()["id"]

    pay_resp = await client.post(f"/api/v1/grocery/orders/{order_id}/pay", json={
        "method": "bkash",
    }, headers=auth_headers)
    assert pay_resp.status_code == 200
    pay_data = pay_resp.json()
    assert pay_data["status"] == "completed"
    assert pay_data["transaction_id"] is not None
    assert pay_data["method"] == "bkash"
    assert pay_data["amount_cents"] == 20000


@pytest.mark.asyncio
async def test_pay_idempotent_returns_same_payment(client, session, test_user, auth_headers):
    seller, product = await _setup_checkout_data(session, test_user.id)

    await client.post("/api/v1/grocery/cart/items", json={
        "product_id": product.id,
        "quantity": 1,
    }, headers=auth_headers)

    checkout_resp = await client.post("/api/v1/grocery/orders/checkout", json={
        "delivery_address": "101 Elm St",
    }, headers=auth_headers)
    order_id = checkout_resp.json()["id"]

    pay1 = await client.post(f"/api/v1/grocery/orders/{order_id}/pay", json={
        "method": "nagad",
    }, headers=auth_headers)
    assert pay1.status_code == 200
    first_payment_id = pay1.json()["payment_id"]

    pay2 = await client.post(f"/api/v1/grocery/orders/{order_id}/pay", json={
        "method": "bkash",
    }, headers=auth_headers)
    assert pay2.status_code == 200
    assert pay2.json()["payment_id"] == first_payment_id
    assert pay2.json()["status"] == "completed"


@pytest.mark.asyncio
async def test_get_invoice(client, session, test_user, auth_headers):
    seller, product = await _setup_checkout_data(session, test_user.id)

    await client.post("/api/v1/grocery/cart/items", json={
        "product_id": product.id,
        "quantity": 1,
    }, headers=auth_headers)

    checkout_resp = await client.post("/api/v1/grocery/orders/checkout", json={
        "delivery_address": "200 Test Ave",
    }, headers=auth_headers)
    order_id = checkout_resp.json()["id"]

    await client.post(f"/api/v1/grocery/orders/{order_id}/pay", json={
        "method": "card",
    }, headers=auth_headers)

    invoice_resp = await client.get(f"/api/v1/grocery/orders/invoice/{order_id}", headers=auth_headers)
    assert invoice_resp.status_code == 200
    inv = invoice_resp.json()
    assert inv["invoice_number"] == f"VIA-{order_id}"
    assert inv["payment"] is not None
    assert inv["payment"]["status"] == "completed"
    assert len(inv["sub_orders"]) > 0
    total_payable = sum(so["subtotal_cents"] for so in inv["sub_orders"])
    assert total_payable == inv["payment"]["amount_cents"]
