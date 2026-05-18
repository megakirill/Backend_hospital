from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from jose import JWTError, jwt
from sqlalchemy import select

from ...core.config import settings
from ...storage.postgres import User, Doctor, Patient

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


async def get_current_user(
    token: str = Depends(oauth2_scheme)
):
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        if payload.get("type") != "access":
            raise HTTPException(
                status_code=401,
                detail="Invalid token type"
            )

        return payload

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )


async def get_current_doctor(
    user=Depends(get_current_user)
):
    if user["role"] != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Doctor only"
        )

    doctor = select(Doctor).where(Doctor.user_id == user["id"])
    return doctor

async def get_current_patient(
    user=Depends(get_current_user)
):
    if user["role"] != "patient":
        raise HTTPException(
            status_code=403,
            detail="Patient only"
        )

    patient = select(Patient).where(Patient.user_id == user["id"])
    return patient


async def get_current_admin(
    user=Depends(get_current_user)
):
    if user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin only"
        )

    return user