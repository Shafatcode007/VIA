"""
Seed script for grocery module demo data.

NECESSITY: Provides realistic data for faculty demo.
LOGIC: Creates canonical items, sellers, and products with varied units/prices.
EDGE-CASE: Idempotent — skips if data already exists.
"""

import asyncio
from app.core.database import AsyncSessionLocal, engine, Base
from app.models import *
from app.core.security import hash_password


CANONICAL_ITEMS = [
    ("Basmati Rice", "grains", "kg"),
    ("Miniket Rice", "grains", "miniket"),
    ("Onion", "vegetables", "kg"),
    ("Potato", "vegetables", "kg"),
    ("Tomato", "vegetables", "kg"),
    ("Green Chili", "vegetables", "kg"),
    ("Garlic", "vegetables", "kg"),
    ("Ginger", "vegetables", "kg"),
    ("Chicken", "meat", "kg"),
    ("Beef", "meat", "kg"),
    ("Mutton", "meat", "kg"),
    ("Egg", "dairy", "piece"),
    ("Milk", "dairy", "litre"),
    ("Cooking Oil", "essentials", "litre"),
    ("Sugar", "essentials", "kg"),
    ("Salt", "essentials", "kg"),
    ("Flour (Atta)", "grains", "kg"),
    ("Lentils (Dal)", "grains", "kg"),
    ("Tea Leaves", "beverages", "kg"),
    ("Biscuits", "snacks", "dozen"),
]

SELLERS = [
    ("Shwapno", "Gulshan, Dhaka", 23.7937, 90.4095, "01711-000001", 10.0),
    ("Meena Bazar", "Banani, Dhaka", 23.7948, 90.4024, "01711-000002", 8.0),
    ("Aarong", "Dhanmondi, Dhaka", 23.7461, 90.3742, "01711-000003", 12.0),
    ("Unimart", "Uttara, Dhaka", 23.8759, 90.3795, "01711-000004", 15.0),
    ("Chaldal", "Mirpur, Dhaka", 23.8041, 90.3532, "01711-000005", 7.0),
]

PRODUCTS_PER_SELLER = [
    # (canonical_idx, name, price, unit, stock)
    (0, "Premium Basmati Rice 5kg", 650.0, "kg", 200),
    (1, "Miniket Rice 1kg", 85.0, "miniket", 300),
    (2, "Fresh Onion 1kg", 40.0, "kg", 500),
    (3, "Local Potato 1kg", 35.0, "kg", 400),
    (4, "Ripe Tomato 1kg", 60.0, "kg", 250),
    (5, "Green Chili 250g", 25.0, "poya", 350),
    (6, "Garlic 500g", 80.0, "miniket", 150),
    (7, "Fresh Ginger 250g", 30.0, "poya", 200),
    (8, "Broiler Chicken 1kg", 280.0, "kg", 100),
    (9, "Fresh Beef 1kg", 550.0, "kg", 80),
    (10, "Mutton 1kg", 800.0, "kg", 40),
    (11, "Farm Egg (1 piece)", 12.0, "piece", 1000),
    (12, "Fresh Milk 1 litre", 70.0, "litre", 300),
    (13, "Soybean Oil 1 litre", 180.0, "litre", 250),
    (14, "Sugar 1kg", 85.0, "kg", 400),
    (15, "Iodized Salt 1kg", 30.0, "kg", 500),
    (16, "Atta Flour 1kg", 55.0, "kg", 300),
    (17, "Masoor Dal 1kg", 120.0, "kg", 200),
    (18, "Premium Tea 500g", 150.0, "miniket", 180),
    (19, "Mixed Biscuit Pack", 60.0, "dozen", 250),
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        from sqlalchemy import select, func

        count = await session.scalar(select(func.count()).select_from(CanonicalItem))
        if count and count > 0:
            print(f"Seed data already exists ({count} canonical items). Skipping.")
            return

        print("Seeding canonical items...")
        canonical_items = []
        for name, category, unit_type in CANONICAL_ITEMS:
            item = CanonicalItem(name=name, category=category, unit_type=unit_type)
            session.add(item)
            canonical_items.append(item)
        await session.flush()

        print("Seeding sellers and users...")
        sellers = []
        for i, (name, addr, lat, lon, phone, radius) in enumerate(SELLERS):
            user = User(
                email=f"seller{i+1}@via.com",
                hashed_password=hash_password("seller123"),
                full_name=f"{name} Manager",
                role="seller",
                is_active=True,
                phone=phone,
            )
            session.add(user)
            await session.flush()

            seller = Seller(
                user_id=user.id,
                name=name,
                description=f"Trusted grocery seller at {addr}",
                address=addr,
                latitude=lat,
                longitude=lon,
                phone=phone,
                is_active=True,
                delivery_radius_km=radius,
            )
            session.add(seller)
            sellers.append(seller)
        await session.flush()

        print("Seeding products...")
        product_count = 0
        for seller in sellers:
            for canon_idx, name, price, unit, stock in PRODUCTS_PER_SELLER:
                variation = 1.0 + (hash(f"{seller.name}{name}") % 20 - 10) / 100.0
                product = Product(
                    seller_id=seller.id,
                    canonical_item_id=canonical_items[canon_idx].id,
                    name=f"{name}",
                    description=f"Fresh {name} from {seller.name}",
                    price=round(price * variation, 2),
                    unit=unit,
                    stock_quantity=stock,
                    is_available=True,
                )
                session.add(product)
                product_count += 1

        await session.commit()
        print(f"Seed complete: {len(CANONICAL_ITEMS)} items, {len(SELLERS)} sellers, {product_count} products")


if __name__ == "__main__":
    asyncio.run(seed())
