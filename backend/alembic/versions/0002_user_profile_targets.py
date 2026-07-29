"""add sex, activity_level, carb_target, fat_target to users

Revision ID: 0002_user_profile_targets
Revises: 0001_initial
Create Date: 2026-07-28
"""

import sqlalchemy as sa
from alembic import op

revision = "0002_user_profile_targets"
down_revision = "0001_initial"
branch_labels = None
depends_on = None

sex_enum = sa.Enum("male", "female", name="sex")
activity_level_enum = sa.Enum(
    "sedentary", "light", "moderate", "active", "very_active", name="activity_level"
)


def upgrade() -> None:
    sex_enum.create(op.get_bind(), checkfirst=True)
    activity_level_enum.create(op.get_bind(), checkfirst=True)

    op.add_column("users", sa.Column("sex", sex_enum, nullable=True))
    op.add_column(
        "users",
        sa.Column("activity_level", activity_level_enum, nullable=False, server_default="moderate"),
    )
    op.add_column("users", sa.Column("carb_target", sa.Integer(), nullable=False, server_default="200"))
    op.add_column("users", sa.Column("fat_target", sa.Integer(), nullable=False, server_default="65"))


def downgrade() -> None:
    op.drop_column("users", "fat_target")
    op.drop_column("users", "carb_target")
    op.drop_column("users", "activity_level")
    op.drop_column("users", "sex")

    activity_level_enum.drop(op.get_bind(), checkfirst=True)
    sex_enum.drop(op.get_bind(), checkfirst=True)
