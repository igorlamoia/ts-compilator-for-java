from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, ForeignKey, PrimaryKeyConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.class_ import Class
    from app.models.user import User


class ClassMember(Base):
    __tablename__ = "class_members"
    __table_args__ = (PrimaryKeyConstraint("class_id", "student_id"),)

    class_id: Mapped[str] = mapped_column(String, ForeignKey("classes.id"), nullable=False)
    student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    joined_at: Mapped[datetime] = mapped_column(default=func.now())

    class_: Mapped["Class"] = relationship("Class", back_populates="members")
    student: Mapped["User"] = relationship("User", back_populates="memberships")
