from datetime import date

from sqlalchemy import String, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        unique=True
    )

    full_name: Mapped[str] = mapped_column(
        String(255)
    )

    birth_date: Mapped[date] = mapped_column(
        Date
    )

    phone: Mapped[str] = mapped_column(
        String(20)
    )

    user = relationship(
        "User",
        back_populates="patient"
    )

    appointments = relationship(
        "Appointment",
        back_populates="patient",
        cascade="all, delete-orphan"
    )