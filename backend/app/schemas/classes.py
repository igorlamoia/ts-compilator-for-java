from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.class_ import ClassStatus


class ClassCreate(BaseModel):
    name: str
    description: str
    access_code: str


class ClassUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: ClassStatus | None = None


class ClassResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    teacher_id: int
    name: str
    description: str
    access_code: str
    created_at: datetime
    status: ClassStatus
