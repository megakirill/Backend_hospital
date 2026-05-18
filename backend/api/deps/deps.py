from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from backend.services import AppointmentService, PatientService, DoctorService, MedicalRecordService, AuthService
from backend.storage.postgres.connection_factory import Database
from backend.services.user import UserService
from backend.storage.postgres.db import db

async def get_db() -> AsyncSession:
    async with db.get_session() as session:
        yield session

def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(db)

async def get_appointment_service(
    db: AsyncSession = Depends(get_db)
) -> AppointmentService:
    return AppointmentService(db)

def get_service(db: AsyncSession = Depends(get_db)) -> PatientService:
    return PatientService(db)

def get_doctor_service(db: AsyncSession = Depends(get_db)) -> DoctorService:
    return DoctorService(db)

def get_medical_service_service(db: AsyncSession = Depends(get_db)):
    return MedicalRecordService(db)

def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(db)