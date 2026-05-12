from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..storage.postgres import Doctor, UserRole
from ..schemas import DoctorCreate
from ..repositories import DoctorRepository, UserRepository


class DoctorService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = DoctorRepository(db)
        self.user_repo = UserRepository(db)

    async def create(self, data: DoctorCreate):
        doctor = Doctor(**data.model_dump())
        if await self.repo.get_by_user_id(doctor.user_id):
            raise HTTPException(
                400,
                "Доктор с таким user_id уже существует"
            )
        user = await self.user_repo.get_role_by_id(data.user_id)
        if user.role == UserRole.DOCTOR:
            doctor = await self.repo.create(doctor)
            return doctor
        else:
            raise HTTPException(400, "Пользователь не доктор")


    async def get(self, doctor_id: int):
        doctor = await self.repo.get_by_id(doctor_id)
        if not doctor:
            raise HTTPException(404, "Doctor not found")
        return doctor

    async def get_all(self, specialization: str | None = None):
        return await self.repo.get_all(specialization)

    async def delete(self, doctor_id: int):
        doctor = await self.repo.get_by_id(doctor_id)
        if not doctor:
            raise HTTPException(404, "Doctor not found")

        await self.repo.delete(doctor)

        return {"status": "deleted"}