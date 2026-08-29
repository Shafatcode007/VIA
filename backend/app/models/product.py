"""
Product model for individual items listed by sellers.

NECESSITY: Sellers list products with prices and units.
LOGIC: Each product maps to a CanonicalItem for normalization.
EDGE-CASE: price_cents stored as integer to avoid floating point errors.
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, DateTime
from sqlalchemy.sql import func

from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("sellers.id"), nullable=False, index=True)
    canonical_item_id = Column(Integer, ForeignKey("canonical_items.id"), nullable=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(String(1000), nullable=True)
    price = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False, default="piece")
    stock_quantity = Column(Integer, default=0)
    image_url = Column(String(500), nullable=True)
    is_available = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
