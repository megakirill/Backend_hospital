from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship
)

from ..db import Base


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id: Mapped[int] = mapped_column(primary_key=True)

    appointment_id: Mapped[int] = mapped_column(
        ForeignKey("appointments.id"),
        unique=True
    )

    diagnosis: Mapped[str] = mapped_column(
        Text
    )

    symptoms: Mapped[str] = mapped_column(
        Text
    )

    recommendations: Mapped[str] = mapped_column(
        Text
    )

    appointment = relationship(
        "Appointment",
        back_populates="medical_record"
    )