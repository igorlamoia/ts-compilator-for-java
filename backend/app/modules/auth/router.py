from fastapi import APIRouter

from app.core.dependencies import SessionDep, CurrentUserIdDep
from app.modules.auth.service import register_user, login_user, get_current_user
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.users import UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: RegisterRequest, session: SessionDep):
    return await register_user(data, session)


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, session: SessionDep):
    return await login_user(data, session)


@router.get("/me", response_model=UserResponse)
async def me(user_id: CurrentUserIdDep, session: SessionDep):
    return await get_current_user(user_id, session)
