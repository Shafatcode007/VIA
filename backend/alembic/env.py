# NECESSITY: Alembic environment configuration for async PostgreSQL
# LOGIC: Imports app settings and Base metadata for autogenerate
# EDGE-CASE: Uses async engine for migration execution

from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context

# Import app settings and Base
from app.core.config import settings
from app.core.database import Base

# Import all models here so they're registered with Base.metadata
from app.models.user import User
from app.models.canonical_item import CanonicalItem
from app.models.seller import Seller
from app.models.product import Product
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.order import Order, SubOrder, OrderItem
from app.models.payment import Payment, LedgerEntry
from app.models.transport import Driver, RideBooking, VehicleType, RideStatus
from app.models.notification import Notification

# Alembic Config object
config = context.config

# Set sqlalchemy.url from app settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# MetaData for autogenerate support
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.
    
    NECESSITY: Generates SQL script without database connection
    LOGIC: Creates URL without connecting, outputs SQL
    EDGE-CASE: Useful for reviewing migrations before applying
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:
    """
    Run migrations with a connection.
    
    NECESSITY: Encapsulates migration logic
    LOGIC: Configures context with connection and runs
    EDGE-CASE: None
    """
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """
    Run migrations in 'online' mode with async engine.
    
    NECESSITY: Creates async engine and runs migrations
    LOGIC: Uses async_engine_from_config for async PostgreSQL
    EDGE-CASE: Disables pool in migration context
    """
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.
    
    NECESSITY: Applies migrations to actual database
    LOGIC: Delegates to async migration runner
    EDGE-CASE: None
    """
    import asyncio
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
