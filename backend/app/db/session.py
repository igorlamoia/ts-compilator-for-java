from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.db.base import Base

engine_kwargs: dict = {"echo": False, "pool_pre_ping": True}
if settings.database_url.startswith("postgresql"):
    engine_kwargs["connect_args"] = {
        "server_settings": {"search_path": settings.database_schema}
    }

engine = create_async_engine(settings.database_url, **engine_kwargs)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def init_db() -> None:
    if settings.run_create_all:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
