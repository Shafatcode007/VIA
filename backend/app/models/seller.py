"""
Seller model for vendor information.

NECESSITY: Each grocery product is listed by a seller.
LOGIC: Stores seller profile, location, and delivery capacity.
EDGE-CASE: is_active flag allows soft-deactivation without deleting data.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.sql import func

from app.core.database import Base


class Seller(Base):
    __tablename__ = "sellers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    address = Column(String(500), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    phone = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    delivery_radius_km = Column(Float, default=5.0)
    minimum_order_amount = Column(Float, default=200.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
