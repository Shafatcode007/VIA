"""
Tests for auth endpoints.

NECESSITY: Validates registration, login, and token flow.
LOGIC: Tests happy paths and error cases.
EDGE-CASE: Duplicate emails, invalid passwords, missing tokens.
"""

import uuid

import pytest


@pytest.mark.asyncio
async def test_register_success(client):
    response = await client.post("/api/v1/auth/register", json={
        "email": "new@example.com",
        "password": "StrongPass123!",
        "full_name": "New User",
        "role": "RESIDENT",
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "new@example.com"


@pytest.mark.asyncio
async def test_register_duplicate_email(client, test_user):
    response = await client.post("/api/v1/auth/register", json={
        "email": test_user.email,
        "password": "StrongPass123!",
        "full_name": "Duplicate",
        "role": "RESIDENT",
    })
    assert response.status_code in (400, 409)


@pytest.mark.asyncio
async def test_register_then_login_flow(client):
    """Proves that a newly registered user can immediately log in."""
    email = f"testflow_{uuid.uuid4().hex[:6]}@example.com"
    password = "SecurePass@123"

    reg_res = await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Test Flow",
        "role": "RESIDENT",
    })
    assert reg_res.status_code in (200, 201), f"Register failed: {reg_res.text}"

    login_res = await client.post("/api/v1/auth/login", json={
        "email": email,
        "password": password,
    })
    assert login_res.status_code == 200, f"Login failed after register: {login_res.text}"
    assert "access_token" in login_res.json()


@pytest.mark.asyncio
async def test_login_success(client, test_user):
    response = await client.post("/api/v1/auth/login", json={
        "email": test_user.email,
        "password": "TestPass123!",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


@pytest.mark.asyncio
async def test_login_wrong_password(client, test_user):
    response = await client.post("/api/v1/auth/login", json={
        "email": test_user.email,
        "password": "WrongPassword!",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user(client):
    response = await client.post("/api/v1/auth/login", json={
        "email": "nobody@example.com",
        "password": "pass",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client, test_user, auth_headers):
    response = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email


@pytest.mark.asyncio
async def test_get_me_no_token(client):
    response = await client.get("/api/v1/auth/me")
    assert response.status_code in (401, 403)
