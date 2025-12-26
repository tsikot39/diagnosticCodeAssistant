"""Create initial diagnostic codes tables

Revision ID: 000
Revises: 
Create Date: 2024-12-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '000'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create initial tables."""
    
    # Create organizations table first (needed for foreign keys)
    op.create_table('organizations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('max_codes', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index('ix_organizations_name', 'organizations', ['name'])
    
    # Create diagnostic_codes table
    op.create_table('diagnostic_codes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('severity', sa.String(length=20), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('extra_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('organization_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code', 'organization_id', name='uq_code_organization')
    )
    op.create_index('ix_diagnostic_codes_code', 'diagnostic_codes', ['code'])
    op.create_index('ix_diagnostic_codes_category', 'diagnostic_codes', ['category'])
    op.create_index('ix_diagnostic_codes_organization_id', 'diagnostic_codes', ['organization_id'])
    

def downgrade() -> None:
    """Drop initial tables."""
    op.drop_index('ix_diagnostic_codes_organization_id', table_name='diagnostic_codes')
    op.drop_index('ix_diagnostic_codes_category', table_name='diagnostic_codes')
    op.drop_index('ix_diagnostic_codes_code', table_name='diagnostic_codes')
    op.drop_table('diagnostic_codes')
    op.drop_index('ix_organizations_name', table_name='organizations')
    op.drop_table('organizations')
