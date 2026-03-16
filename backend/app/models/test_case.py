from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.exercise import Exercise


class TestCase(Base):
    __tablename__ = "test_cases"
    __test__ = False

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    exercise_id: Mapped[int] = mapped_column(Integer, ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False)
    label: Mapped[str] = mapped_column(String, default="", nullable=False)
    input: Mapped[str] = mapped_column(String, nullable=False)
    expected_output: Mapped[str] = mapped_column(String, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    exercise: Mapped["Exercise"] = relationship("Exercise", back_populates="test_cases")
