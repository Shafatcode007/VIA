"""
Cart endpoints.

NECESSITY: Users manage their shopping cart.
LOGIC: All operations require authentication.
EDGE-CASE: Validates stock before adding/updating items.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.order_schema import CartItemAdd, CartItemUpdate
from app.services import cart_service

router = APIRouter(prefix="/grocery/cart", tags=["grocery-cart"])


@router.get("")
async def get_cart(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cart = await cart_service.get_cart_with_details(db, user.id)
    return cart


@router.post("/items")
async def add_item(
    data: CartItemAdd,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        cart = await cart_service.add_to_cart(db, user.id, data.product_id, data.quantity)
        return cart
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/items/{item_id}")
async def update_item(
    item_id: int,
    data: CartItemUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        cart = await cart_service.update_cart_item(db, user.id, item_id, data.quantity)
        return cart
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/items/{item_id}")
async def remove_item(
    item_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cart = await cart_service.remove_from_cart(db, user.id, item_id)
    return cart


@router.get("/optimize")
async def optimize_cart(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.services.cart_optimization_engine import evaluate_strategies
    from app.services import cart_service as cs
    from app.repositories import product_repository, seller_repository

    cart = await cs.get_cart_with_details(db, user.id)
    if not cart.items:
        return {"recommended": "single_seller", "strategies": {}, "savings": 0.0}

    enriched_items = []
    for item in cart.items:
        product = await product_repository.get_product_by_id(db, item.product_id)
        if product:
            seller = await seller_repository.get_seller_by_id(db, product.seller_id)
            enriched_items.append({
                "product_id": item.product_id,
                "product_name": item.product_name,
                "seller_id": product.seller_id,
                "seller_name": seller.name if seller else "Unknown",
                "quantity": item.quantity,
                "price": item.product_price,
                "unit": product.unit,
                "in_stock": product.stock_quantity >= item.quantity,
            })

    return evaluate_strategies(enriched_items)
