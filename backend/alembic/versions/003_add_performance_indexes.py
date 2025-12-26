"""Add indexes for performance optimization

Revision ID: 003
Revises: 002
Create Date: 2024-12-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add performance indexes."""
    # Add indexes for diagnostic_codes table
    op.create_index('ix_diagnostic_codes_code_lower', 'diagnostic_codes', [sa.text('lower(code)')])
    op.create_index('ix_diagnostic_codes_description_lower', 'diagnostic_codes', [sa.text('lower(description)')])
    op.create_index('ix_diagnostic_codes_category_severity', 'diagnostic_codes', ['category', 'severity'])
    op.create_index('ix_diagnostic_codes_is_active_category', 'diagnostic_codes', ['is_active', 'category'])
    
    # Composite index for common query patterns
    op.create_index('ix_diagnostic_codes_active_category_severity', 'diagnostic_codes', 
                   ['is_active', 'category', 'severity'])


def downgrade() -> None:
    """Remove performance indexes."""
    op.drop_index('ix_diagnostic_codes_active_category_severity', table_name='diagnostic_codes')
    op.drop_index('ix_diagnostic_codes_is_active_category', table_name='diagnostic_codes')
    op.drop_index('ix_diagnostic_codes_category_severity', table_name='diagnostic_codes')
    op.drop_index('ix_diagnostic_codes_description_lower', table_name='diagnostic_codes')
    op.drop_index('ix_diagnostic_codes_code_lower', table_name='diagnostic_codes')
