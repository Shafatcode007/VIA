"""
Cart Optimization Engine for grocery checkout.

NECESSITY: Recommends optimal purchasing strategy across sellers.
LOGIC: Evaluates single_seller, split_seller, and hybrid strategies.
EDGE-CASE: Falls back to single_seller if only one seller has items.
"""

from dataclasses import dataclass, field
from app.services.unit_normalizer import BangladeshUnitNormalizer

normalizer = BangladeshUnitNormalizer()

DELIVERY_FEE_BDT = 60.0


@dataclass
class SellerItem:
    product_id: int
    product_name: str
    seller_id: int
    seller_name: str
    quantity: int
    price: float
    unit: str
    normalized_price: float
    in_stock: bool


@dataclass
class StrategyResult:
    strategy: str
    total_items: int
    total_cost: float
    delivery_fees: float
    total_with_delivery: float
    sellers_used: int
    estimated_savings: float = 0.0
    warnings: list[str] = field(default_factory=list)
    item_assignments: dict = field(default_factory=dict)


def evaluate_strategies(cart_items: list[dict]) -> dict:
    """
    Evaluate 3 purchasing strategies for a cart.

    NECESSITY: Users want the cheapest way to buy all items.
    LOGIC: Compares single_seller, split_seller, hybrid approaches.
    EDGE-CASE: Returns single_seller if only one seller available.
    """
    if not cart_items:
        return {
            "recommended": "single_seller",
            "strategies": {},
            "savings": 0.0,
        }

    items = []
    for ci in cart_items:
        norm_price, norm_unit = normalizer.normalize(ci["price"], ci["unit"])
        items.append(SellerItem(
            product_id=ci["product_id"],
            product_name=ci.get("product_name", ""),
            seller_id=ci["seller_id"],
            seller_name=ci.get("seller_name", ""),
            quantity=ci["quantity"],
            price=ci["price"],
            unit=ci["unit"],
            normalized_price=norm_price,
            in_stock=ci.get("in_stock", True),
        ))

    seller_ids = set(it.seller_id for it in items)

    single = _single_seller_strategy(items)
    split = _split_seller_strategy(items)
    hybrid = _hybrid_strategy(items)

    strategies = {
        "single_seller": single,
        "split_seller": split,
        "hybrid": hybrid,
    }

    best = min(strategies.values(), key=lambda s: s.total_with_delivery)
    worst = max(strategies.values(), key=lambda s: s.total_with_delivery)
    best.estimated_savings = round(worst.total_with_delivery - best.total_with_delivery, 2)

    return {
        "recommended": best.strategy,
        "strategies": {k: _strategy_to_dict(v) for k, v in strategies.items()},
        "savings": best.estimated_savings,
    }


def _single_seller_strategy(items: list[SellerItem]) -> StrategyResult:
    """
    Buy all items from the seller with the most items.

    NECESSITY: Simplest strategy — one delivery fee.
    LOGIC: Groups by seller, picks seller with most items.
    EDGE-CASE: If seller lacks stock, marks unavailable items.
    """
    from collections import Counter
    seller_counts = Counter(it.seller_id for it in items)
    best_seller_id = seller_counts.most_common(1)[0][0]

    total = 0.0
    unavailable = []
    assignments = {}
    for it in items:
        if it.seller_id == best_seller_id:
            total += it.price * it.quantity
            assignments[it.product_id] = {
                "seller_id": it.seller_id,
                "seller_name": it.seller_name,
                "line_total": round(it.price * it.quantity, 2),
            }
        else:
            unavailable.append(it.product_name)

    warnings = []
    if unavailable:
        warnings.append(f"Items not available from primary seller: {', '.join(unavailable)}")

    return StrategyResult(
        strategy="single_seller",
        total_items=sum(it.quantity for it in items if it.seller_id == best_seller_id),
        total_cost=round(total, 2),
        delivery_fees=DELIVERY_FEE_BDT,
        total_with_delivery=round(total + DELIVERY_FEE_BDT, 2),
        sellers_used=1,
        warnings=warnings,
        item_assignments=assignments,
    )


def _split_seller_strategy(items: list[SellerItem]) -> StrategyResult:
    """
    Buy each item from the cheapest seller.

    NECESSITY: Lowest item cost, but multiple delivery fees.
    LOGIC: For each product, finds seller with lowest price.
    EDGE-CASE: May have many sellers = many delivery fees.
    """
    from collections import defaultdict
    product_sellers: dict[int, list[SellerItem]] = defaultdict(list)
    for it in items:
        product_sellers[it.product_id].append(it)

    total = 0.0
    sellers_used = set()
    assignments = {}

    for pid, seller_items in product_sellers.items():
        cheapest = min(seller_items, key=lambda s: s.normalized_price)
        total += cheapest.price * cheapest.quantity
        sellers_used.add(cheapest.seller_id)
        assignments[pid] = {
            "seller_id": cheapest.seller_id,
            "seller_name": cheapest.seller_name,
            "line_total": round(cheapest.price * cheapest.quantity, 2),
        }

    delivery = len(sellers_used) * DELIVERY_FEE_BDT

    return StrategyResult(
        strategy="split_seller",
        total_items=sum(it.quantity for it in items),
        total_cost=round(total, 2),
        delivery_fees=round(delivery, 2),
        total_with_delivery=round(total + delivery, 2),
        sellers_used=len(sellers_used),
        item_assignments=assignments,
    )


def _hybrid_strategy(items: list[SellerItem]) -> StrategyResult:
    """
    Group by seller, but drop sellers below minimum order.

    NECESSITY: Balances convenience and cost.
    LOGIC: Groups items by seller, drops small sellers, reallocates.
    EDGE-CASE: If reallocation impossible, keeps original assignment.
    """
    MIN_ORDER = 200.0
    from collections import defaultdict
    seller_groups: dict[int, list[SellerItem]] = defaultdict(list)
    for it in items:
        seller_groups[it.seller_id].append(it)

    big_sellers = {}
    small_sellers = {}
    for sid, group in seller_groups.items():
        subtotal = sum(it.price * it.quantity for it in group)
        if subtotal >= MIN_ORDER:
            big_sellers[sid] = group
        else:
            small_sellers[sid] = group

    total = 0.0
    sellers_used = set()
    assignments = {}
    warnings = []

    for sid, group in big_sellers.items():
        for it in group:
            total += it.price * it.quantity
            sellers_used.add(sid)
            assignments[it.product_id] = {
                "seller_id": sid,
                "seller_name": it.seller_name,
                "line_total": round(it.price * it.quantity, 2),
            }

    for sid, group in small_sellers.items():
        for it in group:
            best_big = None
            best_price = float("inf")
            for big_sid, big_group in big_sellers.items():
                for big_it in big_group:
                    if big_it.product_id == it.product_id and big_it.normalized_price < best_price:
                        best_price = big_it.normalized_price
                        best_big = big_sid
            if best_big:
                total += it.price * it.quantity
                sellers_used.add(best_big)
                warnings.append(f"{it.product_name} reallocated from small seller to larger seller")
                assignments[it.product_id] = {
                    "seller_id": best_big,
                    "seller_name": it.seller_name,
                    "line_total": round(it.price * it.quantity, 2),
                }
            else:
                total += it.price * it.quantity
                sellers_used.add(sid)
                assignments[it.product_id] = {
                    "seller_id": sid,
                    "seller_name": it.seller_name,
                    "line_total": round(it.price * it.quantity, 2),
                }

    delivery = len(sellers_used) * DELIVERY_FEE_BDT

    return StrategyResult(
        strategy="hybrid",
        total_items=sum(it.quantity for it in items),
        total_cost=round(total, 2),
        delivery_fees=round(delivery, 2),
        total_with_delivery=round(total + delivery, 2),
        sellers_used=len(sellers_used),
        warnings=warnings,
        item_assignments=assignments,
    )


def _strategy_to_dict(s: StrategyResult) -> dict:
    return {
        "strategy": s.strategy,
        "total_items": s.total_items,
        "total_cost": s.total_cost,
        "delivery_fees": s.delivery_fees,
        "total_with_delivery": s.total_with_delivery,
        "sellers_used": s.sellers_used,
        "estimated_savings": s.estimated_savings,
        "warnings": s.warnings,
        "item_assignments": s.item_assignments,
    }
