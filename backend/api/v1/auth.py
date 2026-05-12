from fastapi import APIRouter, HTTPException, Depends

from ...schemas.auth import LoginSchema
from ...services.user import UserService
from ..deps import get_user_service

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


@router.post("/login")
async def login(
    data: LoginSchema,
    service: UserService = Depends(
        get_user_service
    )
):
    user = await service.get_user_by_email(
        data.email
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Пользователь не найден"
        )

    # временно обычная проверка
    if user.password_hash != data.password:
        raise HTTPException(
            status_code=401,
            detail="Неверный пароль"
        )

    return user