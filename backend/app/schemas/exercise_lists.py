from datetime import datetime
from app.schemas.base import CamelModel


class ExerciseListCreate(CamelModel):
    title: str
    description: str


class ExerciseListResponse(CamelModel):
    id: int
    teacher_id: int
    title: str
    description: str
    created_at: datetime
    updated_at: datetime
