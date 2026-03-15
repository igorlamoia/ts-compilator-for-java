from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Integer, String, ForeignKey, Index, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.exercise_list_item import ExerciseListItem
    from app.models.class_exercise_list import ClassExerciseList


class ExerciseList(Base):
    __tablename__ = "exercise_lists"
    __table_args__ = (Index("ix_exercise_lists_teacher_id", "teacher_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    teacher_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())

    teacher: Mapped["User"] = relationship("User", back_populates="exercise_lists")
    items: Mapped[list["ExerciseListItem"]] = relationship("ExerciseListItem", back_populates="exercise_list", cascade="all, delete-orphan")
    classes: Mapped[list["ClassExerciseList"]] = relationship("ClassExerciseList", back_populates="exercise_list", cascade="all, delete-orphan")
