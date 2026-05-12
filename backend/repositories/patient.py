from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..storage.postgres  import Patient


class PatientRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, patient: Patient):
        self.db.add(patient)
        await self.db.flush()
        await self.db.commit()
        return patient

    async def get_by_id(self, patient_id: int):
        result = await self.db.execute(
            select(Patient).where(Patient.id == patient_id)
        )
        return result.scalar_one_or_none()

    async def get_by_user_id(self, user_id: int):
        result = await self.db.execute(
            select(Patient).where(Patient.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_all(self, limit: int, offset: int):
        result = await self.db.execute(
            select(Patient).limit(limit).offset(offset)
        )
        return result.scalars().all()