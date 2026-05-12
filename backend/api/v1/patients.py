from fastapi import APIRouter, Depends, Query
from typing import List



from ...schemas import PatientCreate, PatientRead
from ...services import PatientService
from ..deps import get_service

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.post("/", response_model=PatientRead)
async def create_patient(
    data: PatientCreate,
    service: PatientService = Depends(get_service)
):
    return await service.create(data)

@router.get("/by_user/{user_id}")
async def get_by_user(  
    user_id: int,
    service: PatientService = Depends(get_service)
):
    return await service.get_by_user_id(
        user_id
    )

@router.get("/{patient_id}", response_model=PatientRead)
async def get_patient(
    patient_id: int,
    service: PatientService = Depends(get_service)
):
    return await service.get(patient_id)


@router.get("/", response_model=List[PatientRead])
async def get_patients(
    limit: int = Query(10, le=100),
    offset: int = 0,
    service: PatientService = Depends(get_service)
):
    return await service.get_all(limit, offset)