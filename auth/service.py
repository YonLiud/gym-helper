import os
import uuid
from datetime import datetime, timedelta, UTC

import bcrypt
from jose import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import User

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24


async def register_user(username: str, password: str, db: AsyncSession) -> User | None:
    username = username.lower()
    result = await db.execute(select(User).where(User.username == username))
    if result.scalar_one_or_none():
        return None
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = User(id=uuid.uuid4(), username=username, password_hash=password_hash)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def authenticate_user(username: str, password: str, db: AsyncSession) -> User | None:
    username = username.lower()
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user or not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        return None
    return user


def create_token(user_id: str, username: str) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": user_id, "username": username, "exp": expire},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )
