"""
Test configuration and fixtures.

NECESSITY: Provides test database and client fixtures.
LOGIC: Uses SQLite in-memory for fast, isolated tests.
EDGE-CASE: Each test gets a fresh database session.
"""

import asyncio
import uuid
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.core.database import Base, get_db
from app.main import app
from app.models.user import User
from app.core.security import hash_password, create_access_token


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def engine():
    eng = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield eng
    await eng.dispose()


@pytest_asyncio.fixture
async def session(engine):
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as s:
        yield s
        await s.rollback()


@pytest_asyncio.fixture
async def client(engine):
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async def override_get_db():
        async with async_session() as s:
            try:
                yield s
                await s.commit()
            except Exception:
                await s.rollback()
                raise

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(session):
    unique = uuid.uuid4().hex[:8]
    user = User(
        email=f"test-{unique}@example.com",
        hashed_password=hash_password("TestPass123!"),
        full_name="Test User",
        role="buyer",
        is_active=True,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_seller_user(session):
    unique = uuid.uuid4().hex[:8]
    user = User(
        email=f"seller-{unique}@example.com",
        hashed_password=hash_password("SellerPass123!"),
        full_name="Test Seller",
        role="seller",
        is_active=True,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest_asyncio.fixture
async def auth_headers(test_user):
    token = create_access_token(data={"sub": str(test_user.id), "email": test_user.email, "role": test_user.role})
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def seller_headers(test_seller_user):
    token = create_access_token(data={"sub": str(test_seller_user.id), "email": test_seller_user.email, "role": test_seller_user.role})
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def test_admin_user(session):
    unique = uuid.uuid4().hex[:8]
    user = User(
        email=f"admin-{unique}@example.com",
        hashed_password=hash_password("AdminPass123!"),
        full_name="Test Admin",
        role="ADMIN",
        is_active=True,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest_asyncio.fixture
async def admin_headers(test_admin_user):
    token = create_access_token(data={"sub": str(test_admin_user.id), "email": test_admin_user.email, "role": test_admin_user.role})
    return {"Authorization": f"Bearer {token}"}
