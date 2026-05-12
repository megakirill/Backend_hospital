from datetime import datetime, date

from pydantic import BaseModel, ConfigDict

from backend.schemas.patient import PatientRead
from backend.schemas.doctor import DoctorRead


class AppointmentBase(BaseModel):
    appointment_time: datetime


class AppointmentCreate(AppointmentBase):
    patient_id: int
    doctor_id: int


class AppointmentUpdate(BaseModel):
    appointment_time: datetime | None = None
    status: str | None = None

class AppointmentSlotsData(BaseModel):
    appointment_time: datetime
    doctor_id: int

class AppointmentRead(AppointmentBase):
    id: int
    patient_id: int | None
    doctor_id: int
    status: str

    model_config = ConfigDict(from_attributes=True)


class AppointmentDetail(AppointmentRead):
    patient: PatientRead
    doctor: DoctorRead