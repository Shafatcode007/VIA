"""Tests for admin endpoints — users, toggle-active, analytics."""

import pytest


# ─── GET /admin/users ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_admin_list_users(client, admin_headers):
    res = await client.get("/api/v1/admin/users", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "users" in data
    assert "total" in data
    assert data["total"] >= 1


@pytest.mark.asyncio
async def test_non_admin_list_users_403(client, auth_headers):
    res = await client.get("/api/v1/admin/users", headers=auth_headers)
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_no_token_list_users_401(client):
    res = await client.get("/api/v1/admin/users")
    assert res.status_code in (401, 403)


# ─── PATCH /admin/users/{id}/toggle-active ───────────────────────────────────

@pytest.mark.asyncio
async def test_admin_toggle_user_active(client, admin_headers, test_user):
    res = await client.patch(
        f"/api/v1/admin/users/{test_user.id}/toggle-active",
        headers=admin_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == test_user.id
    assert data["is_active"] is False


@pytest.mark.asyncio
async def test_admin_toggle_back(client, admin_headers, test_user):
    await client.patch(
        f"/api/v1/admin/users/{test_user.id}/toggle-active",
        headers=admin_headers,
    )
    res = await client.patch(
        f"/api/v1/admin/users/{test_user.id}/toggle-active",
        headers=admin_headers,
    )
    assert res.status_code == 200
    assert res.json()["is_active"] is True


@pytest.mark.asyncio
async def test_non_admin_toggle_403(client, auth_headers, test_user):
    res = await client.patch(
        f"/api/v1/admin/users/{test_user.id}/toggle-active",
        headers=auth_headers,
    )
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_admin_toggle_nonexistent_404(client, admin_headers):
    res = await client.patch(
        "/api/v1/admin/users/99999/toggle-active",
        headers=admin_headers,
    )
    assert res.status_code == 404


# ─── GET /admin/analytics ────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_admin_analytics(client, admin_headers):
    res = await client.get("/api/v1/admin/analytics", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "users_by_role" in data
    assert "total_orders" in data
    assert "total_revenue_cents" in data
    assert "total_rides" in data
    assert "total_ride_revenue_cents" in data
    assert "top_sellers" in data
    assert isinstance(data["users_by_role"], dict)
    assert isinstance(data["top_sellers"], list)


@pytest.mark.asyncio
async def test_non_admin_analytics_403(client, auth_headers):
    res = await client.get("/api/v1/admin/analytics", headers=auth_headers)
    assert res.status_code == 403
