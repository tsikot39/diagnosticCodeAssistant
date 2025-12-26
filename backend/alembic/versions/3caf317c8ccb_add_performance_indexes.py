"""add_performance_indexes

Revision ID: 3caf317c8ccb
Revises: d1e5a6a237d8
Create Date: 2025-12-25 10:47:47.995927

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3caf317c8ccb'
down_revision: Union[str, None] = 'd1e5a6a237d8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pg_trgm extension for fuzzy text search (must be first)
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    
    # Diagnostic Codes indexes for faster searches
    op.create_index('idx_diagnostic_codes_code', 'diagnostic_codes', ['code'])
    op.create_index('idx_diagnostic_codes_category', 'diagnostic_codes', ['category'])
    op.create_index('idx_diagnostic_codes_severity', 'diagnostic_codes', ['severity'])
    op.create_index('idx_diagnostic_codes_is_active', 'diagnostic_codes', ['is_active'])
    op.create_index('idx_diagnostic_codes_organization_id', 'diagnostic_codes', ['organization_id'])
    
    # Full-text search index for description (PostgreSQL specific)
    op.execute(
        "CREATE INDEX idx_diagnostic_codes_description_trgm ON diagnostic_codes "
        "USING gin (description gin_trgm_ops)"
    )
    
    # Users indexes
    op.create_index('idx_users_email', 'users', ['email'], unique=True)
    op.create_index('idx_users_username', 'users', ['username'], unique=True)
    op.create_index('idx_users_organization_id', 'users', ['organization_id'])
    
    # Analytics indexes
    op.create_index('idx_analytics_user_id', 'analytics_events', ['user_id'])
    op.create_index('idx_analytics_event_type', 'analytics_events', ['event_type'])
    op.create_index('idx_analytics_created_at', 'analytics_events', ['created_at'])
    
    # Audit logs indexes
    op.create_index('idx_audit_logs_user_id', 'audit_logs', ['user_id'])
    op.create_index('idx_audit_logs_action', 'audit_logs', ['action'])
    op.create_index('idx_audit_logs_created_at', 'audit_logs', ['created_at'])
    
    # Notifications indexes
    op.create_index('idx_notifications_user_id', 'notifications', ['user_id'])
    op.create_index('idx_notifications_is_read', 'notifications', ['is_read'])
    
    # Webhooks indexes
    op.create_index('idx_webhooks_is_active', 'webhooks', ['is_active'])


def downgrade() -> None:
    # Drop all indexes
    op.drop_index('idx_diagnostic_codes_code')
    op.drop_index('idx_diagnostic_codes_category')
    op.drop_index('idx_diagnostic_codes_severity')
    op.drop_index('idx_diagnostic_codes_is_active')
    op.drop_index('idx_diagnostic_codes_organization_id')
    op.drop_index('idx_diagnostic_codes_description_trgm')
    
    op.drop_index('idx_users_email')
    op.drop_index('idx_users_username')
    op.drop_index('idx_users_organization_id')
    
    op.drop_index('idx_analytics_user_id')
    op.drop_index('idx_analytics_event_type')
    op.drop_index('idx_analytics_created_at')
    
    op.drop_index('idx_audit_logs_user_id')
    op.drop_index('idx_audit_logs_action')
    op.drop_index('idx_audit_logs_created_at')
    
    op.drop_index('idx_notifications_user_id')
    op.drop_index('idx_notifications_is_read')
    
    op.drop_index('idx_webhooks_is_active')
