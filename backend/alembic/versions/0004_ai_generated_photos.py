"""add AI-generated meal photo fields and cache table

Revision ID: 0004_ai_generated_photos
Revises: 0003_meal_photo_key
Create Date: 2026-08-01
"""

import sqlalchemy as sa
from alembic import op

revision = "0004_ai_generated_photos"
down_revision = "0003_meal_photo_key"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("meals", sa.Column("generated_photo_url", sa.String(500), nullable=True))
    op.add_column(
        "meals",
        sa.Column("photo_status", sa.String(20), nullable=False, server_default="disabled"),
    )

    op.create_table(
        "generated_meal_photos",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("food_key", sa.String(255), nullable=False),
        sa.Column("image_url", sa.String(500), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index(
        "ix_generated_meal_photos_food_key",
        "generated_meal_photos",
        ["food_key"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("ix_generated_meal_photos_food_key", table_name="generated_meal_photos")
    op.drop_table("generated_meal_photos")
    op.drop_column("meals", "photo_status")
    op.drop_column("meals", "generated_photo_url")
