"""
Alembic migration: Add version control tables.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '007'
down_revision = '006'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create code_versions table
    op.create_table(
        'code_versions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('diagnostic_code_id', sa.Integer(), nullable=False),
        sa.Column('version_number', sa.Integer(), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('severity', sa.String(length=20), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('change_type', sa.String(length=20), nullable=False),
        sa.Column('change_summary', sa.Text(), nullable=True),
        sa.Column('changed_fields', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['diagnostic_code_id'], ['diagnostic_codes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id']),
    )
    
    # Create indexes for code_versions
    op.create_index('ix_code_versions_diagnostic_code_id', 'code_versions', ['diagnostic_code_id'])
    op.create_index('ix_code_versions_code', 'code_versions', ['code'])
    op.create_index('ix_code_versions_category', 'code_versions', ['category'])
    op.create_index('ix_code_versions_change_type', 'code_versions', ['change_type'])
    op.create_index('ix_code_versions_created_at', 'code_versions', ['created_at'])
    
    # Create code_comments table
    op.create_table(
        'code_comments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('diagnostic_code_id', sa.Integer(), nullable=False),
        sa.Column('version_id', sa.Integer(), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('is_resolved', sa.Boolean(), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['diagnostic_code_id'], ['diagnostic_codes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['version_id'], ['code_versions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id']),
    )
    
    # Create indexes for code_comments
    op.create_index('ix_code_comments_diagnostic_code_id', 'code_comments', ['diagnostic_code_id'])
    op.create_index('ix_code_comments_version_id', 'code_comments', ['version_id'])
    op.create_index('ix_code_comments_created_at', 'code_comments', ['created_at'])
    
    # Add metadata column to diagnostic_codes table
    op.add_column('diagnostic_codes', sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True))


def downgrade() -> None:
    # Drop metadata column from diagnostic_codes
    op.drop_column('diagnostic_codes', 'metadata')
    
    # Drop code_comments table
    op.drop_index('ix_code_comments_created_at', table_name='code_comments')
    op.drop_index('ix_code_comments_version_id', table_name='code_comments')
    op.drop_index('ix_code_comments_diagnostic_code_id', table_name='code_comments')
    op.drop_table('code_comments')
    
    # Drop code_versions table
    op.drop_index('ix_code_versions_created_at', table_name='code_versions')
    op.drop_index('ix_code_versions_change_type', table_name='code_versions')
    op.drop_index('ix_code_versions_category', table_name='code_versions')
    op.drop_index('ix_code_versions_code', table_name='code_versions')
    op.drop_index('ix_code_versions_diagnostic_code_id', table_name='code_versions')
    op.drop_table('code_versions')
