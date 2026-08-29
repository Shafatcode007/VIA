"""add payment fields to ride_bookings

Revision ID: c4d9e1f2a8b3
Revises: aa05a4b75778
Create Date: 2026-08-23 02:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4d9e1f2a8b3'
down_revision: Union[str, None] = 'aa05a4b75778'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add payment columns to ride_bookings
    op.add_column('ride_bookings', sa.Column('payment_status', sa.String(length=20), nullable=False, server_default='UNPAID'))
    op.add_column('ride_bookings', sa.Column('payment_method', sa.String(length=20), nullable=True))
    op.add_column('ride_bookings', sa.Column('transaction_ref', sa.String(length=40), nullable=True))
    op.add_column('ride_bookings', sa.Column('paid_at', sa.DateTime(timezone=True), nullable=True))
    
    # Create index on payment_status
    op.create_index(op.f('ix_ride_bookings_payment_status'), 'ride_bookings', ['payment_status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_ride_bookings_payment_status'), table_name='ride_bookings')
    op.drop_column('ride_bookings', 'paid_at')
    op.drop_column('ride_bookings', 'transaction_ref')
    op.drop_column('ride_bookings', 'payment_method')
    op.drop_column('ride_bookings', 'payment_status')