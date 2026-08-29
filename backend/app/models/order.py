"""
Order models for master order, sub-order, and order items.

NECESSITY: Orders track purchases; split per seller for fulfillment.
LOGIC: MasterOrder owns the overall transaction; SubOrder per seller;
       OrderItem per product within a sub-order.
EDGE-CASE: status transitions are validated; total_cents avoids float.
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.sql import func

from app.core.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    status = Column(String(30), nullable=False, default="pending")
    total_cents = Column(Integer, nullable=False, default=0)
    delivery_address = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class SubOrder(Base):
    __tablename__ = "sub_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    seller_id = Column(Integer, ForeignKey("sellers.id"), nullable=False)
    status = Column(String(30), nullable=False, default="pending")
    subtotal_cents = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    sub_order_id = Column(Integer, ForeignKey("sub_orders.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price_cents = Column(Integer, nullable=False)
    total_cents = Column(Integer, nullable=False)
