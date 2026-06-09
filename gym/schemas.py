import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class GymCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    location: str = Field(min_length=1, max_length=200)
    notes: str | None = Field(default=None, max_length=500)


class GymUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    location: str | None = Field(default=None, min_length=1, max_length=200)
    notes: str | None = Field(default=None, max_length=500)


class GymResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    location: str
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
