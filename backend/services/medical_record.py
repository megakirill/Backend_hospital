from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..storage.postgres import MedicalRecord, AppointmentStatus
from ..schemas import MedicalRecordCreate
from ..repositories import MedicalRecordRepository, AppointmentRepository



class MedicalRecordService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = MedicalRecordRepository(db)
        self.appointment_repo = AppointmentRepository(db)

    async def create(self, data: MedicalRecordCreate):
        # Проверяем, что приём существует
        appointment = await self.appointment_repo.get_by_id(
            data.appointment_id
        )

        if not appointment:
            raise HTTPException(404, "Appointment not found")

        if appointment.status == AppointmentStatus.FREE or appointment.status == AppointmentStatus.BOOKED:
            raise HTTPException(400, "Запись еще не началась"
                                     "")
        # Проверка: запись уже есть?
        existing = await self.repo.get_by_appointment(
            data.appointment_id
        )

        if existing:
            raise HTTPException(
                400,
                "Medical record already exists for this appointment"
            )

        record = MedicalRecord(**data.model_dump())

        await self.repo.create(record)

        return record

    async def get(self, record_id: int):
        record = await self.repo.get_by_id(record_id)

        if not record:
            raise HTTPException(404, "Medical record not found")

        return record