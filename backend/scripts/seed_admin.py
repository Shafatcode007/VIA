"""Seed an admin user into PostgreSQL. Run once: python -m scripts.seed_admin"""

import asyncio
from app.core.database import AsyncSessionLocal, init_db
from app.core.security import hash_password
from app.models.user import User

ADMIN_EMAIL = "admin@via.com"
ADMIN_PASSWORD = "Admin@12345"
ADMIN_NAME = "VIA Admin"


async def main():
    await init_db()
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select
        result = await session.execute(select(User).where(User.email == ADMIN_EMAIL))
        existing = result.scalar_one_or_none()
        if existing:
            print(f"[skip] admin already exists: {ADMIN_EMAIL} (id={existing.id})")
            return

        user = User(
            email=ADMIN_EMAIL,
            hashed_password=hash_password(ADMIN_PASSWORD),
            full_name=ADMIN_NAME,
            role="ADMIN",
            is_active=True,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        print(f"[ok] admin created: {ADMIN_EMAIL} (id={user.id})")


if __name__ == "__main__":
    asyncio.run(main())
