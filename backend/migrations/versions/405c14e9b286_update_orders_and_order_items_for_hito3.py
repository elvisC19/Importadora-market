"""update orders and order_items for hito3

Revision ID: 405c14e9b286
Revises: d49909d5dc94
Create Date: 2026-05-30 21:08:26.258853

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '405c14e9b286'
down_revision: Union[str, Sequence[str], None] = 'd49909d5dc94'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: rebuild orders and order_items with new column names."""
    # Drop old tables (order_items first due to FK dependency)
    op.drop_table('order_items')
    op.drop_table('orders')

    # Recreate orders with Hito 3 schema
    op.create_table(
        'orders',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('order_date', sa.DateTime(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending',
                  comment='pending | confirmed | processing | shipped | delivered | cancelled'),
        sa.Column('total_amount', sa.Float(), nullable=False),
        sa.Column('shipping_address', sa.String(length=500), nullable=False),
        sa.Column('phone', sa.String(length=50), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    # Recreate order_items with Hito 3 schema
    op.create_table(
        'order_items',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('unit_price', sa.Float(), nullable=False),
        sa.Column('subtotal', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    """Downgrade schema: restore original orders and order_items."""
    op.drop_table('order_items')
    op.drop_table('orders')

    # Restore original orders table
    op.create_table(
        'orders',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('usuario_id', sa.Integer(), nullable=False),
        sa.Column('tipo_venta', sa.String(length=50), nullable=False),
        sa.Column('metodo_pago', sa.String(length=100), nullable=False),
        sa.Column('estado', sa.String(length=50), nullable=False),
        sa.Column('total', sa.Float(), nullable=False),
        sa.Column('shipping_address', sa.String(length=500), nullable=False),
        sa.Column('phone', sa.String(length=50), nullable=False),
        sa.Column('order_date', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['usuario_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    # Restore original order_items table
    op.create_table(
        'order_items',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('pedido_id', sa.Integer(), nullable=False),
        sa.Column('producto_id', sa.Integer(), nullable=False),
        sa.Column('cantidad', sa.Integer(), nullable=False),
        sa.Column('unit_price', sa.Float(), nullable=False),
        sa.Column('subtotal', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['pedido_id'], ['orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['producto_id'], ['products.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
