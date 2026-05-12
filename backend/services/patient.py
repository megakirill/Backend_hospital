from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from watchfiles import awatch
from sqlalchemy import select
from ..storage.postgres import Patient, UserRole
from ..schemas import PatientCreate
from ..repositories import PatientRepository, UserRepository


class PatientService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = PatientRepository(db)
        self.user_repo = UserRepository(db)

    async def create(self, data: PatientCreate):
        patient = Patient(**data.model_dump())
        if await self.repo.get_by_user_id(patient.user_id):
            raise HTTPException(
                400,
                "Пациент с таким user_id уже существует"
            )
        user = await self.user_repo.get_role_by_id(data.user_id)
        if user.role == UserRole.PATIENT:
            patient = await self.repo.create(patient)
            return patient
        else:
            raise HTTPException(400, "Пользователь не пациент")

    async def get_by_user_id(
        self,
        user_id: int
    ):
        result = await self.db.execute(
            select(Patient).where(
                Patient.user_id == user_id
            )
        )

        return result.scalar_one_or_none()
    
    async def get(self, patient_id: int):
        patient = await self.repo.get_by_id(patient_id)
        if not patient:
            raise HTTPException(404, "Patient not found")
        return patient

    async def get_all(self, limit: int = 10, offset: int = 0):
        return await self.repo.get_all(limit, offset)