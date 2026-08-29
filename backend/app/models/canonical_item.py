"""
CanonicalItem model for normalized grocery product names.

NECESSITY: Different sellers use different names for the same product.
LOGIC: CanonicalItem stores the "standard" name and category mapping.
EDGE-CASE: If category_id is NULL, the item is uncategorized.
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func

from app.core.database import Base


class CanonicalItem(Base):
    __tablename__ = "canonical_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, unique=True, index=True)
    category = Column(String(100), nullable=False, default="uncategorized")
    unit_type = Column(String(50), nullable=False, default="piece")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
