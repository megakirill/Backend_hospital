from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from ...schemas import DoctorCreate, DoctorRead
from ...services import DoctorService
from ..deps import get_doctor_service
from ..deps.auth import get_current_patient

router = APIRouter(prefix="/doctors", tags=["Doctors"])




@router.post("/", response_model=DoctorRead)
async def create_doctor(
    data: DoctorCreate,
    service: DoctorService = Depends(get_doctor_service)
):
    return await service.create(data)


@router.get("/{doctor_id}", response_model=DoctorRead)
async def get_doctor(
    doctor_id: int,
    service: DoctorService = Depends(get_doctor_service)
):
    return await service.get(doctor_id)


@router.get("/", response_model=List[DoctorRead])
async def get_doctors(
    specialization: str | None = None,
    patient=Depends(get_current_patient),
    service: DoctorService = Depends(get_doctor_service)
):
    return await service.get_all(specialization)


@router.delete("/{doctor_id}")
async def delete_doctor(
    doctor_id: int,
    service: DoctorService = Depends(get_doctor_service)
):
    return await service.delete(doctor_id)
