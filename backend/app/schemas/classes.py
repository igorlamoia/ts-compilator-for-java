from datetime import datetime
from app.schemas.base import CamelModel
from app.models.class_ import ClassStatus


class ClassCreate(CamelModel):
    name: str
    description: str
    access_code: str


class ClassUpdate(CamelModel):
    name: str | None = None
    description: str | None = None
    status: ClassStatus | None = None


class ClassResponse(CamelModel):
    id: int
    organization_id: int
    teacher_id: int
    name: str
    description: str
    access_code: str
    created_at: datetime
    status: ClassStatus


class JoinClassRequest(CamelModel):
    access_code: str


class JoinClassResponse(CamelModel):
    class_id: int


class ExerciseItemProgress(CamelModel):
    exercise_id: int
    order_index: int
    grade_weight: float
    exercise: dict  # { id: int, title: str }
    submitted: bool


class ExerciseListBrief(CamelModel):
    id: int
    title: str
    description: str | None
    items: list[ExerciseItemProgress]


class ClassExerciseListWithProgress(CamelModel):
    exercise_list_id: int
    class_id: int
    total_grade: float
    min_required: float
    deadline: datetime
    exercise_list: ExerciseListBrief
    completed_count: int
    total_count: int
