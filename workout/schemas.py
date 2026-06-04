import uuid
from datetime import datetime, date

from pydantic import BaseModel


class SetCreate(BaseModel):
    exercise_id: uuid.UUID
    order: int
    weight: float | None = None
    reps: int | None = None
    notes: str | None = None


class SetUpdate(BaseModel):
    order: int | None = None
    weight: float | None = None
    reps: int | None = None
    notes: str | None = None


class SetResponse(BaseModel):
    id: uuid.UUID
    workout_id: uuid.UUID
    exercise_id: uuid.UUID
    order: int
    weight: float | None
    reps: int | None
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class WorkoutCreate(BaseModel):
    gym_id: uuid.UUID | None = None
    date: date
    notes: str | None = None


class WorkoutResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    gym_id: uuid.UUID | None
    date: date
    notes: str | None
    created_at: datetime
    sets: list[SetResponse] = []

    model_config = {"from_attributes": True}
