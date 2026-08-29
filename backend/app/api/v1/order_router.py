"""
Order and payment endpoints.

NECESSITY: Users place orders and track their status.
LOGIC: Checkout converts cart to orders; payments record transactions.
EDGE-CASE: Validates ownership; prevents duplicate payments.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.order_schema import OrderCreate, PaymentCreate
from app.services import order_service, payment_service

router = APIRouter(prefix="/grocery/orders", tags=["grocery-orders"])


@router.post("/checkout")
async def checkout(
    data: OrderCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await order_service.checkout(db, user.id, data.delivery_address)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("")
async def list_orders(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    orders = await order_service.get_user_orders(db, user.id)
    return {"orders": orders}


@router.get("/invoice/{order_id}")
async def get_invoice(
    order_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    invoice = await payment_service.get_invoice(db, order_id, user.id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Order not found")
    return invoice


@router.get("/{order_id}")
async def get_order(
    order_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await order_service.get_order_detail(db, order_id, user.id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/{order_id}/pay")
async def pay_order(
    order_id: int,
    data: PaymentCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await payment_service.pay_order(
            db, order_id, user.id, data.method
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/payments/{payment_id}/confirm")
async def confirm_payment(
    payment_id: int,
    transaction_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await payment_service.confirm_payment(db, payment_id, transaction_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
