"""Mock distance-based fare estimator for ride bookings.

Pure, deterministic logic (no DB/IO) so it is trivially unit-testable.
Vehicle classes: bike, ev, car, car_xl. The legacy 'auto' tariff is kept
only so historical bookings remain readable; it is NOT bookable.
"""

from __future__ import annotations

import math
from dataclasses import dataclass


@dataclass(frozen=True)
class FareEstimate:
    vehicle_type: str
    base_fare: float
    distance_km: float
    distance_cost: float
    total_fare: float


BOOKABLE_VEHICLES: tuple[str, ...] = ("bike", "ev", "car", "car_xl")

VEHICLE_TARIFFS: dict[str, dict[str, float]] = {
    "bike":   {"base_fare": 30.0,  "per_km": 10.0, "min_fare": 40.0},
    "ev":     {"base_fare": 60.0,  "per_km": 18.0, "min_fare": 80.0},
    "car":    {"base_fare": 80.0,  "per_km": 25.0, "min_fare": 110.0},
    "car_xl": {"base_fare": 120.0, "per_km": 35.0, "min_fare": 160.0},
    "auto":   {"base_fare": 40.0,  "per_km": 12.0, "min_fare": 60.0},  # legacy read-only
}


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in kilometres between two WGS84 points."""
    earth_radius_km = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    return 2 * earth_radius_km * math.asin(math.sqrt(a))


def estimate_fare(
    vehicle_type: str,
    pickup_lat: float,
    pickup_lon: float,
    drop_lat: float,
    drop_lon: float,
) -> FareEstimate:
    """Return a deterministic mock fare for a bookable vehicle class."""
    key = vehicle_type.strip().lower()
    if key not in BOOKABLE_VEHICLES:
        raise ValueError(f"Unsupported vehicle type: {vehicle_type}")
    tariff = VEHICLE_TARIFFS[key]
    distance = haversine_km(pickup_lat, pickup_lon, drop_lat, drop_lon)
    billable_km = max(distance, 1.0)
    distance_cost = round(billable_km * tariff["per_km"], 2)
    total = max(round(tariff["base_fare"] + distance_cost, 2), tariff["min_fare"])
    return FareEstimate(
        vehicle_type=key,
        base_fare=tariff["base_fare"],
        distance_km=round(distance, 2),
        distance_cost=distance_cost,
        total_fare=total,
    )