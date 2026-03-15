from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from pydantic import BaseModel

from app.models.class_ import Class
from app.models.class_member import ClassMember
from app.models.user import User, UserRole
from app.schemas.classes import ClassCreate, ClassUpdate


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


async def get_class(class_id: str, session: AsyncSession) -> Class:
    cls = await session.get(Class, class_id)
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    return cls


class JoinClassRequest(BaseModel):
    access_code: str


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


async def join_class(class_id: str, access_code: str, student_id: str, session: AsyncSession):
    cls = await get_class(class_id, session)
    if cls.access_code != access_code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid access code")

    # Check if already a member
    existing = await session.execute(
        select(ClassMember).where(
            ClassMember.class_id == class_id,
            ClassMember.student_id == student_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already a member")

    member = ClassMember(class_id=class_id, student_id=student_id)
    session.add(member)
    await session.flush()
    return {"message": "Joined successfully"}
