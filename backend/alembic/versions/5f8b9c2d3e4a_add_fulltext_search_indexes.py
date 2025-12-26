"""add_fulltext_search_indexes

Revision ID: 5f8b9c2d3e4a
Revises: 04e5eb0ed362
Create Date: 2025-12-25 12:02:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5f8b9c2d3e4a'
down_revision: Union[str, None] = '04e5eb0ed362'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add tsvector column for full-text search on description
    op.add_column('diagnostic_codes', 
                  sa.Column('description_tsv', sa.dialects.postgresql.TSVECTOR(), nullable=True))
    
    # Create GIN index for full-text search performance
    op.create_index('idx_diagnostic_codes_description_tsv', 
                    'diagnostic_codes', 
                    ['description_tsv'], 
                    postgresql_using='gin')
    
    # Update existing rows with tsvector data
    op.execute("""
        UPDATE diagnostic_codes 
        SET description_tsv = to_tsvector('english', COALESCE(description, ''))
    """)
    
    # Create trigger to automatically update tsvector on insert/update
    op.execute("""
        CREATE TRIGGER tsvector_update_diagnostic_codes 
        BEFORE INSERT OR UPDATE ON diagnostic_codes
        FOR EACH ROW EXECUTE FUNCTION 
        tsvector_update_trigger(description_tsv, 'pg_catalog.english', description)
    """)
    
    # Add composite index for common search patterns (code + category) if not exists
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_diagnostic_codes_code_category 
        ON diagnostic_codes (code, category)
    """)


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_diagnostic_codes_code_category")
    op.execute("DROP TRIGGER IF EXISTS tsvector_update_diagnostic_codes ON diagnostic_codes")
    op.drop_index('idx_diagnostic_codes_description_tsv', postgresql_using='gin')
    op.drop_column('diagnostic_codes', 'description_tsv')
