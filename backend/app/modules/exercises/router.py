from fastapi import APIRouter

from app.core.dependencies import SessionDep, CurrentUserIdDep
from app.modules.exercises.service import (
    create_exercise, get_exercise, list_exercises,
    update_exercise, delete_exercise, add_test_case, delete_test_case
)
from app.schemas.exercises import ExerciseCreate, ExerciseUpdate, ExerciseResponse, TestCaseCreate, TestCaseResponse

router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.post("", response_model=ExerciseResponse, status_code=201)
async def create_exercise_endpoint(data: ExerciseCreate, user_id: CurrentUserIdDep, session: SessionDep):
    return await create_exercise(data, user_id, session)


@router.get("", response_model=list[ExerciseResponse])
async def list_exercises_endpoint(user_id: CurrentUserIdDep, session: SessionDep):
    return await list_exercises(user_id, session)


@router.get("/{exercise_id}", response_model=ExerciseResponse)
async def get_exercise_endpoint(exercise_id: str, user_id: CurrentUserIdDep, session: SessionDep):
    return await get_exercise(exercise_id, session)


@router.patch("/{exercise_id}", response_model=ExerciseResponse)
async def update_exercise_endpoint(exercise_id: str, data: ExerciseUpdate, user_id: CurrentUserIdDep, session: SessionDep):
    return await update_exercise(exercise_id, user_id, data, session)


@router.delete("/{exercise_id}", status_code=204)
async def delete_exercise_endpoint(exercise_id: str, user_id: CurrentUserIdDep, session: SessionDep):
    await delete_exercise(exercise_id, user_id, session)


@router.post("/{exercise_id}/test-cases", response_model=TestCaseResponse, status_code=201)
async def add_test_case_endpoint(exercise_id: str, data: TestCaseCreate, user_id: CurrentUserIdDep, session: SessionDep):
    return await add_test_case(exercise_id, data, user_id, session)


@router.delete("/{exercise_id}/test-cases/{tc_id}", status_code=204)
async def delete_test_case_endpoint(exercise_id: str, tc_id: str, user_id: CurrentUserIdDep, session: SessionDep):
    await delete_test_case(exercise_id, tc_id, user_id, session)
