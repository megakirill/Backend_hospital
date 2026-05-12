from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker
)
from sqlalchemy.orm import declarative_base

from backend.storage.postgres.connection_factory import Database

DATABASE_URL = "postgresql+asyncpg://user:password@localhost:5432/db_name"

# Создаем async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # логирование SQL
    future=True
)

# Фабрика сессий
AsyncSessionFabric = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Базовый класс для моделей
Base = declarative_base()

db = Database()