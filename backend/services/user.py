from fastapi import HTTPException
from loguru import logger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.security import hash_password
from ..storage.postgres import User
from ..schemas.user import UserCreate
from ..repositories.user import UserRepository


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = UserRepository(db)

    async def create_user(self, data: UserCreate):
        # проверка на дубликат email
        existing = await self.repo.get_by_email(data.email)

        if existing:
            raise HTTPException(
                status_code=400,
                detail="User with this email already exists"
            )

        # ВАЖНО: пока без bcrypt (добавим в auth слой)
        user = User(
            email=data.email,
            password_hash=hash_password(
                data.password
            ),
            role=data.role
        )

        await self.repo.create(user)

        return user

    async def get_user(self, user_id: int):
        user = await self.repo.get_by_id(user_id)
        a = await self.db.execute(select(User))
        logger.info(a.scalars().all())
        logger.info(user)
        if not user:
            raise HTTPException(404, "User not found")

        return user

    async def get_user_by_email(self, email: str):
        user = await self.repo.get_by_email(email)

        if not user:
            raise HTTPException(404, "User not found")

        return user

    async def list_users(self, limit: int = 50, offset: int = 0):
        return await self.repo.get_all(limit, offset)

    async def delete_user(self, user_id: int):
        user = await self.repo.get_by_id(user_id)

        if not user:
            raise HTTPException(404, "User not found")

        await self.repo.delete(user)

        return {"status": "deleted"}