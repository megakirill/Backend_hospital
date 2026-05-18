from fastapi import APIRouter, Depends, Cookie
from fastapi import Response
from sqlalchemy.ext.asyncio import AsyncSession

from backend.schemas.auth import (
    LoginSchema,
    RefreshRequest
)

from backend.services.auth import AuthService

from ..deps import (
    get_auth_service
)

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


@router.post("/login")
async def login(
    response: Response,
    data: LoginSchema,
    service: AuthService = Depends(
        get_auth_service
    )
):
    tokens = await service.login(data)

    response.set_cookie(
        key="refresh_token",
        value=tokens.refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7
    )

    return {
        "access_token": tokens.access_token
    }


@router.post("/refresh")
async def refresh(
    refresh_token: str = Cookie(...),
    service: AuthService = Depends(
        get_auth_service
    )
):
    tokens = await service.refresh(
        refresh_token
    )

    return {
        "access_token": tokens.access_token
    }


@router.post("/logout")
async def logout(
    response: Response,
    refresh_token: str = Cookie(...),
    service: AuthService = Depends(
        get_auth_service
    )
):
    await service.logout(refresh_token)

    response.delete_cookie(
        key="refresh_token"
    )

    return {
        "message": "Logged out"
    }