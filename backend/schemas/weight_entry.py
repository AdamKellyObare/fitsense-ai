import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class WeightEntryCreate(BaseModel):
    weight_kg: float = Field(ge=0, le=500)
    # Defaults to today (server-side, in log_weight) when omitted — the
    # client sends a local-calendar-day string here so "today" agrees with
    # however the viewer's timezone already buckets meals/charts elsewhere
    # in the app, rather than trusting the server's own clock/timezone.
    logged_date: Optional[date] = None


class WeightEntryPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    weight_kg: float
    logged_date: date
    created_at: datetime
