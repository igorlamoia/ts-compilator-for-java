from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.class_exercise_list import ClassExerciseList
from app.models.exercise_list import ExerciseList
from app.models.exercise_list_item import ExerciseListItem
from app.models.submission import Submission


async def list_exercise_lists(teacher_id: int, session: AsyncSession) -> list[ExerciseList]:
    result = await session.execute(
        select(ExerciseList)
        .where(ExerciseList.teacher_id == teacher_id)
        .options(
            selectinload(ExerciseList.items).selectinload(ExerciseListItem.exercise),
            selectinload(ExerciseList.classes),
        )
    )
    return list(result.scalars().all())


async def create_exercise_list(
    teacher_id: int, title: str, description: str | None, session: AsyncSession
) -> ExerciseList:
    el = ExerciseList(
        teacher_id=teacher_id,
        title=title,
        description=description,
    )
    session.add(el)
    await session.flush()
    return await get_exercise_list(el.id, session)


async def get_exercise_list(list_id: int, session: AsyncSession, caller_id: int | None = None) -> ExerciseList:
    result = await session.execute(
        select(ExerciseList)
        .where(ExerciseList.id == list_id)
        .options(
            selectinload(ExerciseList.items).selectinload(ExerciseListItem.exercise),
            selectinload(ExerciseList.classes),
        )
    )
    el = result.scalar_one_or_none()
    if not el:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exercise list not found")

    if caller_id is not None:
        is_owner = el.teacher_id == caller_id
        is_published = len(el.classes) > 0
        if not is_owner and not is_published:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    return el


async def get_submitted_exercise_ids(
    list_id: int, class_id: int, student_id: int, session: AsyncSession
) -> list[int]:
    result = await session.execute(
        select(Submission.exercise_id)
        .where(
            Submission.exercise_list_id == list_id,
            Submission.class_id == class_id,
            Submission.student_id == student_id,
        )
    )
    return list(result.scalars().all())


async def add_exercise_to_list(
    list_id: int,
    exercise_id: int,
    grade_weight: float,
    order_index: int,
    caller_id: int,
    session: AsyncSession,
) -> ExerciseListItem:
    el = await get_exercise_list(list_id, session)
    if el.teacher_id != caller_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    item = ExerciseListItem(
        exercise_list_id=list_id,
        exercise_id=exercise_id,
        grade_weight=grade_weight,
        order_index=order_index,
    )
    session.add(item)
    await session.flush()
    await session.refresh(item, attribute_names=["exercise"])
    return item


async def remove_exercise_from_list(
    list_id: int, exercise_id: int, caller_id: int, session: AsyncSession
) -> None:
    el = await get_exercise_list(list_id, session)
    if el.teacher_id != caller_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    result = await session.execute(
        select(ExerciseListItem).where(
            ExerciseListItem.exercise_list_id == list_id,
            ExerciseListItem.exercise_id == exercise_id,
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found in list")

    await session.delete(item)
    await session.flush()


async def publish_exercise_list(
    list_id: int,
    class_id: int,
    total_grade: float,
    min_required: float,
    deadline: datetime,
    caller_id: int,
    session: AsyncSession,
) -> ClassExerciseList:
    el = await get_exercise_list(list_id, session)
    if el.teacher_id != caller_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    # Normalize to naive UTC (PostgreSQL TIMESTAMP WITHOUT TIME ZONE)
    if deadline.tzinfo is not None:
        deadline = deadline.astimezone(timezone.utc).replace(tzinfo=None)

    # Upsert: check if publication already exists
    result = await session.execute(
        select(ClassExerciseList).where(
            ClassExerciseList.exercise_list_id == list_id,
            ClassExerciseList.class_id == class_id,
        )
    )
    cel = result.scalar_one_or_none()

    if cel:
        cel.total_grade = total_grade
        cel.min_required = min_required
        cel.deadline = deadline
    else:
        cel = ClassExerciseList(
            exercise_list_id=list_id,
            class_id=class_id,
            total_grade=total_grade,
            min_required=min_required,
            deadline=deadline,
        )
        session.add(cel)

    await session.flush()
    return cel
