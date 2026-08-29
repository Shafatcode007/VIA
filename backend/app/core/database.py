# NECESSITY: Async SQLAlchemy engine and session factory for PostgreSQL
# LOGIC: Uses asyncpg driver for async operations, provides get_db dependency
# EDGE-CASE: Handles connection pool lifecycle, ensures clean shutdown

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings


# NECESSITY: Base class for all SQLAlchemy models
# LOGIC: DeclarativeBase provides declarative mapping
# EDGE-CASE: All models must inherit from this Base
class Base(DeclarativeBase):
    pass


# NECESSITY: Async engine for database connections
# LOGIC: create_async_engine handles connection pooling
# EDGE-CASE: pool_size and max_overflow prevent connection exhaustion
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=20,
    max_overflow=10,
)


# NECESSITY: Session factory for creating database sessions
# LOGIC: async_sessionmaker provides scoped sessions
# EDGE-CASE: expire_on_commit=False prevents detached instance errors
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:
    """
    Dependency that provides a database session.
    
    NECESSITY: Each request needs its own database session
    LOGIC: Yields session, ensures cleanup after request
    EDGE-CASE: Closes session even if request fails
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """
    Initialize database tables.
    
    NECESSITY: Creates all tables defined by models
    LOGIC: Uses Base.metadata.create_all for async
    EDGE-CASE: Only creates tables that don't exist
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """
    Close database engine.
    
    NECESSITY: Proper cleanup on application shutdown
    LOGIC: dispose() closes all connections in pool
    EDGE-CASE: Must be called on shutdown to prevent resource leak
    """
    await engine.dispose()
