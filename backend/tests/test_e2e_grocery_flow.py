"""
End-to-end grocery journey mirroring the exact calls the frontend makes:
login -> browse -> add to cart -> view cart -> update -> optimize ->
checkout -> pay (idempotent) -> invoice reconciliation.
If this suite is green but the browser fails, the defect is frontend
auth wiring, not backend.
"""
import uuid

import pytest

from app.models.seller import Seller
from app.models.product import Product


def _unique_email() -> str:
    return f"e2e_{uuid.uuid4().hex[:8]}@viaexample.com"


@pytest.mark.asyncio
async def test_e2e_grocery_flow(client, session) -> None:
    # 0. Seed a seller + product (test DB is in-memory, no seed data).
    from app.core.security import hash_password
    from app.models.user import User

    seller_user = User(
        email=f"seller_{uuid.uuid4().hex[:8]}@viaexample.com",
        hashed_password=hash_password("Seller123!"),
        full_name="E2E Seller",
        role="seller",
        is_active=True,
    )
    session.add(seller_user)
    await session.commit()
    await session.refresh(seller_user)

    seller = Seller(user_id=seller_user.id, name="E2E Shop", is_active=True)
    session.add(seller)
    await session.commit()
    await session.refresh(seller)

    product = Product(
        seller_id=seller.id,
        name="E2E Mangoes",
        price=60.0,
        unit="kg",
        stock_quantity=100,
        is_available=True,
    )
    session.add(product)
    await session.commit()
    await session.refresh(product)
    product_id = product.id

    # 1. Register + login (same payload shape as the login page).
    email = _unique_email()
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "E2e@12345", "role": "RESIDENT", "full_name": "E2E Resident"},
    )
    assert reg.status_code in (200, 201), reg.text

    login = await client.post("/api/v1/auth/login", json={"email": email, "password": "E2e@12345"})
    assert login.status_code == 200, login.text
    token = login.json().get("access_token")
    assert token, "login must return access_token"
    auth = {"Authorization": f"Bearer {token}"}

    # 2. Browse products (public endpoint).
    products = await client.get("/api/v1/grocery/products")
    assert products.status_code == 200, products.text
    body = products.json()
    items = body if isinstance(body, list) else body.get("products", [])
    assert len(items) > 0, "seed data must exist"

    # 3. Cart add: 401 without token, success with token.
    no_auth = await client.post("/api/v1/grocery/cart/items", json={"product_id": product_id, "quantity": 2})
    assert no_auth.status_code in (401, 403), "unauthenticated cart add must 401 or 403"

    add = await client.post("/api/v1/grocery/cart/items", json={"product_id": product_id, "quantity": 2}, headers=auth)
    assert add.status_code in (200, 201), add.text

    # 4. View cart shows the item.
    cart = await client.get("/api/v1/grocery/cart", headers=auth)
    assert cart.status_code == 200, cart.text
    cart_body = cart.json()
    cart_items = cart_body["items"] if isinstance(cart_body, dict) else cart_body
    assert any(ci["product_id"] == product_id for ci in cart_items)

    # 5. Update quantity.
    item_id = cart_items[0]["id"]
    upd = await client.put(f"/api/v1/grocery/cart/items/{item_id}", json={"quantity": 3}, headers=auth)
    assert upd.status_code == 200, upd.text

    # 6. Optimization returns strategies + recommendation.
    opt = await client.get("/api/v1/grocery/cart/optimize", headers=auth)
    assert opt.status_code == 200, opt.text
    opt_body = opt.json()
    assert opt_body.get("recommended")

    # 7. Checkout creates a master order with full detail.
    checkout = await client.post("/api/v1/grocery/orders/checkout", json={"delivery_address": "Gulshan, Dhaka"}, headers=auth)
    assert checkout.status_code in (200, 201), checkout.text
    order = checkout.json()
    master_id = order.get("id")
    assert master_id
    assert "sub_orders" in order
    assert len(order["sub_orders"]) > 0

    # 8. Pay: single-step pay returns completed with transaction_id.
    pay1 = await client.post(f"/api/v1/grocery/orders/{master_id}/pay", json={"method": "cash"}, headers=auth)
    assert pay1.status_code == 200, pay1.text
    pay1_data = pay1.json()
    assert pay1_data["status"] == "completed"
    assert pay1_data["transaction_id"] is not None

    # 9. Second pay on same order returns same payment_id (idempotent).
    pay2 = await client.post(f"/api/v1/grocery/orders/{master_id}/pay", json={"method": "bkash"}, headers=auth)
    assert pay2.status_code == 200, pay2.text
    assert pay2.json()["payment_id"] == pay1_data["payment_id"]

    # 10. Invoice endpoint returns combined order + payment data.
    invoice = await client.get(f"/api/v1/grocery/orders/invoice/{master_id}", headers=auth)
    assert invoice.status_code == 200, invoice.text
    inv = invoice.json()
    assert inv["invoice_number"] == f"VIA-{master_id}"
    assert inv["payment"] is not None
    assert inv["payment"]["status"] == "completed"
    total_sub = sum(so["subtotal_cents"] for so in inv["sub_orders"])
    assert total_sub == inv["payment"]["amount_cents"], "invoice reconciliation failed"


@pytest.mark.asyncio
async def test_checkout_then_pay_with_method(client, session) -> None:
    """Pay with nagad; assert response payment_method == nagad, status SUCCESS, transaction_id not null."""
    from app.core.security import hash_password
    from app.models.user import User

    seller_user = User(
        email=f"seller_{uuid.uuid4().hex[:8]}@viaexample.com",
        hashed_password=hash_password("Seller123!"),
        full_name="Pay Seller",
        role="seller",
        is_active=True,
    )
    session.add(seller_user)
    await session.commit()
    await session.refresh(seller_user)

    seller = Seller(user_id=seller_user.id, name="Pay Shop", is_active=True)
    session.add(seller)
    await session.commit()
    await session.refresh(seller)

    product = Product(
        seller_id=seller.id, name="Pay Rice", price=150.0,
        unit="kg", stock_quantity=50, is_available=True,
    )
    session.add(product)
    await session.commit()
    await session.refresh(product)

    email = _unique_email()
    await client.post("/api/v1/auth/register", json={
        "email": email, "password": "E2e@12345", "role": "RESIDENT", "full_name": "Pay Tester",
    })
    login = await client.post("/api/v1/auth/login", json={"email": email, "password": "E2e@12345"})
    auth = {"Authorization": f"Bearer {login.json()['access_token']}"}

    await client.post("/api/v1/grocery/cart/items", json={"product_id": product.id, "quantity": 2}, headers=auth)

    checkout = await client.post("/api/v1/grocery/orders/checkout", json={"delivery_address": "Banani"}, headers=auth)
    assert checkout.status_code in (200, 201), checkout.text
    order_id = checkout.json()["id"]

    pay = await client.post(f"/api/v1/grocery/orders/{order_id}/pay", json={"method": "nagad"}, headers=auth)
    assert pay.status_code == 200, pay.text
    data = pay.json()
    assert data["method"] == "nagad"
    assert data["status"] == "completed"
    assert data["transaction_id"] is not None
    assert data["amount_cents"] == 30000


@pytest.mark.asyncio
async def test_pay_idempotent_different_methods(client, session) -> None:
    """Second pay on same order with different method returns SAME payment_id."""
    from app.core.security import hash_password
    from app.models.user import User

    seller_user = User(
        email=f"seller_{uuid.uuid4().hex[:8]}@viaexample.com",
        hashed_password=hash_password("Seller123!"),
        full_name="Idem Seller",
        role="seller",
        is_active=True,
    )
    session.add(seller_user)
    await session.commit()
    await session.refresh(seller_user)

    seller = Seller(user_id=seller_user.id, name="Idem Shop", is_active=True)
    session.add(seller)
    await session.commit()
    await session.refresh(seller)

    product = Product(
        seller_id=seller.id, name="Idem Oil", price=250.0,
        unit="litre", stock_quantity=20, is_available=True,
    )
    session.add(product)
    await session.commit()
    await session.refresh(product)

    email = _unique_email()
    await client.post("/api/v1/auth/register", json={
        "email": email, "password": "E2e@12345", "role": "RESIDENT", "full_name": "Idem Tester",
    })
    login = await client.post("/api/v1/auth/login", json={"email": email, "password": "E2e@12345"})
    auth = {"Authorization": f"Bearer {login.json()['access_token']}"}

    await client.post("/api/v1/grocery/cart/items", json={"product_id": product.id, "quantity": 1}, headers=auth)

    checkout = await client.post("/api/v1/grocery/orders/checkout", json={"delivery_address": "Dhanmondi"}, headers=auth)
    order_id = checkout.json()["id"]

    pay1 = await client.post(f"/api/v1/grocery/orders/{order_id}/pay", json={"method": "nagad"}, headers=auth)
    first_id = pay1.json()["payment_id"]

    pay2 = await client.post(f"/api/v1/grocery/orders/{order_id}/pay", json={"method": "bkash"}, headers=auth)
    assert pay2.json()["payment_id"] == first_id
    assert pay2.json()["status"] == "completed"


@pytest.mark.asyncio
async def test_invoice_reconciliation(client, session) -> None:
    """GET order detail; assert sum(sub_orders.payable_amount) == payment.amount."""
    from app.core.security import hash_password
    from app.models.user import User

    seller_user = User(
        email=f"seller_{uuid.uuid4().hex[:8]}@viaexample.com",
        hashed_password=hash_password("Seller123!"),
        full_name="Recon Seller",
        role="seller",
        is_active=True,
    )
    session.add(seller_user)
    await session.commit()
    await session.refresh(seller_user)

    seller = Seller(user_id=seller_user.id, name="Recon Shop", is_active=True)
    session.add(seller)
    await session.commit()
    await session.refresh(seller)

    product = Product(
        seller_id=seller.id, name="Recon Fish", price=300.0,
        unit="kg", stock_quantity=10, is_available=True,
    )
    session.add(product)
    await session.commit()
    await session.refresh(product)

    email = _unique_email()
    await client.post("/api/v1/auth/register", json={
        "email": email, "password": "E2e@12345", "role": "RESIDENT", "full_name": "Recon Tester",
    })
    login = await client.post("/api/v1/auth/login", json={"email": email, "password": "E2e@12345"})
    auth = {"Authorization": f"Bearer {login.json()['access_token']}"}

    await client.post("/api/v1/grocery/cart/items", json={"product_id": product.id, "quantity": 3}, headers=auth)

    checkout = await client.post("/api/v1/grocery/orders/checkout", json={"delivery_address": "Uttara"}, headers=auth)
    order_id = checkout.json()["id"]

    await client.post(f"/api/v1/grocery/orders/{order_id}/pay", json={"method": "card"}, headers=auth)

    invoice = await client.get(f"/api/v1/grocery/orders/invoice/{order_id}", headers=auth)
    assert invoice.status_code == 200, invoice.text
    inv = invoice.json()
    total_sub = sum(so["subtotal_cents"] for so in inv["sub_orders"])
    assert total_sub == inv["payment"]["amount_cents"]
    assert total_sub == inv["total_cents"]
