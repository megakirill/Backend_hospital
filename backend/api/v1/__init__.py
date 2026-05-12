from fastapi import APIRouter
from . import appointments
from . import doctor
from . import patients
from . import medical_records
from . import user
from . import auth
router = APIRouter(prefix="/v1",)
router.include_router(patients.router)
router.include_router(medical_records.router)
router.include_router(appointments.router)
router.include_router(doctor.router)
router.include_router(user.router)
router.include_router(auth.router)
