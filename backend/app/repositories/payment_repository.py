"""
Repository for payment and ledger data access.

NECESSITY: Records financial transactions and seller balances.
LOGIC: Payment links to order; ledger entries track credit/debit per seller.
EDGE-CASE: idempotency_key prevents duplicate payment processing.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.payment import Payment, LedgerEntry


async def create_payment(
    session: AsyncSession,
    order_id: int,
    user_id: int,
    amount_cents: int,
    method: str,
    idempotency_key: str | None = None,
) -> Payment:
    payment = Payment(
        order_id=order_id,
        user_id=user_id,
        amount_cents=amount_cents,
        method=method,
        idempotency_key=idempotency_key,
    )
    session.add(payment)
    await session.flush()
    return payment


async def get_payment_by_id(session: AsyncSession, payment_id: int) -> Payment | None:
    result = await session.execute(select(Payment).where(Payment.id == payment_id))
    return result.scalar_one_or_none()


async def get_payment_by_idempotency_key(
    session: AsyncSession, idempotency_key: str
) -> Payment | None:
    result = await session.execute(
        select(Payment).where(Payment.idempotency_key == idempotency_key)
    )
    return result.scalar_one_or_none()


async def get_payment_by_order_id(session: AsyncSession, order_id: int) -> Payment | None:
    result = await session.execute(
        select(Payment).where(Payment.order_id == order_id).order_by(Payment.created_at.desc())
    )
    return result.scalars().first()


async def update_payment_status(
    session: AsyncSession, payment: Payment, status: str, transaction_id: str | None = None
) -> Payment:
    payment.status = status
    if transaction_id:
        payment.transaction_id = transaction_id
    await session.flush()
    return payment


async def create_ledger_entry(
    session: AsyncSession,
    seller_id: int,
    order_id: int,
    amount_cents: int,
    entry_type: str,
    description: str | None = None,
) -> LedgerEntry:
    entry = LedgerEntry(
        seller_id=seller_id,
        order_id=order_id,
        amount_cents=amount_cents,
        entry_type=entry_type,
        description=description,
    )
    session.add(entry)
    await session.flush()
    return entry


async def get_ledger_by_seller(session: AsyncSession, seller_id: int) -> list[LedgerEntry]:
    result = await session.execute(
        select(LedgerEntry)
        .where(LedgerEntry.seller_id == seller_id)
        .order_by(LedgerEntry.created_at.desc())
    )
    return list(result.scalars().all())
