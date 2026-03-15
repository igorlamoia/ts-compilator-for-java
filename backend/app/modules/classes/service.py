from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.class_ import Class
from app.models.class_member import ClassMember
from app.models.class_exercise_list import ClassExerciseList
from app.models.exercise_list import ExerciseList
from app.models.exercise_list_item import ExerciseListItem
from app.models.submission import Submission
from app.models.user import User, UserRole
from app.schemas.classes import (
    ClassCreate, ClassUpdate, JoinClassResponse,
    ClassExerciseListWithProgress, ExerciseListBrief, ExerciseItemProgress,
)


async def create_class(data: ClassCreate, current_user_id: str, session: AsyncSession) -> Class:
    current_user = await session.get(User, current_user_id)
    if current_user.role == UserRole.STUDENT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only teachers can create classes")

    # Check duplicate access_code
    existing = await session.execute(select(Class).where(Class.access_code == data.access_code))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Access code already in use")

    new_class = Class(
        organization_id=current_user.organization_id,
        teacher_id=current_user_id,
        name=data.name,
        description=data.description,
        access_code=data.access_code,
    )
    session.add(new_class)
    await session.flush()
    return new_class


async def list_classes(current_user_id: str, session: AsyncSession) -> list[Class]:
    current_user = await session.get(User, current_user_id)
    if current_user.role in (UserRole.ADMIN, UserRole.TEACHER):
        result = await session.execute(
            select(Class).where(Class.teacher_id == current_user_id)
        )
    else:
        result = await session.execute(
            select(Class)
            .join(ClassMember, Class.id == ClassMember.class_id)
            .where(ClassMember.student_id == current_user_id)
        )
    return list(result.scalars().all())


async def get_class(class_id: int, session: AsyncSession) -> Class:
    cls = await session.get(Class, class_id)
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    return cls


async def remove_member(class_id: int, student_id: int, current_user_id: int, session: AsyncSession):
    current_user = await session.get(User, current_user_id)
    if current_user.role == UserRole.STUDENT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only teachers can remove members")

    result = await session.execute(
        select(ClassMember).where(
            ClassMember.class_id == class_id,
            ClassMember.student_id == student_id,
        )
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    await session.delete(member)
    await session.flush()


async def join_class_by_code(access_code: str, current_user_id: int, session: AsyncSession) -> JoinClassResponse:
    # Get current user to check role
    user = await session.get(User, current_user_id)
    if user and user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Apenas estudantes podem entrar em turmas")

    result = await session.execute(
        select(Class).where(Class.access_code == access_code)
    )
    cls = result.scalar_one_or_none()
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Turma não encontrada")

    existing = await session.execute(
        select(ClassMember).where(
            ClassMember.class_id == cls.id,
            ClassMember.student_id == current_user_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Já é membro desta turma")

    member = ClassMember(class_id=cls.id, student_id=current_user_id)
    session.add(member)
    await session.flush()
    return JoinClassResponse(class_id=cls.id)


async def get_class_members(class_id: int, current_user_id: int, session: AsyncSession) -> list[User]:
    cls = await session.get(Class, class_id)
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")

    current_user = await session.get(User, current_user_id)
    if current_user.role != UserRole.ADMIN and cls.teacher_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado")

    result = await session.execute(
        select(User)
        .join(ClassMember, ClassMember.student_id == User.id)
        .where(ClassMember.class_id == class_id)
    )
    return list(result.scalars().all())


async def get_class_exercise_lists(
    class_id: int, current_user_id: int, session: AsyncSession
) -> list[ClassExerciseListWithProgress]:
    cls = await session.get(Class, class_id)
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")

    result = await session.execute(
        select(ClassExerciseList)
        .where(ClassExerciseList.class_id == class_id)
        .options(
            selectinload(ClassExerciseList.exercise_list)
            .selectinload(ExerciseList.items)
            .selectinload(ExerciseListItem.exercise)
        )
    )
    class_exercise_lists = list(result.scalars().all())

    # Get all submissions by this student for this class
    submissions_result = await session.execute(
        select(Submission).where(
            Submission.student_id == current_user_id,
            Submission.class_id == class_id,
        )
    )
    submissions = list(submissions_result.scalars().all())
    submitted_exercise_ids = {s.exercise_id for s in submissions}

    response = []
    for cel in class_exercise_lists:
        el = cel.exercise_list
        items = []
        for item in el.items:
            items.append(ExerciseItemProgress(
                exercise_id=item.exercise_id,
                order_index=item.order_index,
                grade_weight=item.grade_weight,
                exercise={"id": item.exercise.id, "title": item.exercise.title},
                submitted=item.exercise_id in submitted_exercise_ids,
            ))
        completed_count = sum(1 for it in items if it.submitted)
        response.append(ClassExerciseListWithProgress(
            exercise_list_id=cel.exercise_list_id,
            class_id=cel.class_id,
            total_grade=cel.total_grade,
            min_required=cel.min_required,
            deadline=cel.deadline,
            exercise_list=ExerciseListBrief(
                id=el.id,
                title=el.title,
                description=el.description,
                items=items,
            ),
            completed_count=completed_count,
            total_count=len(items),
        ))
    return response
