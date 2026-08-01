import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class Meal(Base):
    __tablename__ = "meals"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    food: Mapped[str] = mapped_column(String(255), nullable=False)
    goal: Mapped[str] = mapped_column(String(20), default="maintenance")

    calories: Mapped[Optional[int]]
    protein: Mapped[Optional[int]]
    carbs: Mapped[Optional[int]]
    fat: Mapped[Optional[int]]

    source: Mapped[str] = mapped_column(String(20), default="ai_pending")
    photo_key: Mapped[Optional[str]] = mapped_column(String(40))

    # AI-generated photo (see services/photo_generator.py). photo_key above
    # remains the immediate stock-photo placeholder shown while this is
    # still generating (or if it's disabled/failed) — generated_photo_url is
    # only ever set once a real image is ready.
    generated_photo_url: Mapped[Optional[str]] = mapped_column(String(500))
    photo_status: Mapped[str] = mapped_column(String(20), default="disabled")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
