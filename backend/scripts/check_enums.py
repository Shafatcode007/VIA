import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def check():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT typname FROM pg_type WHERE typtype='e';"))
        rows = result.fetchall()
        for row in rows:
            print(row[0])
    await engine.dispose()

asyncio.run(check())