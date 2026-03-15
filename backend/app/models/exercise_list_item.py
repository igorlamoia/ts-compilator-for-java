from typing import TYPE_CHECKING
from sqlalchemy import String, Float, Integer, ForeignKey, PrimaryKeyConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.exercise_list import ExerciseList
    from app.models.exercise import Exercise


class ExerciseListItem(Base):
    __tablename__ = "exercise_list_items"
    __table_args__ = (
        PrimaryKeyConstraint("exercise_list_id", "exercise_id"),
        Index("ix_exercise_list_items_exercise_id", "exercise_id"),
    )

    exercise_list_id: Mapped[str] = mapped_column(String, ForeignKey("exercise_lists.id", ondelete="CASCADE"), nullable=False)
    exercise_id: Mapped[str] = mapped_column(String, ForeignKey("exercises.id", ondelete="RESTRICT"), nullable=False)
    grade_weight: Mapped[float] = mapped_column(Float, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    exercise_list: Mapped["ExerciseList"] = relationship("ExerciseList", back_populates="items")
    exercise: Mapped["Exercise"] = relationship("Exercise", back_populates="list_items")
