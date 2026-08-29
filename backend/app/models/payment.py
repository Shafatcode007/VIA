"""
Payment and Ledger models for financial tracking.

NECESSITY: Payments record transactions; ledger tracks balances.
LOGIC: Payment links to order; LedgerEntry records credits/debits.
EDGE-CASE: idempotency_key prevents duplicate payment processing.
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.sql import func

from app.core.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    user_id = Column(Integer, nullable=False)
    amount_cents = Column(Integer, nullable=False)
    method = Column(String(50), nullable=False)
    status = Column(String(30), nullable=False, default="pending")
    transaction_id = Column(String(200), nullable=True)
    idempotency_key = Column(String(200), nullable=True, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class LedgerEntry(Base):
    __tablename__ = "ledger_entries"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("sellers.id"), nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    amount_cents = Column(Integer, nullable=False)
    entry_type = Column(String(30), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
