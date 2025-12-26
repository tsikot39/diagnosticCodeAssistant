"""
Alembic migration: Add organizations for multi-tenancy.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '009'
down_revision = '008'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Organizations table already exists from migration 000
    # Just add additional fields if needed
    
    # Create a default organization if it doesn't exist
    op.execute("""
        INSERT INTO organizations (id, name, description, is_active, max_codes, created_at, updated_at)
        VALUES (1, 'Default Organization', 'Default organization for existing data', true, 100000, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
    """)
    
    # Add organization_id to users table
    op.add_column('users', sa.Column('organization_id', sa.Integer(), nullable=True))
    op.create_index('ix_users_organization_id', 'users', ['organization_id'])
    
    # Set all existing users to default organization
    op.execute("UPDATE users SET organization_id = 1 WHERE organization_id IS NULL")
    
    # Make organization_id non-nullable after setting defaults
    op.alter_column('users', 'organization_id', nullable=False)
    op.create_foreign_key('fk_users_organization', 'users', 'organizations', ['organization_id'], ['id'])
    
    # diagnostic_codes already has organization_id from migration 000
    # Just ensure data is set for default organization
    op.execute("UPDATE diagnostic_codes SET organization_id = 1 WHERE organization_id IS NULL OR organization_id = 0")


def downgrade() -> None:
    # Remove foreign keys and organization_id columns
    op.drop_constraint('fk_users_organization', 'users', type_='foreignkey')
    op.drop_index('ix_users_organization_id', table_name='users')
    op.drop_column('users', 'organization_id')
    op.drop_index('ix_organizations_slug', table_name='organizations')
    op.drop_index('ix_organizations_name', table_name='organizations')
    op.drop_table('organizations')
