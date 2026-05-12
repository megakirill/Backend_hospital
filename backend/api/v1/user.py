from fastapi import APIRouter, Depends, Query
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from ...schemas.user import UserCreate, UserRead
from ...services.user import UserService
from ..deps import get_user_service

router = APIRouter(prefix="/users", tags=["Users"])




# CREATE USER
@router.post("/", response_model=UserRead)
async def create_user(
    data: UserCreate,
    service: UserService = Depends(get_user_service)
):
    return await service.create_user(data)


# GET BY ID
@router.get("/{user_id}", response_model=UserRead)
async def get_user(
    user_id: int,
    service: UserService = Depends(get_user_service)
):
    return await service.get_user(user_id)


# GET BY EMAIL
@router.get("/by-email/", response_model=UserRead)
async def get_user_by_email(
    email: str = Query(...),
    service: UserService = Depends(get_user_service)
):
    return await service.get_user_by_email(email)


# LIST USERS
@router.get("/", response_model=List[UserRead])
async def list_users(
    limit: int = Query(50, le=100),
    offset: int = 0,
    service: UserService = Depends(get_user_service)
):
    return await service.list_users(limit, offset)


# DELETE USER
@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    service: UserService = Depends(get_user_service)
):
    return await service.delete_user(user_id)