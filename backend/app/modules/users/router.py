from fastapi import APIRouter

from app.core.dependencies import SessionDep, CurrentUserIdDep
from app.modules.users.service import get_user_by_id, update_user, list_users
from app.schemas.users import UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
async def list_users_endpoint(user_id: CurrentUserIdDep, session: SessionDep):
    return await list_users(user_id, session)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_user_id: CurrentUserIdDep, session: SessionDep):
    return await get_user_by_id(user_id, session)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user_endpoint(
    user_id: str, data: UserUpdate, current_user_id: CurrentUserIdDep, session: SessionDep
):
    return await update_user(user_id, current_user_id, data, session)
