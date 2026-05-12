from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..storage.postgres import Doctor


class DoctorRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, doctor: Doctor):
        self.db.add(doctor)
        await self.db.flush()
        await self.db.commit()
        return doctor

    async def get_by_id(self, doctor_id: int):
        result = await self.db.execute(
            select(Doctor).where(Doctor.id == doctor_id)
        )
        return result.scalar_one_or_none()

    async def get_all(self, specialization: str | None = None):
        stmt = select(Doctor)

        if specialization:
            stmt = stmt.where(Doctor.specialization == specialization)

        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def delete(self, doctor: Doctor):
        await self.db.delete(doctor)

    async def get_by_user_id(self, user_id: int):
        result = await self.db.execute(
            select(Doctor).where(Doctor.user_id == user_id)
        )
        return result.scalar_one_or_none()