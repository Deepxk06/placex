import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
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


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        return response


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
    is_sqlite = str(db_mod.engine.url).startswith("sqlite")
    try:
        async with db_mod.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        if not is_sqlite:
            async with db_mod.engine.connect() as conn:
                profiles_exists = (
                    await conn.execute(text("SELECT to_regclass('user_profiles')"))
                ).scalar()
            if not profiles_exists:
                async with db_mod.engine.begin() as conn:
                    await conn.execute(text(PROFILES_DDL))
            resume_alters = [
                "ALTER TABLE resumes ADD COLUMN IF NOT EXISTS analysis JSON",
                "ALTER TABLE resumes ADD COLUMN IF NOT EXISTS resume_score FLOAT",
                "ALTER TABLE resumes ADD COLUMN IF NOT EXISTS storage_key VARCHAR DEFAULT ''",
                "ALTER TABLE resumes ADD COLUMN IF NOT EXISTS file_type VARCHAR DEFAULT ''",
                "ALTER TABLE resumes ADD COLUMN IF NOT EXISTS file_size INTEGER DEFAULT 0",
                "ALTER TABLE resume_builder ADD COLUMN IF NOT EXISTS name VARCHAR DEFAULT 'Untitled Resume'",
                "ALTER TABLE resume_builder ADD COLUMN IF NOT EXISTS target_role VARCHAR DEFAULT ''",
                "ALTER TABLE resume_builder ADD COLUMN IF NOT EXISTS experience_level VARCHAR DEFAULT 'fresher'",
                "ALTER TABLE resume_builder ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1",
                "ALTER TABLE resume_builder ADD COLUMN IF NOT EXISTS template_id VARCHAR DEFAULT 'classic'",
                "ALTER TABLE resume_builder ADD COLUMN IF NOT EXISTS sections JSON",
                "ALTER TABLE resume_builder ADD COLUMN IF NOT EXISTS customizations JSON",
                "ALTER TABLE resume_builder ADD COLUMN IF NOT EXISTS created_at TIMESTAMP",
                "ALTER TABLE resume_builder ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP",
            ]
            async with db_mod.engine.begin() as conn:
                for statement in resume_alters:
                    await conn.execute(text(statement))
    except Exception as e:
        print(f"[DB INIT ERROR] {e}")
        import traceback
        traceback.print_exc()


@asynccontextmanager
async def lifespan(fastapi_app: FastAPI):
    await connect_db()
    init_firebase()
    await ensure_schema()
    yield
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

app.add_middleware(GZipMiddleware, minimum_size=1024, compresslevel=5)
app.add_middleware(SecurityHeadersMiddleware)


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
from app.api import certificates, gd, company_questions, learning, job_applications

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
app.include_router(certificates.router, prefix="/api/certificates", tags=["Certificates"])
app.include_router(gd.router, prefix="/api/gd", tags=["Group Discussion"])
app.include_router(company_questions.router, prefix="/api/company-questions", tags=["Company Questions"])
app.include_router(learning.router, prefix="/api/learning", tags=["Learning"])
app.include_router(job_applications.router, prefix="/api/job-applications", tags=["Job Applications"])
