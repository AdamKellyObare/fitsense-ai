import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class GeneratedMealPhoto(Base):
    __tablename__ = "generated_meal_photos"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    # Exact-match cache key: normalized food text (see
    # services/photo_generator.normalize_food_key). Two meals with the same
    # normalized description reuse this row instead of paying for a second
    # generation.
    food_key: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    image_url: Mapped[str] = mapped_column(String(500))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
