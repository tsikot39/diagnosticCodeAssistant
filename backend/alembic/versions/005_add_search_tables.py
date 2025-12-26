"""Add search tables

Revision ID: 005
Revises: 004
Create Date: 2024-12-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON


# revision identifiers, used by Alembic.
revision: str = '005'
down_revision: Union[str, None] = '004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create recent_searches and saved_searches tables."""
    # Create recent_searches table
    op.create_table(
        'recent_searches',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('query', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_recent_searches_id', 'recent_searches', ['id'])
    op.create_index('ix_recent_searches_user_id', 'recent_searches', ['user_id'])
    op.create_index('ix_recent_searches_created_at', 'recent_searches', ['created_at'])
    
    # Create saved_searches table
    op.create_table(
        'saved_searches',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('query', sa.String(), nullable=False),
        sa.Column('filters', JSON, nullable=True),
        sa.Column('is_default', sa.Boolean(), default=False, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_saved_searches_id', 'saved_searches', ['id'])
    op.create_index('ix_saved_searches_user_id', 'saved_searches', ['user_id'])


def downgrade() -> None:
    """Drop search tables."""
    op.drop_index('ix_saved_searches_user_id', table_name='saved_searches')
    op.drop_index('ix_saved_searches_id', table_name='saved_searches')
    op.drop_table('saved_searches')
    
    op.drop_index('ix_recent_searches_created_at', table_name='recent_searches')
    op.drop_index('ix_recent_searches_user_id', table_name='recent_searches')
    op.drop_index('ix_recent_searches_id', table_name='recent_searches')
    op.drop_table('recent_searches')
