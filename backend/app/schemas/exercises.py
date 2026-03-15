from datetime import datetime
from app.schemas.base import CamelModel


class TestCaseCreate(CamelModel):
    label: str = ""
    input: str
    expected_output: str
    order_index: int = 0


class TestCaseResponse(CamelModel):
    id: int
    exercise_id: int
    label: str
    input: str
    expected_output: str
    order_index: int


class ExerciseCreate(CamelModel):
    title: str
    description: str
    attachments: str = ""


class ExerciseUpdate(CamelModel):
    title: str | None = None
    description: str | None = None
    attachments: str | None = None


class ExerciseResponse(CamelModel):
    id: int
    teacher_id: int
    title: str
    description: str
    attachments: str
    created_at: datetime
    updated_at: datetime
    test_cases: list[TestCaseResponse] = []
