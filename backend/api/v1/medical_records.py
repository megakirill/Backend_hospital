from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ...schemas import (
    MedicalRecordCreate,
    MedicalRecordRead,
    MedicalRecordUpdate
)
from ...services import MedicalRecordService
from ..deps import get_medical_service_service
from ..deps.auth import get_current_doctor, get_current_patient

router = APIRouter(
    prefix="/medical-records",
    tags=["MedicalRecords"]
)



@router.post("/", response_model=MedicalRecordRead)
async def create_record(
    data: MedicalRecordCreate,
    doctor=Depends(get_current_doctor),
    service: MedicalRecordService = Depends(get_medical_service_service)
):
    return await service.upsert_for_doctor(
        data.appointment_id,
        doctor.id,
        MedicalRecordUpdate(
            diagnosis=data.diagnosis,
            symptoms=data.symptoms,
            recommendations=data.recommendations
        )
    )


@router.get("/by-appointment/{appointment_id}", response_model=MedicalRecordRead)
async def get_record_by_appointment(
    appointment_id: int,
    patient=Depends(get_current_patient),
    service: MedicalRecordService = Depends(get_medical_service_service)
):
    return await service.get_by_appointment_for_patient(
        appointment_id,
        patient.id
    )


@router.get("/doctor/by-appointment/{appointment_id}", response_model=MedicalRecordRead)
async def get_doctor_record_by_appointment(
    appointment_id: int,
    doctor=Depends(get_current_doctor),
    service: MedicalRecordService = Depends(get_medical_service_service)
):
    return await service.get_by_appointment_for_doctor(
        appointment_id,
        doctor.id
    )


@router.put("/doctor/by-appointment/{appointment_id}", response_model=MedicalRecordRead)
async def upsert_doctor_record_by_appointment(
    appointment_id: int,
    data: MedicalRecordUpdate,
    doctor=Depends(get_current_doctor),
    service: MedicalRecordService = Depends(get_medical_service_service)
):
    return await service.upsert_for_doctor(
        appointment_id,
        doctor.id,
        data
    )


@router.get("/{record_id}", response_model=MedicalRecordRead)
async def get_record(
    record_id: int,
    service: MedicalRecordService = Depends(get_medical_service_service)
):
    return await service.get(record_id)
