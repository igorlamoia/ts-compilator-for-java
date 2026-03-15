from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.users import UserResponse, UserUpdate
from app.schemas.classes import ClassCreate, ClassUpdate, ClassResponse
from app.schemas.exercises import ExerciseCreate, ExerciseUpdate, ExerciseResponse, TestCaseCreate, TestCaseResponse
from app.schemas.submissions import SubmissionCreate, SubmissionGrade, SubmissionResponse
from app.schemas.exercise_lists import ExerciseListCreate, ExerciseListResponse

__all__ = [
    "LoginRequest", "RegisterRequest", "TokenResponse",
    "UserResponse", "UserUpdate",
    "ClassCreate", "ClassUpdate", "ClassResponse",
    "ExerciseCreate", "ExerciseUpdate", "ExerciseResponse",
    "TestCaseCreate", "TestCaseResponse",
    "SubmissionCreate", "SubmissionGrade", "SubmissionResponse",
    "ExerciseListCreate", "ExerciseListResponse",
]
