import uuid
from datetime import datetime, UTC

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import Gym
from schemas import GymCreate, GymUpdate


async def list_gyms(user_id: uuid.UUID, db: AsyncSession) -> list[Gym]:
    result = await db.execute(
        select(Gym).where(Gym.user_id == user_id, Gym.deleted_at.is_(None))
    )
    return list(result.scalars().all())


async def create_gym(user_id: uuid.UUID, data: GymCreate, db: AsyncSession) -> Gym:
    gym = Gym(id=uuid.uuid4(), user_id=user_id, **data.model_dump())
    db.add(gym)
    await db.commit()
    await db.refresh(gym)
    return gym


async def get_gym(gym_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession) -> Gym | None:
    result = await db.execute(
        select(Gym).where(Gym.id == gym_id, Gym.user_id == user_id, Gym.deleted_at.is_(None))
    )
    return result.scalar_one_or_none()


async def update_gym(gym_id: uuid.UUID, user_id: uuid.UUID, data: GymUpdate, db: AsyncSession) -> Gym | None:
    gym = await get_gym(gym_id, user_id, db)
    if not gym:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(gym, field, value)
    await db.commit()
    await db.refresh(gym)
    return gym


async def delete_gym(gym_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession) -> bool:
    gym = await get_gym(gym_id, user_id, db)
    if not gym:
        return False
    gym.deleted_at = datetime.now(UTC)
    await db.commit()
    return True
