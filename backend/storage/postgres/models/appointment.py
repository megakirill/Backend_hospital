from datetime import datetime
import enum

from sqlalchemy import (
    ForeignKey,
    DateTime,
    String, Index, Enum
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship
)

from ..db import Base

class AppointmentStatus(enum.Enum):
    FREE = "free"
    BOOKED = "booked"
    IN_PROGRESS = "in progress"
    FINISHED = "finished"

class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(primary_key=True)

    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id"),
        nullable=True
    )

    doctor_id: Mapped[int] = mapped_column(
        ForeignKey("doctors.id")
    )

    appointment_time: Mapped[datetime] = mapped_column(
        DateTime
    )

    status: Mapped[AppointmentStatus] = mapped_column(
        Enum(AppointmentStatus),
        default=AppointmentStatus.FREE
    )

    patient = relationship(
        "Patient",
        back_populates="appointments"
    )

    doctor = relationship(
        "Doctor",
        back_populates="appointments"
    )

    medical_record = relationship(
        "MedicalRecord",
        back_populates="appointment",
        uselist=False,
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index('appointment_time_index', 'appointment_time', postgresql_using='btree'),
    )