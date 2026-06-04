import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import Exercise
from schemas import ExerciseCreate


async def list_exercises(user_id: uuid.UUID, muscle_group: str | None, db: AsyncSession) -> list[Exercise]:
    query = select(Exercise).where(Exercise.user_id == user_id).order_by(Exercise.name)
    if muscle_group:
        query = query.where(Exercise.muscle_group == muscle_group)
    result = await db.execute(query)
    return list(result.scalars().all())


async def create_exercise(user_id: uuid.UUID, data: ExerciseCreate, db: AsyncSession) -> Exercise:
    exercise = Exercise(id=uuid.uuid4(), user_id=user_id, **data.model_dump())
    db.add(exercise)
    await db.commit()
    await db.refresh(exercise)
    return exercise


async def get_exercise(exercise_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession) -> Exercise | None:
    result = await db.execute(
        select(Exercise).where(Exercise.id == exercise_id, Exercise.user_id == user_id)
    )
    return result.scalar_one_or_none()
