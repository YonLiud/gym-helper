import uuid
from datetime import datetime, date

from pydantic import BaseModel, Field


class SetCreate(BaseModel):
    exercise_id: uuid.UUID
    order: int = Field(ge=0)
    weight: float | None = Field(default=None, ge=0, le=10000)
    reps: int | None = Field(default=None, ge=0, le=10000)
    notes: str | None = Field(default=None, max_length=200)


class SetUpdate(BaseModel):
    order: int | None = Field(default=None, ge=0)
    weight: float | None = Field(default=None, ge=0, le=10000)
    reps: int | None = Field(default=None, ge=0, le=10000)
    notes: str | None = Field(default=None, max_length=200)


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
    notes: str | None = Field(default=None, max_length=500)


class WorkoutResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    gym_id: uuid.UUID | None
    date: date
    notes: str | None
    created_at: datetime
    sets: list[SetResponse] = []

    model_config = {"from_attributes": True}
