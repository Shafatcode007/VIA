"""
BangladeshUnitNormalizer for grocery product unit normalization.

NECESSITY: Different sellers use different units for the same item.
LOGIC: Converts to a standard base unit for comparison and pricing.
EDGE-CASE: Unknown units return raw value with normalization_available=False.
"""

from dataclasses import dataclass, field


@dataclass
class UnitConversion:
    from_unit: str
    to_unit: str
    factor: float
    notes: str = ""


@dataclass
class NormalizeResult:
    value: float
    base_unit: str
    normalization_available: bool


@dataclass
class BangladeshUnitNormalizer:
    conversions: dict[str, UnitConversion] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.conversions:
            self.conversions = self._default_conversions()

    def _default_conversions(self) -> dict[str, UnitConversion]:
        return {
            "poya": UnitConversion("poya", "gram", 25.0, "1 poya = 25g"),
            "kg": UnitConversion("kg", "gram", 1000.0, "1 kg = 1000g"),
            "gram": UnitConversion("gram", "gram", 1.0, "base unit"),
            "g": UnitConversion("g", "gram", 1.0, "abbreviation"),
            "miniket": UnitConversion("miniket", "gram", 500.0, "1 miniket = 500g"),
            "seer": UnitConversion("seer", "gram", 933.0, "1 seer ≈ 933g"),
            "mound": UnitConversion("mound", "gram", 37320.0, "1 mound ≈ 37.32kg"),
            "litre": UnitConversion("litre", "ml", 1000.0, "1 litre = 1000ml"),
            "liter": UnitConversion("liter", "ml", 1000.0, "US spelling"),
            "ml": UnitConversion("ml", "ml", 1.0, "base unit"),
            "piece": UnitConversion("piece", "piece", 1.0, "base unit"),
            "dozen": UnitConversion("dozen", "piece", 12.0, "1 dozen = 12"),
            "half-dozen": UnitConversion("half-dozen", "piece", 6.0, "1/2 dozen"),
            "pa": UnitConversion("pa", "piece", 1.0, "pa = piece"),
        }

    def normalize(self, value: float, unit: str) -> tuple[float, str]:
        unit_lower = unit.lower().strip()
        conversion = self.conversions.get(unit_lower)
        if conversion is None:
            return value, unit
        return value * conversion.factor, conversion.to_unit

    def normalize_with_flag(self, value: float, unit: str) -> NormalizeResult:
        unit_lower = unit.lower().strip()
        conversion = self.conversions.get(unit_lower)
        if conversion is None:
            return NormalizeResult(value=value, base_unit=unit, normalization_available=False)
        return NormalizeResult(
            value=value * conversion.factor,
            base_unit=conversion.to_unit,
            normalization_available=True,
        )

    def to_base_cents(self, price_per_unit: float, unit: str) -> int:
        normalized_value, _ = self.normalize(price_per_unit, unit)
        return int(normalized_value * 100)

    def get_supported_units(self) -> list[str]:
        return list(self.conversions.keys())

    def add_conversion(self, from_unit: str, to_unit: str, factor: float, notes: str = "") -> None:
        self.conversions[from_unit.lower()] = UnitConversion(from_unit, to_unit, factor, notes)
