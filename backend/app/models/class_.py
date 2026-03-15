import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Enum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.organization import Organization
    from app.models.user import User
    from app.models.class_member import ClassMember
    from app.models.class_exercise_list import ClassExerciseList


class ClassStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    ARCHIVED = "ARCHIVED"


class Class(Base):
    __tablename__ = "classes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id: Mapped[str] = mapped_column(String, ForeignKey("organizations.id"), nullable=False)
    teacher_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    access_code: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    status: Mapped[ClassStatus] = mapped_column(Enum(ClassStatus), default=ClassStatus.ACTIVE, nullable=False)

    organization: Mapped["Organization"] = relationship("Organization", back_populates="classes")
    teacher: Mapped["User"] = relationship("User", back_populates="classes_taught", foreign_keys=[teacher_id])
    members: Mapped[list["ClassMember"]] = relationship("ClassMember", back_populates="class_")
    exercise_lists: Mapped[list["ClassExerciseList"]] = relationship("ClassExerciseList", back_populates="class_")
