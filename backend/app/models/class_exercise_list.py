from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Float, Integer, ForeignKey, PrimaryKeyConstraint, Index, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.class_ import Class
    from app.models.exercise_list import ExerciseList
    from app.models.submission import Submission


class ClassExerciseList(Base):
    __tablename__ = "class_exercise_lists"
    __table_args__ = (
        PrimaryKeyConstraint("exercise_list_id", "class_id"),
        Index("ix_class_exercise_lists_class_id", "class_id"),
    )

    exercise_list_id: Mapped[str] = mapped_column(String, ForeignKey("exercise_lists.id", ondelete="CASCADE"), nullable=False)
    class_id: Mapped[str] = mapped_column(String, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    deadline: Mapped[datetime] = mapped_column(nullable=False)
    total_grade: Mapped[float] = mapped_column(Float, nullable=False)
    min_required: Mapped[int] = mapped_column(Integer, nullable=False)
    published_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())

    exercise_list: Mapped["ExerciseList"] = relationship("ExerciseList", back_populates="classes")
    class_: Mapped["Class"] = relationship("Class", back_populates="exercise_lists")
    submissions: Mapped[list["Submission"]] = relationship("Submission", back_populates="publication")
