from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.submission import SubmissionStatus


class SubmissionCreate(BaseModel):
    exercise_id: int
    exercise_list_id: int
    class_id: int
    code_snapshot: str
    status: SubmissionStatus = SubmissionStatus.SUBMITTED


class SubmissionGrade(BaseModel):
    score: float
    teacher_feedback: str | None = None


class SubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    exercise_id: int
    exercise_list_id: int
    class_id: int
    student_id: int
    code_snapshot: str
    status: SubmissionStatus
    score: float | None = None
    teacher_feedback: str | None = None
    submitted_at: datetime
