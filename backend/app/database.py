from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.config import get_settings

settings = get_settings()
engine = None
async_session = None


async def connect_db():
    global engine, async_session
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        pool_size=5,
        max_overflow=2,
        pool_pre_ping=True,
        pool_recycle=300,
    )
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def disconnect_db():
    global engine
    if engine:
        await engine.dispose()


def get_db():
    return async_session
