from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Integer, String, ForeignKey, Index, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.test_case import TestCase
    from app.models.submission import Submission
    from app.models.exercise_list_item import ExerciseListItem


class Exercise(Base):
    __tablename__ = "exercises"
    __table_args__ = (Index("ix_exercises_teacher_id", "teacher_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    teacher_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    attachments: Mapped[str] = mapped_column(String, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())

    teacher: Mapped["User"] = relationship("User", back_populates="exercises")
    test_cases: Mapped[list["TestCase"]] = relationship("TestCase", back_populates="exercise", cascade="all, delete-orphan")
    submissions: Mapped[list["Submission"]] = relationship("Submission", back_populates="exercise")
    list_items: Mapped[list["ExerciseListItem"]] = relationship("ExerciseListItem", back_populates="exercise")
