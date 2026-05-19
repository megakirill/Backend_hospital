import datetime

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from ..storage.postgres import Appointment, AppointmentStatus
from ..schemas import AppointmentCreate
from ..repositories import AppointmentRepository, PatientRepository


class AppointmentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = AppointmentRepository(db)
        self.patient_repo = PatientRepository(db)

    async def get_slots_by_doctor_id(self, doctor_id: int, date):
        slots = await self.repo.get_slots(doctor_id, date)
        return slots

    async def create_slots(self, doctor_id: int, data: datetime.date):
        has_slots = await self.repo.get_slots(doctor_id, data)
        logger.info(has_slots)
        if bool(has_slots):
            raise HTTPException(400, "У доктора уже есть записи на этот день")

        start_datetime = datetime.datetime.combine(data, datetime.time(9, 0))

        # 9 часов * 2 слота в час = 18 слотов
        slots = [
            Appointment(
                doctor_id=doctor_id,
                appointment_time=start_datetime + datetime.timedelta(minutes=30 * i),
                status=AppointmentStatus.FREE
            )
            for i in range(18)
        ]
        logger.info(slots)
        return await self.repo.create_slots(slots)


    async def create(self, data: AppointmentCreate):
        # Проверка занятости
        is_taken = await self.repo.is_slot_taken(
            data.doctor_id,
            data.appointment_time
        )

        if is_taken:
            raise HTTPException(
                status_code=400,
                detail="Time slot is already taken"
            )

        appointment = Appointment(**data.model_dump())
        await self.repo.create(appointment)

        return appointment

    async def get(self, appointment_id: int):
        appointment = await self.repo.get_by_id(appointment_id)

        if not appointment:
            raise HTTPException(404, "Appointment not found")

        return appointment

    async def get_all(self):
        return await self.repo.get_all()

    async def get_by_patient_id(self, patient_id: int):
        return await self.repo.get_by_patient_id(patient_id)

    async def delete(self, appointment_id: int):
        appointment = await self.repo.get_by_id(appointment_id)

        if not appointment:
            raise HTTPException(404, "Appointment not found")

        await self.repo.delete(appointment)

        return {"status": "deleted"}

    async def update_status(
        self,
        appointment_id: int,
        status: AppointmentStatus,
        doctor_id: int | None = None
    ):
        appointment = await self.repo.get_by_id(appointment_id)

        if not appointment:
            raise HTTPException(404, "Appointment not found")

        if doctor_id is not None and appointment.doctor_id != doctor_id:
            raise HTTPException(403, "Appointment belongs to another doctor")

        if appointment.status == AppointmentStatus.FREE:
            raise HTTPException(400, "На данный сеанс пока никто не зарегистрирован")
        status = AppointmentStatus(status)
        appointment.status = status
        if status == AppointmentStatus.FREE:
            appointment.patient_id = None
        self.db.add(appointment)
        await self.db.commit()
        return appointment

    async def take_slot(self, appointment_id: int, patient_id: int):
        appointment = await self.repo.get_by_id(appointment_id)
        if not(appointment):
            raise HTTPException(404, "Appointment not found")
        if appointment.status != AppointmentStatus.FREE:
            raise HTTPException(400, "Appointment is not available")
        patient = await self.patient_repo.get_by_id(patient_id)
        if not patient:
            raise HTTPException(404, "Patient not found")
        appointment.patient_id = patient_id
        appointment.status = AppointmentStatus.BOOKED
        self.db.add(appointment)
        await self.db.commit()
        return appointment
