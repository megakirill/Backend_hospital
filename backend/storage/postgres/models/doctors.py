from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        unique=True
    )

    full_name: Mapped[str] = mapped_column(
        String(255)
    )

    specialization: Mapped[str] = mapped_column(
        String(255)
    )

    cabinet: Mapped[str] = mapped_column(
        String(50)
    )

    user = relationship(
        "User",
        back_populates="doctor"
    )

    appointments = relationship(
        "Appointment",
        back_populates="doctor",
        cascade="all, delete-orphan"
    )