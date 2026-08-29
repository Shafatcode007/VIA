"""
Tests for the unit normalizer.

NECESSITY: Validates Bangladesh unit conversion logic.
LOGIC: Tests each conversion rule and fallback behavior.
EDGE-CASE: Unknown units should return original values.
"""

import pytest
from app.services.unit_normalizer import BangladeshUnitNormalizer


class TestBangladeshUnitNormalizer:
    def setup_method(self):
        self.normalizer = BangladeshUnitNormalizer()

    def test_poya_to_grams(self):
        value, unit = self.normalizer.normalize(2, "poya")
        assert value == 50.0
        assert unit == "gram"

    def test_miniket_to_grams(self):
        value, unit = self.normalizer.normalize(1, "miniket")
        assert value == 500.0
        assert unit == "gram"

    def test_kg_to_grams(self):
        value, unit = self.normalizer.normalize(1, "kg")
        assert value == 1000.0
        assert unit == "gram"

    def test_dozen_to_pieces(self):
        value, unit = self.normalizer.normalize(2, "dozen")
        assert value == 24.0
        assert unit == "piece"

    def test_case_insensitive(self):
        value, unit = self.normalizer.normalize(1, "KG")
        assert value == 1000.0
        assert unit == "gram"

    def test_unknown_unit_fallback(self):
        value, unit = self.normalizer.normalize(5, "unknown_unit")
        assert value == 5
        assert unit == "unknown_unit"

    def test_seer_to_grams(self):
        value, unit = self.normalizer.normalize(1, "seer")
        assert value == 933.0
        assert unit == "gram"

    def test_mound_to_grams(self):
        value, unit = self.normalizer.normalize(1, "mound")
        assert value == 37320.0
        assert unit == "gram"

    def test_litres_to_ml(self):
        value, unit = self.normalizer.normalize(1, "litre")
        assert value == 1000.0
        assert unit == "ml"

    def test_get_supported_units(self):
        units = self.normalizer.get_supported_units()
        assert "poya" in units
        assert "miniket" in units
        assert "kg" in units
        assert "dozen" in units

    def test_add_custom_conversion(self):
        self.normalizer.add_conversion("bigha", "sqft", 14400.0, "1 bigha = 14400 sqft")
        value, unit = self.normalizer.normalize(1, "bigha")
        assert value == 14400.0
        assert unit == "sqft"

    def test_to_base_cents(self):
        cents = self.normalizer.to_base_cents(50, "gram")
        assert cents == 5000

    def test_to_base_cents_with_conversion(self):
        cents = self.normalizer.to_base_cents(2, "poya")
        assert cents == 5000  # 2 * 25 = 50g * 100 = 5000 cents
