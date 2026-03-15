from fastapi import APIRouter
from pydantic import BaseModel

from app.core.dependencies import SessionDep, CurrentUserIdDep
from app.modules.classes.service import create_class, list_classes, get_class, join_class
from app.schemas.classes import ClassCreate, ClassResponse

router = APIRouter(prefix="/classes", tags=["classes"])


class JoinRequest(BaseModel):
    access_code: str


@router.post("", response_model=ClassResponse, status_code=201)
async def create_class_endpoint(data: ClassCreate, user_id: CurrentUserIdDep, session: SessionDep):
    return await create_class(data, user_id, session)


@router.get("", response_model=list[ClassResponse])
async def list_classes_endpoint(user_id: CurrentUserIdDep, session: SessionDep):
    return await list_classes(user_id, session)


@router.get("/{class_id}", response_model=ClassResponse)
async def get_class_endpoint(class_id: str, user_id: CurrentUserIdDep, session: SessionDep):
    return await get_class(class_id, session)


@router.post("/{class_id}/join")
async def join_class_endpoint(class_id: str, data: JoinRequest, user_id: CurrentUserIdDep, session: SessionDep):
    return await join_class(class_id, data.access_code, user_id, session)
