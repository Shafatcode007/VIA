"""Admin service for aggregate queries."""

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.order import Order, SubOrder
from app.models.payment import Payment
from app.models.seller import Seller
from app.models.transport import RideBooking, RideStatus, PaymentStatus


async def list_all_users(session: AsyncSession) -> list[User]:
    result = await session.execute(select(User).order_by(User.created_at.desc()))
    return list(result.scalars().all())


async def toggle_user_active(session: AsyncSession, user_id: int) -> User | None:
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user:
        user.is_active = not user.is_active
        await session.flush()
        await session.refresh(user)
    return user


async def get_analytics(session: AsyncSession) -> dict:
    # Users by role
    role_result = await session.execute(
        select(User.role, func.count(User.id)).group_by(User.role)
    )
    users_by_role = {row[0]: row[1] for row in role_result.all()}

    # Total orders + revenue (from payments)
    orders_result = await session.execute(select(func.count(Order.id)))
    total_orders = orders_result.scalar() or 0

    revenue_result = await session.execute(
        select(func.coalesce(func.sum(Payment.amount_cents), 0)).where(
            Payment.status == "completed"
        )
    )
    total_revenue_cents = revenue_result.scalar() or 0

    # Total rides + revenue
    rides_result = await session.execute(select(func.count(RideBooking.id)))
    total_rides = rides_result.scalar() or 0

    ride_revenue_result = await session.execute(
        select(func.coalesce(func.sum(RideBooking.estimated_fare * 100), 0)).where(
            RideBooking.payment_status == PaymentStatus.PAID
        )
    )
    total_ride_revenue_cents = ride_revenue_result.scalar() or 0

    # Top 5 sellers by revenue (from ledger entries or payments)
    top_sellers_result = await session.execute(
        select(
            Seller.name,
            func.coalesce(func.sum(Payment.amount_cents), 0).label("revenue"),
        )
        .join(SubOrder, SubOrder.seller_id == Seller.id)
        .join(Order, Order.id == SubOrder.order_id)
        .join(Payment, Payment.order_id == Order.id)
        .where(Payment.status == "completed")
        .group_by(Seller.id, Seller.name)
        .order_by(func.sum(Payment.amount_cents).desc())
        .limit(5)
    )
    top_sellers = [
        {"name": row[0], "revenue_cents": row[1]} for row in top_sellers_result.all()
    ]

    return {
        "users_by_role": users_by_role,
        "total_orders": total_orders,
        "total_revenue_cents": total_revenue_cents,
        "total_rides": total_rides,
        "total_ride_revenue_cents": total_ride_revenue_cents,
        "top_sellers": top_sellers,
    }
