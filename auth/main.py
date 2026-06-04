import os
from contextlib import asynccontextmanager

import asyncpg
from fastapi import Depends, FastAPI, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database import Base, engine, get_db
from schemas import LoginRequest, RegisterRequest, TokenResponse
from service import authenticate_user, create_token, register_user

REGISTER_KEY = os.environ["REGISTER_KEY"]


def verify_register_key(x_register_key: str = Header()):
    if x_register_key != REGISTER_KEY:
        raise HTTPException(status_code=403, detail="Invalid register key")


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


@app.post("/auth/register", response_model=TokenResponse, status_code=201)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db), _: None = Depends(verify_register_key)):
    user = await register_user(req.username, req.password, db)
    if not user:
        raise HTTPException(status_code=409, detail="Username already taken")
    return TokenResponse(access_token=create_token(str(user.id), user.username))


@app.post("/auth/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(req.username, req.password, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return TokenResponse(access_token=create_token(str(user.id), user.username))
