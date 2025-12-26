"""add_audit_logs

Revision ID: e94eb8073562
Revises: 5f8b9c2d3e4a
Create Date: 2025-12-25 14:40:38.128850

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON, ENUM


# revision identifiers, used by Alembic.
revision: str = 'e94eb8073562'
down_revision: Union[str, None] = '5f8b9c2d3e4a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum for audit actions
    audit_action_enum = ENUM(
        'create', 'update', 'delete',
        'bulk_import', 'bulk_export', 'bulk_update', 'bulk_delete',
        name='auditaction',
        create_type=False
    )
    audit_action_enum.create(op.get_bind(), checkfirst=True)
    
    # Create audit_logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('action', audit_action_enum, nullable=False, index=True),
        sa.Column('entity_type', sa.String(50), nullable=False, index=True),
        sa.Column('entity_id', sa.Integer(), nullable=True, index=True),
        sa.Column('old_values', JSON, nullable=True),
        sa.Column('new_values', JSON, nullable=True),
        sa.Column('changes', JSON, nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('request_id', sa.String(100), nullable=True, index=True),
        sa.Column('affected_count', sa.Integer(), default=1),
        sa.Column('created_at', sa.DateTime(), nullable=False, index=True),
    )
    
    # Create indexes for common queries
    op.create_index('idx_audit_logs_user_created', 'audit_logs', ['user_id', 'created_at'])
    op.create_index('idx_audit_logs_entity', 'audit_logs', ['entity_type', 'entity_id'])


def downgrade() -> None:
    op.drop_index('idx_audit_logs_entity')
    op.drop_index('idx_audit_logs_user_created')
    op.drop_table('audit_logs')
    
    # Drop enum
    audit_action_enum = ENUM(name='auditaction')
    audit_action_enum.drop(op.get_bind(), checkfirst=True)
