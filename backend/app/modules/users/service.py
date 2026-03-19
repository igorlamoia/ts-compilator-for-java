from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.schemas.users import UserUpdate


async def get_user_by_id(user_id: str, session: AsyncSession) -> User:
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


async def update_user(
    target_id: str,
    current_user_id: str,
    data: UserUpdate,
    session: AsyncSession,
) -> User:
    current_user = await get_user_by_id(current_user_id, session)
    target_user = await get_user_by_id(target_id, session)

    # STUDENT só pode atualizar a si mesmo; ADMIN/TEACHER podem atualizar qualquer um
    if current_user.role == UserRole.STUDENT and current_user_id != target_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(target_user, field, value)

    await session.flush()
    return target_user


async def list_users(current_user_id: str, session: AsyncSession) -> list[User]:
    current_user = await get_user_by_id(current_user_id, session)

    if current_user.role == UserRole.STUDENT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    result = await session.execute(
        select(User).where(User.organization_id == current_user.organization_id)
    )
    return list(result.scalars().all())
