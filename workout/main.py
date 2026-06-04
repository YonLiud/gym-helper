import os
import uuid
from contextlib import asynccontextmanager

import asyncpg
from fastapi import Depends, FastAPI, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database import Base, engine, get_db
from schemas import SetCreate, SetResponse, SetUpdate, WorkoutCreate, WorkoutResponse
from service import add_set, create_workout, delete_set, delete_workout, get_workout, list_workouts, update_set


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


@app.get("/workouts", response_model=list[WorkoutResponse])
async def list_workouts_route(
    gym_id: uuid.UUID | None = None,
    user_id: uuid.UUID = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await list_workouts(user_id, gym_id, db)


@app.post("/workouts", response_model=WorkoutResponse, status_code=201)
async def create_workout_route(
    body: WorkoutCreate,
    user_id: uuid.UUID = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await create_workout(user_id, body, db)


@app.get("/workouts/{workout_id}", response_model=WorkoutResponse)
async def get_workout_route(
    workout_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    workout = await get_workout(workout_id, user_id, db)
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    return workout


@app.delete("/workouts/{workout_id}", status_code=204)
async def delete_workout_route(
    workout_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    if not await delete_workout(workout_id, user_id, db):
        raise HTTPException(status_code=404, detail="Workout not found")


@app.post("/workouts/{workout_id}/sets", response_model=SetResponse, status_code=201)
async def add_set_route(
    workout_id: uuid.UUID,
    body: SetCreate,
    user_id: uuid.UUID = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    s = await add_set(workout_id, user_id, body, db)
    if not s:
        raise HTTPException(status_code=404, detail="Workout not found")
    return s


@app.put("/workouts/{workout_id}/sets/{set_id}", response_model=SetResponse)
async def update_set_route(
    workout_id: uuid.UUID,
    set_id: uuid.UUID,
    body: SetUpdate,
    user_id: uuid.UUID = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    s = await update_set(workout_id, set_id, user_id, body, db)
    if not s:
        raise HTTPException(status_code=404, detail="Not found")
    return s


@app.delete("/workouts/{workout_id}/sets/{set_id}", status_code=204)
async def delete_set_route(
    workout_id: uuid.UUID,
    set_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    if not await delete_set(workout_id, set_id, user_id, db):
        raise HTTPException(status_code=404, detail="Not found")
