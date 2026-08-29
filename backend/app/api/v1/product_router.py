"""
Product browsing and search endpoints.

NECESSITY: Public endpoints for product discovery.
LOGIC: No authentication required; supports search and listing.
EDGE-CASE: Returns empty lists for no matches.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.models.user import User
from app.repositories import product_repository, seller_repository
from app.schemas.grocery_schema import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
    SellerCreate,
    SellerResponse,
)
from app.services import grocery_service

router = APIRouter(prefix="/grocery", tags=["grocery"])


@router.get("/products")
async def list_products(
    q: str | None = Query(default=None, description="Search query"),
    db: AsyncSession = Depends(get_db),
):
    if q:
        results = await grocery_service.search_products(db, q)
    else:
        results = await grocery_service.list_all_products(db)
    return {"products": results, "count": len(results)}


@router.get("/products/{product_id}")
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    detail = await grocery_service.get_product_detail(db, product_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Product not found")
    return detail


@router.post("/sellers", response_model=SellerResponse)
async def create_seller(
    data: SellerCreate,
    user: User = Depends(require_role("seller", "admin")),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.seller_repository import create_seller
    seller = await create_seller(
        session=db,
        user_id=user.id,
        name=data.name,
        description=data.description,
        address=data.address,
        latitude=data.latitude,
        longitude=data.longitude,
        phone=data.phone,
        delivery_radius_km=data.delivery_radius_km,
    )
    return seller


@router.get("/sellers/me")
async def get_my_sellers(
    user: User = Depends(require_role("seller", "admin")),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.seller_repository import get_sellers_by_user
    sellers = await get_sellers_by_user(db, user.id)
    return {"sellers": sellers}


@router.post("/sellers/{seller_id}/products", response_model=ProductResponse)
async def create_product(
    seller_id: int,
    data: ProductCreate,
    user: User = Depends(require_role("seller", "admin")),
    db: AsyncSession = Depends(get_db),
):
    seller = await seller_repository.get_seller_by_id(db, seller_id)
    if not seller or seller.user_id != user.id:
        raise HTTPException(status_code=403, detail="Seller not found or unauthorized")

    product = await product_repository.create_product(
        session=db,
        seller_id=seller_id,
        name=data.name,
        price=data.price,
        unit=data.unit,
        canonical_item_id=data.canonical_item_id,
        description=data.description,
        stock_quantity=data.stock_quantity,
        image_url=data.image_url,
        is_available=data.is_available,
    )
    return product


@router.get("/sellers/{seller_id}/products")
async def list_seller_products(
    seller_id: int,
    user: User = Depends(require_role("seller", "admin")),
    db: AsyncSession = Depends(get_db),
):
    seller = await seller_repository.get_seller_by_id(db, seller_id)
    if not seller or seller.user_id != user.id:
        raise HTTPException(status_code=403, detail="Seller not found or unauthorized")

    products = await product_repository.list_products_by_seller(db, seller_id)
    return {"products": products}


@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    data: ProductUpdate,
    user: User = Depends(require_role("seller", "admin")),
    db: AsyncSession = Depends(get_db),
):
    product = await product_repository.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    seller = await seller_repository.get_seller_by_id(db, product.seller_id)
    if not seller or seller.user_id != user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    update_data = data.model_dump(exclude_unset=True)
    updated = await product_repository.update_product(db, product, **update_data)
    return updated
