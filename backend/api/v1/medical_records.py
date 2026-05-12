from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ...schemas import (
    MedicalRecordCreate,
    MedicalRecordRead
)
from ...services import MedicalRecordService
from ..deps import get_medical_service_service

router = APIRouter(
    prefix="/medical-records",
    tags=["MedicalRecords"]
)



@router.post("/", response_model=MedicalRecordRead)
async def create_record(
    data: MedicalRecordCreate,
    service: MedicalRecordService = Depends(get_medical_service_service)
):
    return await service.create(data)


@router.get("/{record_id}", response_model=MedicalRecordRead)
async def get_record(
    record_id: int,
    service: MedicalRecordService = Depends(get_medical_service_service)
):
    return await service.get(record_id)