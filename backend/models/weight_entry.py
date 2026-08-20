import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class WeightEntry(Base):
    __tablename__ = "weight_entries"
    __table_args__ = (
        # One entry per calendar day — logging again today updates that
        # day's value instead of creating a duplicate point on the chart.
        UniqueConstraint("user_id", "logged_date", name="uq_weight_entries_user_date"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    weight_kg: Mapped[float]
    logged_date: Mapped[date] = mapped_column(Date, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
