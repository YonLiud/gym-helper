import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ExerciseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    muscle_group: str | None = Field(default=None, max_length=50)
    equipment_type: str | None = Field(default=None, max_length=50)


class ExerciseResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    muscle_group: str | None
    equipment_type: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
