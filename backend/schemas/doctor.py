from pydantic import BaseModel, ConfigDict

from backend.schemas.user import UserRead


class DoctorBase(BaseModel):
    full_name: str
    specialization: str
    cabinet: str


class DoctorCreate(DoctorBase):
    user_id: int


class DoctorUpdate(BaseModel):
    full_name: str | None = None
    specialization: str | None = None
    cabinet: str | None = None


class DoctorRead(DoctorBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)


class DoctorDetail(DoctorRead):
    user: UserRead