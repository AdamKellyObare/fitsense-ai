from __future__ import annotations

import uuid
from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.deps import get_current_user, require_csrf
from db.session import get_db
from models.user import User
from models.weight_entry import WeightEntry
from schemas.weight_entry import WeightEntryCreate, WeightEntryPublic

router = APIRouter(prefix="/weight-entries", tags=["weight"])


@router.post("", response_model=WeightEntryPublic)
async def log_weight(
    payload: WeightEntryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_csrf),
) -> WeightEntry:
    logged_date = payload.logged_date or date.today()

    existing = await db.scalar(
        select(WeightEntry).where(
            WeightEntry.user_id == current_user.id,
            WeightEntry.logged_date == logged_date,
        )
    )

    if existing is not None:
        existing.weight_kg = payload.weight_kg
        entry = existing
    else:
        entry = WeightEntry(user_id=current_user.id, weight_kg=payload.weight_kg, logged_date=logged_date)
        db.add(entry)

    await db.commit()
    await db.refresh(entry)
    return entry


@router.get("", response_model=List[WeightEntryPublic])
async def get_weight_entries(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[WeightEntry]:
    result = await db.scalars(
        select(WeightEntry)
        .where(WeightEntry.user_id == current_user.id)
        .order_by(WeightEntry.logged_date.asc())
    )
    return list(result)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
async def delete_weight_entry(
    entry_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_csrf),
) -> None:
    entry = await db.get(WeightEntry, entry_id)
    if entry is None or entry.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Weight entry not found")

    await db.delete(entry)
    await db.commit()
