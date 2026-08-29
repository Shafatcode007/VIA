"""
Schemas for canonical items, sellers, and products.

NECESSITY: Pydantic schemas validate API input/output.
LOGIC: Separate request/response schemas for each entity.
EDGE-CASE: Float prices validated as positive; strings have max lengths.
"""

from datetime import datetime
from pydantic import BaseModel, Field


# ── Canonical Item ──

class CanonicalItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    category: str = Field(default="uncategorized", max_length=100)
    unit_type: str = Field(default="piece", max_length=50)


class CanonicalItemResponse(BaseModel):
    id: int
    name: str
    category: str
    unit_type: str
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


# ── Seller ──

class SellerCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    address: str | None = Field(default=None, max_length=500)
    latitude: float | None = None
    longitude: float | None = None
    phone: str | None = Field(default=None, max_length=20)
    delivery_radius_km: float = Field(default=5.0, gt=0, le=100)


class SellerResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    phone: str | None = None
    is_active: bool
    delivery_radius_km: float
    minimum_order_amount: float = 200.0
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


# ── Product ──

class ProductCreate(BaseModel):
    canonical_item_id: int | None = None
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    price: float = Field(..., gt=0)
    unit: str = Field(default="piece", max_length=50)
    stock_quantity: int = Field(default=0, ge=0)
    image_url: str | None = Field(default=None, max_length=500)
    is_available: bool = True


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    price: float | None = Field(default=None, gt=0)
    unit: str | None = Field(default=None, max_length=50)
    stock_quantity: int | None = Field(default=None, ge=0)
    image_url: str | None = Field(default=None, max_length=500)
    is_available: bool | None = None


class ProductResponse(BaseModel):
    id: int
    seller_id: int
    canonical_item_id: int | None = None
    name: str
    description: str | None = None
    price: float
    unit: str
    stock_quantity: int
    image_url: str | None = None
    is_available: bool
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


# ── Canonical Item with Products (for seller catalog) ──

class CanonicalItemWithProducts(CanonicalItemResponse):
    products: list[ProductResponse] = []
