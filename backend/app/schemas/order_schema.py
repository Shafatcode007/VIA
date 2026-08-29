"""
Schemas for cart, order, payment, and ledger.

NECESSITY: Pydantic schemas for checkout and payment flows.
LOGIC: Cart operations use product_id + quantity; orders store totals in cents.
EDGE-CASE: Payment idempotency_key prevents double charges.
"""

from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, field_serializer


# ── Cart ──

class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = Field(..., ge=1, le=999)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1, le=999)


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product_name: str = ""
    product_price: float = 0.0
    subtotal: float = 0.0

    model_config = {"from_attributes": True}

    @field_serializer("product_price", "subtotal")
    def _money_as_float(self, value: Decimal | float | int) -> float:
        return float(value)


class CartResponse(BaseModel):
    id: int
    items: list[CartItemResponse] = []
    total_cents: int = 0
    item_count: int = 0

    model_config = {"from_attributes": True}

    @field_serializer("total_cents")
    def _cents_as_int(self, value: int) -> int:
        return int(value)


# ── Order ──

class OrderCreate(BaseModel):
    delivery_address: str = Field(..., min_length=1)


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price_cents: int
    total_cents: int

    model_config = {"from_attributes": True}


class SubOrderResponse(BaseModel):
    id: int
    seller_id: int
    status: str
    subtotal_cents: int
    items: list[OrderItemResponse] = []

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    user_id: int
    status: str
    total_cents: int
    delivery_address: str | None = None
    sub_orders: list[SubOrderResponse] = []
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


# ── Payment ──

class PaymentCreate(BaseModel):
    method: str = Field(..., min_length=1, max_length=50)
    idempotency_key: str | None = Field(default=None, max_length=200)


class PaymentResponse(BaseModel):
    id: int
    order_id: int
    user_id: int
    amount_cents: int
    method: str
    status: str
    transaction_id: str | None = None
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


# ── Ledger ──

class LedgerEntryResponse(BaseModel):
    id: int
    seller_id: int
    order_id: int
    amount_cents: int
    entry_type: str
    description: str | None = None
    created_at: datetime | None = None

    model_config = {"from_attributes": True}
