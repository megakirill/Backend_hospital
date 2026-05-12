from typing import Any, Coroutine, AsyncIterator

from backend.storage.postgres.config import PostgresConfig, postgres_settings
from backend.interfaces import DB
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine, async_sessionmaker, AsyncSession, AsyncConnection
from loguru import logger

class Database(DB):
    def __init__(self, settings: PostgresConfig = postgres_settings):
        self.settings = settings
        self._engine: AsyncEngine | None = None
        self._session_factory = None
        base_url = Database.create_url(self.settings)
        super().__init__(url=base_url)

    @staticmethod
    def create_url(settings: PostgresConfig):
        return f"postgresql+asyncpg://{settings.user}:{settings.password}@{settings.base_url}:{settings.port}/{settings.db}"

    @property
    def _session(self)-> AsyncSession:
        return self._session_factory()

    async def connect(self):
        self._engine = create_async_engine(self._url)

        self._session_factory = async_sessionmaker(
            self._engine,
            expire_on_commit=False,
            class_=AsyncSession
        )
        logger.success(f"Успешное подключение к Postgres по адресу: {self._url}")

    async def close(self):
        if self._engine:
            await self._engine.dispose()
            logger.success(f"Подключение к Postgres по адресу: {self._url} закрыто")

    def get_session(self) -> AsyncSession:
        return self._session_factory()

    async def __aenter__(self) -> AsyncIterator[AsyncConnection]:
        return self._engine.begin()

    async def __aexit__(self):
        await self._engine.dispose()


