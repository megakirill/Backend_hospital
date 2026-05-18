import datetime

from fastapi import APIRouter, Depends
from typing import List, Optional

from ..deps.auth import get_current_doctor
from ...schemas import (
    AppointmentRead,
    AppointmentCreate,
    AppointmentSlotsData
)
from ...services import AppointmentService
from ..deps import get_appointment_service
from ...storage.postgres import AppointmentStatus

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.post("/", response_model=AppointmentRead)
async def create_appointment(
    data: AppointmentCreate,
    service: AppointmentService = Depends(get_appointment_service)
):
    return await service.create(data)


@router.get("/{appointment_id}", response_model=AppointmentRead)
async def get_appointment(
    appointment_id: int,
    service: AppointmentService = Depends(get_appointment_service)
):
    return await service.get(appointment_id)

@router.get("/by_doctor_id/{doctor_id}", response_model=List[AppointmentRead])
async def get_appointments_by_doctor_id(
    doctor_id: int,
    date: Optional[datetime.date] = None,
    service: AppointmentService = Depends(get_appointment_service)
):
    return await service.get_slots_by_doctor_id(doctor_id, date)

@router.post("/create_slots", response_model=List[AppointmentSlotsData])
async def create_slots(
    data: datetime.date,
    doctor=Depends(get_current_doctor),
    service: AppointmentService = Depends(get_appointment_service)
):
    return await service.create_slots(doctor.id, data)

@router.get("/", response_model=List[AppointmentRead])
async def get_all_appointments(
    service: AppointmentService = Depends(get_appointment_service)
):
    return await service.get_all()


@router.delete("/{appointment_id}")
async def delete_appointment(
    appointment_id: int,
    service: AppointmentService = Depends(get_appointment_service)
):
    return await service.delete(appointment_id)

#Todo: надо сделать проверку на то что это именно врач делает, путем jwt
@router.patch("/{appointment_id}/status", response_model=AppointmentRead)
async def update_status(
    appointment_id: int,
    status: AppointmentStatus,
    service: AppointmentService = Depends(get_appointment_service)
):
    return await service.update_status(appointment_id, status)

@router.patch("/take_slot/{appointment_id}", response_model=AppointmentRead)
async def take_slot(
    appointment_id: int,
    patient_id: int,
    service: AppointmentService = Depends(get_appointment_service)
):
    return await service.take_slot(appointment_id, patient_id)