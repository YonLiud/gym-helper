import os
import uuid
from contextlib import asynccontextmanager

import asyncpg
from fastapi import Depends, FastAPI, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database import Base, engine, get_db
from schemas import ExerciseCreate, ExerciseResponse
from service import create_exercise, delete_exercise, get_exercise, list_exercises, seed_defaults


async def _ensure_database():
    url = os.environ["DATABASE_URL"]
    db_name = url.rsplit("/", 1)[1]
    admin_url = url.rsplit("/", 1)[0] + "/postgres"

    conn = await asyncpg.connect(admin_url)
    try:
        exists = await conn.fetchval("SELECT 1 FROM pg_database WHERE datname = $1", db_name)
        if not exists:
            await conn.execute(f'CREATE DATABASE "{db_name}"')
    finally:
        await conn.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await _ensure_database()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(lifespan=lifespan)


def get_user_id(x_user_id: str = Header()) -> uuid.UUID:
    return uuid.UUID(x_user_id)


@app.get("/", response_model=list[ExerciseResponse])
async def list_exercises_route(
    muscle_group: str | None = None,
    user_id: uuid.UUID = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await list_exercises(user_id, muscle_group, db)


@app.post("/", response_model=ExerciseResponse, status_code=201)
async def create_exercise_route(
    body: ExerciseCreate,
    user_id: uuid.UUID = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    exercise = await create_exercise(user_id, body, db)
    if not exercise:
        raise HTTPException(status_code=409, detail="An exercise with that name already exists")
    return exercise


@app.get("/{exercise_id}", response_model=ExerciseResponse)
async def get_exercise_route(
    exercise_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    exercise = await get_exercise(exercise_id, user_id, db)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return exercise


@app.delete("/{exercise_id}", status_code=204)
async def delete_exercise_route(
    exercise_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    if not await delete_exercise(exercise_id, user_id, db):
        raise HTTPException(status_code=404, detail="Exercise not found")


@app.post("/defaults", response_model=list[ExerciseResponse], status_code=201)
async def seed_defaults_route(
    user_id: uuid.UUID = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await seed_defaults(user_id, db)
