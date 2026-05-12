from datetime import date

from pydantic import BaseModel, ConfigDict

from backend.schemas.user import UserRead


class PatientBase(BaseModel):
    full_name: str
    birth_date: date
    phone: str


class PatientCreate(PatientBase):
    user_id: int


class PatientUpdate(BaseModel):
    full_name: str | None = None
    birth_date: date | None = None
    phone: str | None = None


class PatientRead(PatientBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)


class PatientDetail(PatientRead):
    user: UserRead