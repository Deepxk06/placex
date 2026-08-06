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


PROFILES_DDL = """
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id VARCHAR NOT NULL PRIMARY KEY,
    photo TEXT, date_of_birth VARCHAR, gender VARCHAR, blood_group VARCHAR,
    aadhaar_number VARCHAR, nationality VARCHAR, bio TEXT,
    phone VARCHAR, alternate_phone VARCHAR, personal_email VARCHAR, website VARCHAR,
    address_line1 VARCHAR, address_line2 VARCHAR, city VARCHAR, district VARCHAR,
    state VARCHAR, country VARCHAR, pin_code VARCHAR, landmark VARCHAR,
    address_type VARCHAR, latitude VARCHAR, longitude VARCHAR,
    college_name VARCHAR, college_location VARCHAR, degree VARCHAR, branch VARCHAR,
    cgpa VARCHAR, start_year VARCHAR, end_year VARCHAR, roll_number VARCHAR,
    admission_number VARCHAR,
    student_id_doc JSON, aadhaar_doc JSON, driving_license_doc JSON,
    language VARCHAR, theme VARCHAR,
    email_notifications BOOLEAN, sms_notifications BOOLEAN, push_notifications BOOLEAN,
    profile_visibility VARCHAR, two_factor_enabled BOOLEAN, is_verified BOOLEAN,
    activity JSON, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY(user_id) REFERENCES users (uid)
)
"""


async def ensure_schema():
    """Verify DB connectivity and create tables only if missing."""
    if db_mod.engine is None:
        await connect_db()
    try:
        async with db_mod.engine.connect() as conn:
            users_exists = (
                await conn.execute(text("SELECT to_regclass('users')"))
            ).scalar()
            profiles_exists = (
                await conn.execute(text("SELECT to_regclass('user_profiles')"))
            ).scalar()
        if not users_exists:
            async with db_mod.engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
        if not profiles_exists:
            async with db_mod.engine.begin() as conn:
                await conn.execute(text(PROFILES_DDL))
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


from app.api import auth, resume, assessment, interview, prediction, jobs, roadmap, dashboard, chatbot, company, admin, alumni, resume_builder, profile, compiler

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
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(compiler.router, prefix="/api/compiler", tags=["Code Compiler"])
