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
