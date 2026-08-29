import sys
sys.path.insert(0, r'D:\CSE 327 project VIA\backend')

import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.product import Product

async def check_products():
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select
        result = await session.execute(select(Product.name, Product.image_url).distinct())
        for row in result:
            print(f'{row.name[:40]:40} | {row.image_url}')

import asyncio
asyncio.run(check_products())