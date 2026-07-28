"""initial schema: users, refresh_tokens, meals

Revision ID: 0001_initial
Revises:
Create Date: 2026-07-28
"""

import sqlalchemy as sa
from alembic import op

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None

goal_enum = sa.Enum("cutting", "maintenance", "bulking", name="goal")


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("email_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("name", sa.String(120), nullable=True),
        sa.Column("age", sa.Integer(), nullable=True),
        sa.Column("height_cm", sa.Float(), nullable=True),
        sa.Column("weight_kg", sa.Float(), nullable=True),
        sa.Column("goal", goal_enum, nullable=False, server_default="maintenance"),
        sa.Column("calorie_target", sa.Integer(), nullable=False, server_default="2000"),
        sa.Column("protein_target", sa.Integer(), nullable=False, server_default="180"),
        sa.Column("water_target_l", sa.Float(), nullable=False, server_default="3.0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "user_id",
            sa.Uuid(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("token_hash", sa.String(255), nullable=False),
        sa.Column("user_agent", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"])
    op.create_index("ix_refresh_tokens_token_hash", "refresh_tokens", ["token_hash"], unique=True)

    op.create_table(
        "meals",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "user_id",
            sa.Uuid(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("food", sa.String(255), nullable=False),
        sa.Column("goal", sa.String(20), nullable=False, server_default="maintenance"),
        sa.Column("calories", sa.Integer(), nullable=True),
        sa.Column("protein", sa.Integer(), nullable=True),
        sa.Column("carbs", sa.Integer(), nullable=True),
        sa.Column("fat", sa.Integer(), nullable=True),
        sa.Column("source", sa.String(20), nullable=False, server_default="ai_pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_meals_user_id", "meals", ["user_id"])
    op.create_index("ix_meals_created_at", "meals", ["created_at"])


def downgrade() -> None:
    op.drop_table("meals")
    op.drop_table("refresh_tokens")
    op.drop_table("users")
    goal_enum.drop(op.get_bind(), checkfirst=True)
