from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..storage.postgres.models import MedicalRecord


class MedicalRecordRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, record: MedicalRecord):
        self.db.add(record)
        await self.db.flush()
        await self.db.commit()
        return record

    async def update(self, record: MedicalRecord):
        self.db.add(record)
        await self.db.commit()
        await self.db.refresh(record)
        return record

    async def get_by_id(self, record_id: int):
        result = await self.db.execute(
            select(MedicalRecord).where(MedicalRecord.id == record_id)
        )
        return result.scalar_one_or_none()

    async def get_by_appointment(self, appointment_id: int):
        result = await self.db.execute(
            select(MedicalRecord).where(
                MedicalRecord.appointment_id == appointment_id
            )
        )
        return result.scalar_one_or_none()
