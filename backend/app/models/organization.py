import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.class_ import Class


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=func.now())

    users: Mapped[list["User"]] = relationship("User", back_populates="organization")
    classes: Mapped[list["Class"]] = relationship("Class", back_populates="organization")
