"""Role assignment security: opt-in driver, seeded-only admin, token reissue."""
import uuid

from fastapi.testclient import TestClient

from app.main import app


def _register(client, role):
    email = f"role_{uuid.uuid4().hex[:8]}@example.com"
    reg = client.post("/api/v1/auth/register", json={"email": email, "password": "Role@12345", "role": role, "full_name": "Role Test"})
    assert reg.status_code in (200, 201), reg.text
    login = client.post("/api/v1/auth/login", json={"email": email, "password": "Role@12345"})
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def test_register_driver_role_from_payload() -> None:
    client = TestClient(app)
    auth = _register(client, "DRIVER")
    me = client.get("/api/v1/auth/me", headers=auth).json()
    assert str(me["role"]).upper() == "DRIVER"


def test_public_register_cannot_create_admin() -> None:
    client = TestClient(app)
    email = f"hack_{uuid.uuid4().hex[:8]}@via.test"
    res = client.post("/api/v1/auth/register", json={"email": email, "password": "Hack@12345", "role": "ADMIN", "full_name": "Hacker"})
    assert res.status_code in (400, 403, 422), "public admin registration must be rejected"


def test_become_driver_issues_new_driver_token() -> None:
    client = TestClient(app)
    resident = _register(client, "RESIDENT")
    old_me = client.get("/api/v1/auth/me", headers=resident).json()
    assert str(old_me["role"]).upper() == "RESIDENT"

    upgraded = client.post("/api/v1/auth/become-driver", headers=resident)
    assert upgraded.status_code == 200, upgraded.text
    new_token = upgraded.json()["access_token"]

    new_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {new_token}"}).json()
    assert str(new_me["role"]).upper() == "DRIVER"

    # old resident token must NOT unlock driver endpoints
    assert client.get("/api/v1/transport/driver/bookings", headers=resident).status_code == 403
    # new driver token must unlock them
    assert client.get("/api/v1/transport/driver/bookings", headers={"Authorization": f"Bearer {new_token}"}).status_code == 200