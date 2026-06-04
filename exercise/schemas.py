import uuid
from datetime import datetime

from pydantic import BaseModel


class ExerciseCreate(BaseModel):
    name: str
    muscle_group: str | None = None
    equipment_type: str | None = None


class ExerciseResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    muscle_group: str | None
    equipment_type: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
