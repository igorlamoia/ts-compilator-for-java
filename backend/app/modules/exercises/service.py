from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from sqlalchemy.orm import selectinload

from app.models.exercise import Exercise
from app.models.test_case import TestCase
from app.models.user import User, UserRole
from app.schemas.exercises import ExerciseCreate, ExerciseUpdate, TestCaseCreate


async def create_exercise(data: ExerciseCreate, current_user_id: str, session: AsyncSession) -> Exercise:
    user = await session.get(User, current_user_id)
    if user.role == UserRole.STUDENT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only teachers can create exercises")

    exercise = Exercise(
        teacher_id=current_user_id,
        title=data.title,
        description=data.description,
        attachments=data.attachments,
    )
    session.add(exercise)
    await session.flush()
    return await get_exercise(exercise.id, session)


async def get_exercise(exercise_id: str, session: AsyncSession) -> Exercise:
    result = await session.execute(
        select(Exercise)
        .where(Exercise.id == exercise_id)
        .options(selectinload(Exercise.test_cases))
    )
    exercise = result.scalar_one_or_none()
    if not exercise:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found")
    return exercise


async def list_exercises(current_user_id: str, session: AsyncSession) -> list[Exercise]:
    result = await session.execute(
        select(Exercise)
        .where(Exercise.teacher_id == current_user_id)
        .options(selectinload(Exercise.test_cases))
    )
    return list(result.scalars().all())


async def update_exercise(
    exercise_id: str, current_user_id: str, data: ExerciseUpdate, session: AsyncSession
) -> Exercise:
    exercise = await get_exercise(exercise_id, session)
    if exercise.teacher_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(exercise, field, value)

    await session.flush()
    return await get_exercise(exercise.id, session)


async def delete_exercise(exercise_id: str, current_user_id: str, session: AsyncSession) -> None:
    exercise = await get_exercise(exercise_id, session)
    if exercise.teacher_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    await session.delete(exercise)
    await session.flush()


async def add_test_case(exercise_id: str, data: TestCaseCreate, current_user_id: str, session: AsyncSession) -> TestCase:
    exercise = await get_exercise(exercise_id, session)
    if exercise.teacher_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    tc = TestCase(
        exercise_id=exercise_id,
        label=data.label,
        input=data.input,
        expected_output=data.expected_output,
        order_index=data.order_index,
    )
    session.add(tc)
    await session.flush()
    return tc


async def delete_test_case(exercise_id: str, tc_id: str, current_user_id: str, session: AsyncSession) -> None:
    exercise = await get_exercise(exercise_id, session)
    if exercise.teacher_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    tc = await session.get(TestCase, tc_id)
    if not tc or tc.exercise_id != exercise_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test case not found")

    await session.delete(tc)
    await session.flush()
