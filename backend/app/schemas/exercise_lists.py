from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ExerciseListCreate(BaseModel):
    title: str
    description: str


class ExerciseListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    teacher_id: str
    title: str
    description: str
    created_at: datetime
    updated_at: datetime
