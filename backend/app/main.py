import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import connect_db, disconnect_db
import app.database as db_mod
from app.models import Base
from app.auth import init_firebase
from app.config import get_settings
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from sqlalchemy import text

settings = get_settings()


async def ensure_schema():
    """Verify DB connectivity and create tables only if missing.

    Uses a single `to_regclass` check (1 round-trip) instead of running
    create_all (which issues ~20+ metadata queries) on every startup.
    """
    if db_mod.engine is None:
        await connect_db()
    try:
        async with db_mod.engine.connect() as conn:
            exists = (
                await conn.execute(text("SELECT to_regclass('users')"))
            ).scalar()
        if not exists:
            async with db_mod.engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"Startup DB init skipped: {e}")


@asynccontextmanager
async def lifespan(fastapi_app: FastAPI):
    await connect_db()
    init_firebase()
    startup_task = asyncio.create_task(ensure_schema())
    yield
    startup_task.cancel()
    try:
        await startup_task
    except (asyncio.CancelledError, Exception):
        pass
    await disconnect_db()


app = FastAPI(
    title="PlaceX API",
    version="1.0.0",
    description="AI-Powered Student Placement Platform",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.CORS_ORIGINS.strip() == "*" else settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "app": "PlaceX API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    if db_mod.engine is None:
        return {"status": "degraded", "database": "disconnected"}
    try:
        async with db_mod.engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception:
        return {"status": "degraded", "database": "error"}


from app.api import auth, resume, assessment, interview, prediction, jobs, roadmap, dashboard, chatbot, company, admin, alumni, resume_builder

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(resume_builder.router, prefix="/api/resume-builder", tags=["Resume Builder"])
app.include_router(assessment.router, prefix="/api/assessment", tags=["Skill Assessment"])
app.include_router(interview.router, prefix="/api/interview", tags=["Mock Interview"])
app.include_router(prediction.router, prefix="/api/prediction", tags=["Placement Prediction"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["Career Roadmap"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["AI Chatbot"])
app.include_router(company.router, prefix="/api/company", tags=["Company Insights"])
app.include_router(alumni.router, prefix="/api/alumni", tags=["Alumni Network"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin Dashboard"])
