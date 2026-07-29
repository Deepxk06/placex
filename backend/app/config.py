from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://placex:placex@localhost:5432/placex"
    FIREBASE_CREDENTIALS_PATH: str = "firebase-credentials.json"
    GROQ_API_KEY: str = ""
    JWT_SECRET: str = "placex-secret-key-change-in-production"
    FIREBASE_STORAGE_BUCKET: str = ""
    REDIS_URL: str = "redis://localhost:6379/0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings():
    return Settings()
