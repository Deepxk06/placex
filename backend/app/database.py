from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.config import get_settings

settings = get_settings()
engine = None
async_session = None


async def connect_db():
    global engine, async_session
    is_sqlite = settings.DATABASE_URL.startswith("sqlite")
    kwargs = {
        "echo": settings.DEBUG,
        "pool_pre_ping": True,
    }
    if not is_sqlite:
        kwargs.update({"pool_size": 5, "max_overflow": 2, "pool_recycle": 300})
    engine = create_async_engine(settings.DATABASE_URL, **kwargs)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def disconnect_db():
    global engine
    if engine:
        await engine.dispose()


def get_db():
    return async_session
