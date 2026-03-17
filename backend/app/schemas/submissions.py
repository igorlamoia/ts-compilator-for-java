from datetime import datetime
from app.schemas.base import CamelModel
from app.models.submission import SubmissionStatus


class SubmissionCreate(CamelModel):
    exercise_id: int
    exercise_list_id: int
    class_id: int
    code_snapshot: str
    status: SubmissionStatus = SubmissionStatus.SUBMITTED


class SubmissionGrade(CamelModel):
    score: float
    teacher_feedback: str | None = None


class SubmissionResponse(CamelModel):
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
