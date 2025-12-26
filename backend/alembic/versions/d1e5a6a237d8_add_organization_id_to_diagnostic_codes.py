"""add_organization_id_to_diagnostic_codes

Revision ID: d1e5a6a237d8
Revises: 009
Create Date: 2025-12-24 08:54:31.437923

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd1e5a6a237d8'
down_revision: Union[str, None] = '009'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add organization_id column to diagnostic_codes table
    op.add_column('diagnostic_codes', sa.Column('organization_id', sa.Integer(), nullable=True))
    
    # Add extra_data column (JSON field for flexible metadata)
    op.add_column('diagnostic_codes', sa.Column('extra_data', sa.JSON(), nullable=True))
    
    # Set a default organization_id for existing records (assuming organization with id=1 exists)
    op.execute('UPDATE diagnostic_codes SET organization_id = 1 WHERE organization_id IS NULL')
    
    # Make the column NOT NULL after setting default values
    op.alter_column('diagnostic_codes', 'organization_id', nullable=False)
    
    # Add foreign key constraint
    op.create_foreign_key('fk_diagnostic_codes_organization_id', 'diagnostic_codes', 'organizations', ['organization_id'], ['id'])
    
    # Add index for better query performance
    op.create_index('ix_diagnostic_codes_organization_id', 'diagnostic_codes', ['organization_id'])
    
    # Drop old unique constraint if exists
    op.execute('ALTER TABLE diagnostic_codes DROP CONSTRAINT IF EXISTS uq_code')
    
    # Add new unique constraint for code + organization_id
    op.create_unique_constraint('uq_code_organization', 'diagnostic_codes', ['code', 'organization_id'])


def downgrade() -> None:
    # Remove unique constraint
    op.drop_constraint('uq_code_organization', 'diagnostic_codes', type_='unique')
    
    # Remove index
    op.drop_index('ix_diagnostic_codes_organization_id', 'diagnostic_codes')
    
    # Remove foreign key
    op.drop_constraint('fk_diagnostic_codes_organization_id', 'diagnostic_codes', type_='foreignkey')
    
    # Remove columns
    op.drop_column('diagnostic_codes', 'organization_id')
    op.drop_column('diagnostic_codes', 'extra_data')
