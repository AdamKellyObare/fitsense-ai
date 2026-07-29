"""add photo_key to meals

Revision ID: 0003_meal_photo_key
Revises: 0002_user_profile_targets
Create Date: 2026-07-29
"""

import sqlalchemy as sa
from alembic import op

revision = "0003_meal_photo_key"
down_revision = "0002_user_profile_targets"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("meals", sa.Column("photo_key", sa.String(40), nullable=True))


def downgrade() -> None:
    op.drop_column("meals", "photo_key")
