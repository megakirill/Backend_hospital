from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..storage.postgres import MedicalRecord, AppointmentStatus
from ..schemas import MedicalRecordCreate, MedicalRecordUpdate
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

    async def get_by_appointment_for_patient(
        self,
        appointment_id: int,
        patient_id: int
    ):
        appointment = await self.appointment_repo.get_by_id(
            appointment_id
        )

        if not appointment:
            raise HTTPException(404, "Appointment not found")

        if appointment.patient_id != patient_id:
            raise HTTPException(403, "Appointment belongs to another patient")

        record = await self.repo.get_by_appointment(appointment_id)

        if not record:
            raise HTTPException(404, "Medical record not found")

        return record

    async def get_by_appointment_for_doctor(
        self,
        appointment_id: int,
        doctor_id: int
    ):
        appointment = await self.appointment_repo.get_by_id(
            appointment_id
        )

        if not appointment:
            raise HTTPException(404, "Appointment not found")

        if appointment.doctor_id != doctor_id:
            raise HTTPException(403, "Appointment belongs to another doctor")

        record = await self.repo.get_by_appointment(appointment_id)

        if not record:
            raise HTTPException(404, "Medical record not found")

        return record

    async def upsert_for_doctor(
        self,
        appointment_id: int,
        doctor_id: int,
        data: MedicalRecordUpdate
    ):
        appointment = await self.appointment_repo.get_by_id(
            appointment_id
        )

        if not appointment:
            raise HTTPException(404, "Appointment not found")

        if appointment.doctor_id != doctor_id:
            raise HTTPException(403, "Appointment belongs to another doctor")

        if appointment.status != AppointmentStatus.IN_PROGRESS:
            raise HTTPException(400, "Appointment is not in progress")

        existing = await self.repo.get_by_appointment(appointment_id)

        if existing:
            for field, value in data.model_dump(exclude_unset=True).items():
                setattr(existing, field, value)

            return await self.repo.update(existing)

        payload = data.model_dump()

        if not all(payload.get(field) for field in (
            "diagnosis",
            "symptoms",
            "recommendations"
        )):
            raise HTTPException(400, "All medical record fields are required")

        record = MedicalRecord(
            appointment_id=appointment_id,
            **payload
        )

        return await self.repo.create(record)
