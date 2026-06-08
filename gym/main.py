import os
import uuid
from contextlib import asynccontextmanager

import asyncpg
from fastapi import Depends, FastAPI, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database import Base, engine, get_db
from schemas import GymCreate, GymResponse, GymUpdate
from service import create_gym, delete_gym, get_gym, list_gyms, update_gym


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


@app.get("/", response_model=list[GymResponse])
async def list_gyms_route(user_id: uuid.UUID = Depends(get_user_id), db: AsyncSession = Depends(get_db)):
    return await list_gyms(user_id, db)


@app.post("/", response_model=GymResponse, status_code=201)
async def create_gym_route(body: GymCreate, user_id: uuid.UUID = Depends(get_user_id), db: AsyncSession = Depends(get_db)):
    return await create_gym(user_id, body, db)


@app.get("/{gym_id}", response_model=GymResponse)
async def get_gym_route(gym_id: uuid.UUID, user_id: uuid.UUID = Depends(get_user_id), db: AsyncSession = Depends(get_db)):
    gym = await get_gym(gym_id, user_id, db)
    if not gym:
        raise HTTPException(status_code=404, detail="Gym not found")
    return gym


@app.put("/{gym_id}", response_model=GymResponse)
async def update_gym_route(gym_id: uuid.UUID, body: GymUpdate, user_id: uuid.UUID = Depends(get_user_id), db: AsyncSession = Depends(get_db)):
    gym = await update_gym(gym_id, user_id, body, db)
    if not gym:
        raise HTTPException(status_code=404, detail="Gym not found")
    return gym


@app.delete("/{gym_id}", status_code=204)
async def delete_gym_route(gym_id: uuid.UUID, user_id: uuid.UUID = Depends(get_user_id), db: AsyncSession = Depends(get_db)):
    if not await delete_gym(gym_id, user_id, db):
        raise HTTPException(status_code=404, detail="Gym not found")
