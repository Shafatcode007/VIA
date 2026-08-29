"""
Payment service for processing payments and ledger management.

NECESSITY: Handles payment initiation, confirmation, and ledger tracking.
LOGIC: Validates order, processes payment (simulated), updates ledger.
EDGE-CASE: Idempotency key prevents duplicate charges and ledger entries.
"""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories import payment_repository, order_repository


async def initiate_payment(
    session: AsyncSession,
    order_id: int,
    user_id: int,
    method: str,
    idempotency_key: str | None = None,
) -> dict:
    if idempotency_key:
        existing = await payment_repository.get_payment_by_idempotency_key(session, idempotency_key)
        if existing:
            return {
                "payment_id": existing.id,
                "status": existing.status,
                "message": "Payment already initiated",
            }

    order = await order_repository.get_order_by_id(session, order_id)
    if not order:
        raise ValueError("Order not found")
    if order.user_id != user_id:
        raise ValueError("Unauthorized")

    payment = await payment_repository.create_payment(
        session, order_id=order_id, user_id=user_id,
        amount_cents=order.total_cents, method=method,
        idempotency_key=idempotency_key,
    )

    return {
        "payment_id": payment.id,
        "status": payment.status,
        "amount_cents": payment.amount_cents,
        "method": payment.method,
    }


async def pay_order(
    session: AsyncSession,
    order_id: int,
    user_id: int,
    method: str,
) -> dict:
    """
    Single-step pay: checks idempotency, creates payment, confirms it,
    updates order status, and creates ledger entries — all in one call.
    Returns full payment detail.
    """
    order = await order_repository.get_order_by_id(session, order_id)
    if not order:
        raise ValueError("Order not found")
    if order.user_id != user_id:
        raise ValueError("Unauthorized")

    existing = await payment_repository.get_payment_by_order_id(session, order_id)
    if existing and existing.status == "completed":
        return {
            "payment_id": existing.id,
            "order_id": order_id,
            "amount_cents": existing.amount_cents,
            "method": existing.method,
            "status": existing.status,
            "transaction_id": existing.transaction_id,
            "created_at": str(existing.created_at) if existing.created_at else None,
        }
    if existing and existing.status == "pending":
        payment = existing
    else:
        idempotency_key = f"order_{order_id}_{uuid.uuid4().hex[:12]}"
        payment = await payment_repository.create_payment(
            session, order_id=order_id, user_id=user_id,
            amount_cents=order.total_cents, method=method,
            idempotency_key=idempotency_key,
        )

    transaction_id = f"txn_{uuid.uuid4().hex[:16]}"
    payment = await payment_repository.update_payment_status(
        session, payment, "completed", transaction_id
    )

    await order_repository.update_order_status(session, order, "confirmed")

    sub_orders = await order_repository.get_sub_orders_by_order(session, order_id)
    for so in sub_orders:
        existing_entries = await payment_repository.get_ledger_by_seller(session, so.seller_id)
        already_recorded = any(
            e.order_id == order_id and e.entry_type == "credit"
            for e in existing_entries
        )
        if not already_recorded:
            await payment_repository.create_ledger_entry(
                session, seller_id=so.seller_id, order_id=order_id,
                amount_cents=so.subtotal_cents, entry_type="credit",
                description=f"Order #{order_id} payment",
            )

    return {
        "payment_id": payment.id,
        "order_id": order_id,
        "amount_cents": payment.amount_cents,
        "method": payment.method,
        "status": payment.status,
        "transaction_id": payment.transaction_id,
        "created_at": str(payment.created_at) if payment.created_at else None,
    }


async def get_invoice(
    session: AsyncSession,
    order_id: int,
    user_id: int,
) -> dict | None:
    """Return combined order + payment data for invoice display."""
    from app.repositories import seller_repository
    from sqlalchemy import select
    from app.models.product import Product

    order = await order_repository.get_order_by_id(session, order_id)
    if not order or order.user_id != user_id:
        return None

    sub_orders = await order_repository.get_sub_orders_by_order(session, order.id)
    sub_order_data = []
    for so in sub_orders:
        items = await order_repository.get_order_items_by_sub_order(session, so.id)
        seller = await seller_repository.get_seller_by_id(session, so.seller_id)
        resolved_items = []
        for i in items:
            product_result = await session.execute(
                select(Product).where(Product.id == i.product_id)
            )
            product_obj = product_result.scalar_one_or_none()
            resolved_items.append({
                "id": i.id,
                "product_id": i.product_id,
                "product_name": product_obj.name if product_obj else f"Product #{i.product_id}",
                "unit": product_obj.unit if product_obj else "piece",
                "quantity": i.quantity,
                "unit_price_cents": i.unit_price_cents,
                "total_cents": i.total_cents,
            })
        sub_order_data.append({
            "id": so.id,
            "seller_id": so.seller_id,
            "seller_name": seller.name if seller else f"Seller #{so.seller_id}",
            "status": so.status,
            "subtotal_cents": so.subtotal_cents,
            "items": resolved_items,
        })

    payment = await payment_repository.get_payment_by_order_id(session, order.id)
    payment_data = None
    if payment:
        payment_data = {
            "payment_id": payment.id,
            "amount_cents": payment.amount_cents,
            "method": payment.method,
            "status": payment.status,
            "transaction_id": payment.transaction_id,
            "created_at": str(payment.created_at) if payment.created_at else None,
        }

    return {
        "id": order.id,
        "status": order.status,
        "total_cents": order.total_cents,
        "delivery_address": order.delivery_address,
        "sub_orders": sub_order_data,
        "payment": payment_data,
        "invoice_number": f"VIA-{order.id}",
        "created_at": str(order.created_at) if order.created_at else None,
    }


async def confirm_payment(
    session: AsyncSession,
    payment_id: int,
    transaction_id: str,
) -> dict:
    payment = await payment_repository.get_payment_by_id(session, payment_id)
    if not payment:
        raise ValueError("Payment not found")

    if payment.status == "completed":
        return {"status": "already_completed", "payment_id": payment.id}

    payment = await payment_repository.update_payment_status(
        session, payment, "completed", transaction_id
    )

    order = await order_repository.get_order_by_id(session, payment.order_id)
    if order:
        await order_repository.update_order_status(session, order, "confirmed")

    sub_orders = await order_repository.get_sub_orders_by_order(session, payment.order_id)
    for so in sub_orders:
        existing_entries = await payment_repository.get_ledger_by_seller(session, so.seller_id)
        already_recorded = any(
            e.order_id == payment.order_id and e.entry_type == "credit"
            for e in existing_entries
        )
        if not already_recorded:
            await payment_repository.create_ledger_entry(
                session, seller_id=so.seller_id, order_id=payment.order_id,
                amount_cents=so.subtotal_cents, entry_type="credit",
                description=f"Order #{payment.order_id} payment",
            )

    return {"status": "completed", "payment_id": payment.id}


async def get_seller_ledger(session: AsyncSession, seller_id: int) -> list[dict]:
    entries = await payment_repository.get_ledger_by_seller(session, seller_id)
    return [
        {
            "id": e.id, "order_id": e.order_id, "amount_cents": e.amount_cents,
            "entry_type": e.entry_type, "description": e.description,
            "created_at": str(e.created_at) if e.created_at else None,
        }
        for e in entries
    ]
