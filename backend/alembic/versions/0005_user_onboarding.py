"""add has_onboarded flag to users

Revision ID: 0005_user_onboarding
Revises: 0004_ai_generated_photos
Create Date: 2026-08-05
"""

import sqlalchemy as sa
from alembic import op

revision = "0005_user_onboarding"
down_revision = "0004_ai_generated_photos"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # server_default backfills every existing row to true — current users
    # must never see onboarding just because this column was added. New
    # registrations get false via the model's Python-level default instead.
    op.add_column(
        "users",
        sa.Column("has_onboarded", sa.Boolean(), nullable=False, server_default="true"),
    )


def downgrade() -> None:
    op.drop_column("users", "has_onboarded")
