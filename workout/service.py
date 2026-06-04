import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models import Set, Workout
from schemas import SetCreate, SetUpdate, WorkoutCreate


async def list_workouts(user_id: uuid.UUID, gym_id: uuid.UUID | None, db: AsyncSession) -> list[Workout]:
    query = (
        select(Workout)
        .where(Workout.user_id == user_id)
        .options(selectinload(Workout.sets))
        .order_by(Workout.date.desc())
    )
    if gym_id:
        query = query.where(Workout.gym_id == gym_id)
    result = await db.execute(query)
    return list(result.scalars().all())


async def create_workout(user_id: uuid.UUID, data: WorkoutCreate, db: AsyncSession) -> Workout:
    workout = Workout(id=uuid.uuid4(), user_id=user_id, **data.model_dump())
    db.add(workout)
    await db.commit()
    await db.refresh(workout, ["sets"])
    return workout


async def get_workout(workout_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession) -> Workout | None:
    result = await db.execute(
        select(Workout)
        .where(Workout.id == workout_id, Workout.user_id == user_id)
        .options(selectinload(Workout.sets))
    )
    return result.scalar_one_or_none()


async def delete_workout(workout_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession) -> bool:
    workout = await get_workout(workout_id, user_id, db)
    if not workout:
        return False
    await db.delete(workout)
    await db.commit()
    return True


async def add_set(workout_id: uuid.UUID, user_id: uuid.UUID, data: SetCreate, db: AsyncSession) -> Set | None:
    workout = await get_workout(workout_id, user_id, db)
    if not workout:
        return None
    s = Set(id=uuid.uuid4(), workout_id=workout_id, **data.model_dump())
    db.add(s)
    await db.commit()
    await db.refresh(s)
    return s


async def update_set(workout_id: uuid.UUID, set_id: uuid.UUID, user_id: uuid.UUID, data: SetUpdate, db: AsyncSession) -> Set | None:
    workout = await get_workout(workout_id, user_id, db)
    if not workout:
        return None
    result = await db.execute(select(Set).where(Set.id == set_id, Set.workout_id == workout_id))
    s = result.scalar_one_or_none()
    if not s:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(s, field, value)
    await db.commit()
    await db.refresh(s)
    return s


async def delete_set(workout_id: uuid.UUID, set_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession) -> bool:
    workout = await get_workout(workout_id, user_id, db)
    if not workout:
        return False
    result = await db.execute(select(Set).where(Set.id == set_id, Set.workout_id == workout_id))
    s = result.scalar_one_or_none()
    if not s:
        return False
    await db.delete(s)
    await db.commit()
    return True
