"""
Grocery service for product browsing and search.

NECESSITY: Business logic for product discovery.
LOGIC: Coordinates between product and seller repositories.
EDGE-CASE: Returns empty lists for no matches; validates seller is active.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.repositories import product_repository, seller_repository
from app.services.unit_normalizer import BangladeshUnitNormalizer


normalizer = BangladeshUnitNormalizer()


async def list_all_products(session: AsyncSession) -> list[dict]:
    """
    List all available products with seller info.

    NECESSITY: Users browse products from multiple sellers.
    LOGIC: Fetches products, enriches with seller name.
    EDGE-CASE: Skips products with deactivated sellers.
    """
    products = await product_repository.list_available_products(session)
    results = []
    for p in products:
        seller = await seller_repository.get_seller_by_id(session, p.seller_id)
        if seller and seller.is_active:
            results.append({
                "id": p.id,
                "name": p.name,
                "price": p.price,
                "unit": p.unit,
                "stock_quantity": p.stock_quantity,
                "image_url": p.image_url,
                "seller_id": p.seller_id,
                "seller_name": seller.name,
                "normalized_price_per_gram": _normalize_price(p.price, p.unit),
            })
    return results


async def search_products(session: AsyncSession, query: str) -> list[dict]:
    """
    Search products by name.

    NECESSITY: Users need to find specific items.
    LOGIC: Case-insensitive partial match on product name.
    EDGE-CASE: Returns empty list for no matches.
    """
    products = await product_repository.search_products(session, query)
    results = []
    for p in products:
        seller = await seller_repository.get_seller_by_id(session, p.seller_id)
        if seller and seller.is_active:
            results.append({
                "id": p.id,
                "name": p.name,
                "price": p.price,
                "unit": p.unit,
                "seller_id": p.seller_id,
                "seller_name": seller.name,
            })
    return results


async def get_product_detail(session: AsyncSession, product_id: int) -> dict | None:
    """
    Get full product details including seller info.

    NECESSITY: Users view product details before adding to cart.
    LOGIC: Fetches product and seller, returns combined data.
    EDGE-CASE: Returns None if product not found or seller deactivated.
    """
    product = await product_repository.get_product_by_id(session, product_id)
    if not product:
        return None

    seller = await seller_repository.get_seller_by_id(session, product.seller_id)
    if not seller or not seller.is_active:
        return None

    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "unit": product.unit,
        "stock_quantity": product.stock_quantity,
        "image_url": product.image_url,
        "is_available": product.is_available,
        "seller": {
            "id": seller.id,
            "name": seller.name,
            "address": seller.address,
            "phone": seller.phone,
        },
    }


def _normalize_price(price: float, unit: str) -> float:
    """Normalize price to per-gram basis for comparison."""
    if unit.lower() in ("gram", "g"):
        return price
    normalized, base_unit = normalizer.normalize(price, unit)
    if base_unit == "gram":
        return normalized
    return price
