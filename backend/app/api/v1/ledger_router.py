"""
Ledger endpoints for seller financial tracking.

NECESSITY: Sellers view their earnings and transaction history.
LOGIC: Only sellers can view their own ledger; admins view all.
EDGE-CASE: Returns empty ledger for new sellers.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.models.user import User
from app.services import payment_service

router = APIRouter(prefix="/grocery/ledger", tags=["grocery-ledger"])


@router.get("/me")
async def get_my_ledger(
    user: User = Depends(require_role(["seller", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.seller_repository import get_sellers_by_user
    sellers = await get_sellers_by_user(db, user.id)

    all_entries = []
    for seller in sellers:
        entries = await payment_service.get_seller_ledger(db, seller.id)
        all_entries.extend(entries)

    return {"entries": all_entries, "count": len(all_entries)}
