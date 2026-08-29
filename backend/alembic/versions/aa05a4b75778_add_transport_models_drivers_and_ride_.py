"""add transport models: drivers and ride_bookings

Revision ID: aa05a4b75778
Revises: 
Create Date: 2026-08-22 23:50:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aa05a4b75778'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'drivers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(length=120), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('vehicle_type', sa.String(length=20), nullable=False),
        sa.Column('vehicle_number', sa.String(length=20), nullable=False),
        sa.Column('is_available', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('rating', sa.Float(), nullable=False, server_default=sa.text('4.5')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table(
        'ride_bookings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('driver_id', sa.Integer(), nullable=True),
        sa.Column('vehicle_type', sa.String(length=20), nullable=False),
        sa.Column('pickup_lat', sa.Float(), nullable=False),
        sa.Column('pickup_lon', sa.Float(), nullable=False),
        sa.Column('pickup_label', sa.String(length=200), nullable=True),
        sa.Column('drop_lat', sa.Float(), nullable=False),
        sa.Column('drop_lon', sa.Float(), nullable=False),
        sa.Column('drop_label', sa.String(length=200), nullable=True),
        sa.Column('distance_km', sa.Float(), nullable=False),
        sa.Column('estimated_fare', sa.Float(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default=sa.text("'REQUESTED'")),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['driver_id'], ['drivers.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ride_bookings_status'), 'ride_bookings', ['status'], unique=False)
    op.create_index(op.f('ix_ride_bookings_user_id'), 'ride_bookings', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_ride_bookings_user_id'), table_name='ride_bookings')
    op.drop_index(op.f('ix_ride_bookings_status'), table_name='ride_bookings')
    op.drop_table('ride_bookings')
    op.drop_table('drivers')