from datetime import datetime
from pydantic import BaseModel, ConfigDict


class TestCaseCreate(BaseModel):
    label: str = ""
    input: str
    expected_output: str
    order_index: int = 0


class TestCaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    exercise_id: str
    label: str
    input: str
    expected_output: str
    order_index: int


class ExerciseCreate(BaseModel):
    title: str
    description: str
    attachments: str = ""


class ExerciseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    attachments: str | None = None


class ExerciseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    teacher_id: str
    title: str
    description: str
    attachments: str
    created_at: datetime
    updated_at: datetime
    test_cases: list[TestCaseResponse] = []
