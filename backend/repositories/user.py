from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..storage.postgres import User


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user: User):
        self.db.add(user)
        await self.db.flush()
        await self.db.commit()
        return user

    async def get_by_id(self, user_id: int):
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str):
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_all(self, limit: int = 50, offset: int = 0):
        result = await self.db.execute(
            select(User).limit(limit).offset(offset)
        )
        return result.scalars().all()

    async def delete(self, user: User):
        await self.db.delete(user)

    async def get_role_by_id(self, user_id: int) -> User:
        user = await self.db.execute(select(User).where(User.id == user_id))
        return user.scalar_one_or_none()