import uuid
from datetime import datetime

from pydantic import BaseModel


class GymCreate(BaseModel):
    name: str
    location: str
    notes: str | None = None


class GymUpdate(BaseModel):
    name: str | None = None
    location: str | None = None
    notes: str | None = None


class GymResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    location: str
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
