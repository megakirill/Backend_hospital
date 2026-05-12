from pydantic import BaseModel, ConfigDict

from backend.schemas.appointment import AppointmentRead


class MedicalRecordBase(BaseModel):
    diagnosis: str
    symptoms: str
    recommendations: str


class MedicalRecordCreate(MedicalRecordBase):
    appointment_id: int


class MedicalRecordUpdate(BaseModel):
    diagnosis: str | None = None
    symptoms: str | None = None
    recommendations: str | None = None


class MedicalRecordRead(MedicalRecordBase):
    id: int
    appointment_id: int

    model_config = ConfigDict(from_attributes=True)


class MedicalRecordDetail(MedicalRecordRead):
    appointment: AppointmentRead