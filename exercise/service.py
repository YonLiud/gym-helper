import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import Exercise
from schemas import ExerciseCreate

_DEFAULTS: list[tuple[str, str, str]] = [
    # Chest
    ("Bench Press",           "chest",     "barbell"),
    ("Incline Bench Press",   "chest",     "barbell"),
    ("Dumbbell Fly",          "chest",     "dumbbell"),
    ("Push-up",               "chest",     "bodyweight"),
    ("Cable Crossover",       "chest",     "cable"),
    # Back
    ("Deadlift",              "back",      "barbell"),
    ("Pull-up",               "back",      "bodyweight"),
    ("Barbell Row",           "back",      "barbell"),
    ("Lat Pulldown",          "back",      "cable"),
    ("Seated Cable Row",      "back",      "cable"),
    ("Face Pull",             "back",      "cable"),
    ("Dumbbell Row",          "back",      "dumbbell"),
    # Shoulders
    ("Overhead Press",        "shoulders", "barbell"),
    ("Dumbbell Shoulder Press", "shoulders", "dumbbell"),
    ("Lateral Raise",         "shoulders", "dumbbell"),
    ("Front Raise",           "shoulders", "dumbbell"),
    ("Rear Delt Fly",         "shoulders", "dumbbell"),
    # Legs
    ("Squat",                 "legs",      "barbell"),
    ("Romanian Deadlift",     "legs",      "barbell"),
    ("Leg Press",             "legs",      "machine"),
    ("Leg Curl",              "legs",      "machine"),
    ("Leg Extension",         "legs",      "machine"),
    ("Calf Raise",            "legs",      "machine"),
    ("Bulgarian Split Squat", "legs",      "barbell"),
    # Biceps
    ("Barbell Curl",          "biceps",    "barbell"),
    ("Dumbbell Curl",         "biceps",    "dumbbell"),
    ("Hammer Curl",           "biceps",    "dumbbell"),
    ("Preacher Curl",         "biceps",    "barbell"),
    ("Cable Curl",            "biceps",    "cable"),
    # Triceps
    ("Tricep Pushdown",       "triceps",   "cable"),
    ("Skull Crusher",         "triceps",   "barbell"),
    ("Overhead Tricep Extension", "triceps", "cable"),
    ("Dips",                  "triceps",   "bodyweight"),
    ("Close Grip Bench Press","triceps",   "barbell"),
    # Core
    ("Plank",                 "core",      "bodyweight"),
    ("Crunches",              "core",      "bodyweight"),
    ("Hanging Leg Raise",     "core",      "bodyweight"),
    ("Cable Crunch",          "core",      "cable"),
    ("Russian Twist",         "core",      "bodyweight"),
]


async def list_exercises(user_id: uuid.UUID, muscle_group: str | None, db: AsyncSession) -> list[Exercise]:
    query = select(Exercise).where(Exercise.user_id == user_id).order_by(Exercise.name)
    if muscle_group:
        query = query.where(Exercise.muscle_group == muscle_group)
    result = await db.execute(query)
    return list(result.scalars().all())


async def create_exercise(user_id: uuid.UUID, data: ExerciseCreate, db: AsyncSession) -> Exercise | None:
    existing = await db.execute(
        select(Exercise).where(
            Exercise.user_id == user_id,
            Exercise.name.ilike(data.name.strip()),
        )
    )
    if existing.scalar_one_or_none():
        return None
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


async def delete_exercise(exercise_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession) -> bool:
    exercise = await get_exercise(exercise_id, user_id, db)
    if not exercise:
        return False
    await db.delete(exercise)
    await db.commit()
    return True


async def seed_defaults(user_id: uuid.UUID, db: AsyncSession) -> list[Exercise]:
    existing = await list_exercises(user_id, None, db)
    existing_names = {e.name.lower() for e in existing}
    for name, muscle_group, equipment_type in _DEFAULTS:
        if name.lower() not in existing_names:
            db.add(Exercise(
                id=uuid.uuid4(),
                user_id=user_id,
                name=name,
                muscle_group=muscle_group,
                equipment_type=equipment_type,
            ))
    await db.commit()
    return await list_exercises(user_id, None, db)
