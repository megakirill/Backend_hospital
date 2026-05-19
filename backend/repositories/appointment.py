from typing import Optional

from loguru import logger
from sqlalchemy import select, and_, cast, Date
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, datetime

from ..storage.postgres import Appointment


class AppointmentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_slots(self, doctor_id: int, date: Optional[date] = None):
        if date is None:
            stmt = select(Appointment).where(
                Appointment.doctor_id == doctor_id
            )
        else:
            stmt = select(Appointment).where(
                Appointment.doctor_id == doctor_id,
                cast(Appointment.appointment_time, Date) == date
            )

        slots = await self.db.execute(
            stmt.order_by(Appointment.appointment_time)
        )
        slots = slots.scalars().all()
        logger.info(slots)
        return slots

    async def create_slots(self, slots):
        self.db.add_all(slots)
        await self.db.flush()
        await self.db.commit()
        return slots

    async def create(self, appointment: Appointment):
        self.db.add(appointment)
        await self.db.flush()
        await self.db.commit()
        return appointment

    async def get_by_id(self, appointment_id: int):
        stmt = select(Appointment).where(Appointment.id == appointment_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(self):
        result = await self.db.execute(select(Appointment))
        return result.scalars().all()

    async def get_by_patient_id(self, patient_id: int):
        result = await self.db.execute(
            select(Appointment)
            .where(Appointment.patient_id == patient_id)
            .order_by(Appointment.appointment_time.desc())
        )
        return result.scalars().all()

    async def delete(self, appointment: Appointment):
        await self.db.delete(appointment)

    async def is_slot_taken(
        self,
        doctor_id: int,
        appointment_time: datetime
    ) -> bool:
        stmt = select(Appointment).where(
            and_(
                Appointment.doctor_id == doctor_id,
                Appointment.appointment_time == appointment_time,
                Appointment.status == "free"
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none() is not None

