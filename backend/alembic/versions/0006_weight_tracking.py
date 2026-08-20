"""add weight_entries table and target_weight_kg on users

Revision ID: 0006_weight_tracking
Revises: 0005_user_onboarding
Create Date: 2026-08-19
"""

import sqlalchemy as sa
from alembic import op

revision = "0006_weight_tracking"
down_revision = "0005_user_onboarding"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("target_weight_kg", sa.Float(), nullable=True))

    op.create_table(
        "weight_entries",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "user_id",
            sa.Uuid(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("weight_kg", sa.Float(), nullable=False),
        sa.Column("logged_date", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("user_id", "logged_date", name="uq_weight_entries_user_date"),
    )
    op.create_index("ix_weight_entries_user_id", "weight_entries", ["user_id"])
    op.create_index("ix_weight_entries_logged_date", "weight_entries", ["logged_date"])


def downgrade() -> None:
    op.drop_index("ix_weight_entries_logged_date", table_name="weight_entries")
    op.drop_index("ix_weight_entries_user_id", table_name="weight_entries")
    op.drop_table("weight_entries")
    op.drop_column("users", "target_weight_kg")
