from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.config import settings
from ...storage.postgres import User, Doctor, Patient
from .deps import get_db

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
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if user["role"] != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Doctor only"
        )

    result = await db.execute(
        select(Doctor).where(Doctor.user_id == int(user["sub"]))
    )
    doctor = result.scalar_one_or_none()

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor profile not found"
        )

    return doctor

async def get_current_patient(
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if user["role"] != "patient":
        raise HTTPException(
            status_code=403,
            detail="Patient only"
        )

    result = await db.execute(
        select(Patient).where(Patient.user_id == int(user["sub"]))
    )
    patient = result.scalar_one_or_none()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient profile not found"
        )

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
