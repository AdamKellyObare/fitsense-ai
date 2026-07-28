import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class Goal(str, enum.Enum):
    cutting = "cutting"
    maintenance = "maintenance"
    bulking = "bulking"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    email_verified: Mapped[bool] = mapped_column(default=False)

    name: Mapped[Optional[str]] = mapped_column(String(120))
    age: Mapped[Optional[int]]
    height_cm: Mapped[Optional[float]]
    weight_kg: Mapped[Optional[float]]
    goal: Mapped[Goal] = mapped_column(Enum(Goal, name="goal"), default=Goal.maintenance)

    calorie_target: Mapped[int] = mapped_column(default=2000)
    protein_target: Mapped[int] = mapped_column(default=180)
    water_target_l: Mapped[float] = mapped_column(default=3.0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
