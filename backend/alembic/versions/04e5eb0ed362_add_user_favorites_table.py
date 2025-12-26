"""add_user_favorites_table

Revision ID: 04e5eb0ed362
Revises: 3caf317c8ccb
Create Date: 2025-12-25 11:10:49.399996

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '04e5eb0ed362'
down_revision: Union[str, None] = '3caf317c8ccb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create user_favorites junction table for many-to-many relationship
    op.create_table(
        'user_favorites',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('diagnostic_code_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['diagnostic_code_id'], ['diagnostic_codes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'diagnostic_code_id', name='uq_user_favorite')
    )
    
    # Create indexes for fast lookups
    op.create_index('idx_user_favorites_user_id', 'user_favorites', ['user_id'])
    op.create_index('idx_user_favorites_code_id', 'user_favorites', ['diagnostic_code_id'])


def downgrade() -> None:
    op.drop_index('idx_user_favorites_code_id')
    op.drop_index('idx_user_favorites_user_id')
    op.drop_table('user_favorites')
