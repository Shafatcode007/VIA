"""
Tests for grocery product browsing.

NECESSITY: Validates product listing and search endpoints.
LOGIC: Tests public browsing and seller product management.
EDGE-CASE: Empty catalogs, search with no results.
"""

import pytest
from app.models.seller import Seller
from app.models.product import Product


async def _create_test_seller(session, user_id):
    seller = Seller(user_id=user_id, name="Test Shop", address="Dhaka", is_active=True)
    session.add(seller)
    await session.commit()
    await session.refresh(seller)
    return seller


async def _create_test_product(session, seller_id, name="Rice", price=50.0, unit="kg", stock=100):
    product = Product(
        seller_id=seller_id,
        name=name,
        price=price,
        unit=unit,
        stock_quantity=stock,
        is_available=True,
    )
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product


@pytest.mark.asyncio
async def test_list_products(client):
    response = await client.get("/api/v1/grocery/products")
    assert response.status_code == 200
    data = response.json()
    assert "products" in data


@pytest.mark.asyncio
async def test_list_products_with_data(client, session, test_seller_user):
    seller = await _create_test_seller(session, test_seller_user.id)
    await _create_test_product(session, seller.id, "Basmati Rice", 120.0, "kg")

    response = await client.get("/api/v1/grocery/products")
    assert response.status_code == 200
    data = response.json()
    assert any(p["name"] == "Basmati Rice" for p in data["products"])


@pytest.mark.asyncio
async def test_search_products(client, session, test_seller_user):
    seller = await _create_test_seller(session, test_seller_user.id)
    await _create_test_product(session, seller.id, "Red Onions", 30.0, "kg")
    await _create_test_product(session, seller.id, "Green Chilies", 80.0, "kg")

    response = await client.get("/api/v1/grocery/products?q=onion")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 1
    assert data["products"][0]["name"] == "Red Onions"


@pytest.mark.asyncio
async def test_create_seller(client, seller_headers):
    response = await client.post("/api/v1/grocery/sellers", json={
        "name": "My Shop",
        "address": "Gulshan, Dhaka",
        "delivery_radius_km": 10.0,
    }, headers=seller_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "My Shop"


@pytest.mark.asyncio
async def test_create_product(client, session, test_seller_user, seller_headers):
    seller = await _create_test_seller(session, test_seller_user.id)

    response = await client.post(f"/api/v1/grocery/sellers/{seller.id}/products", json={
        "name": "Potatoes",
        "price": 40.0,
        "unit": "kg",
        "stock_quantity": 200,
    }, headers=seller_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Potatoes"
    assert data["price"] == 40.0
