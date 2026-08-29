from datetime import datetime, timezone
import re
import uuid

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from sqlalchemy import select

from app.auth import verify_token
from app.database import get_db
from app.models import Resume
from app.services.resume_parser import parse_resume_file
from app.services.resume_analyzer import analyze_resume
from app.services.jd_analyzer import analyze_job_description
from app.services.job_match import compute_job_match
from app.services.resume_recommendations import build_recommendations
from app.services.ai_analyzer import enhance_recommendations

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}
MAGIC_BYTES = {
    "pdf": (b"%PDF",),
    "docx": (b"PK\x03\x04", b"PK\x05\x06", b"PK\x07\x08"),
}
EXTENSION_REGEX = re.compile(r"^[A-Za-z0-9_.\- ]{1,120}\.(pdf|docx|txt)$", re.IGNORECASE)


class JobMatchRequest(BaseModel):
    jdText: str


class JobMatchLegacyRequest(BaseModel):
    jd_text: str = ""


def validate_upload_file(filename: str, content: bytes) -> str:
    """Validate file name, size, extension and magic bytes. Returns the safe storage key."""
    if not filename or not EXTENSION_REGEX.match(filename):
        raise HTTPException(400, "Unsupported file name. Upload a PDF, DOCX or TXT file.")
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type: {ext}. Supported formats: PDF, DOCX, TXT.")
    if not content:
        raise HTTPException(400, "Uploaded file is empty.")
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)} MB.")
    magic = MAGIC_BYTES.get(ext, ())
    if magic and not any(content.startswith(sig) for sig in magic):
        raise HTTPException(400, f"File content does not match its {ext.upper()} extension.")
    return f"{uuid.uuid4().hex}.{ext}"


def serialize_resume(r: Resume) -> dict:
    return {
        "id": str(r.id),
        "originalFile": r.original_file,
        "fileType": r.file_type,
        "fileSize": r.file_size,
        "createdAt": r.created_at.isoformat() if r.created_at else None,
        "resumeScore": r.resume_score,
        "atsScore": r.ats_score,
        "jdMatchScore": r.jd_match_score,
    }


def serialize_resume_full(r: Resume) -> dict:
    data = serialize_resume(r)
    data["parsedData"] = r.parsed_data or {}
    data["analysis"] = r.analysis or {}
    return data


async def get_owned_resume(session, resume_id: str, uid: str) -> Resume:
    try:
        resume_uuid = str(uuid.UUID(resume_id))
    except (ValueError, AttributeError):
        raise HTTPException(404, "Resume not found")
    resume = await session.get(Resume, resume_uuid)
    if not resume:
        raise HTTPException(404, "Resume not found")
    if resume.user_id != uid:
        raise HTTPException(403, "You do not have access to this resume")
    return resume


async def run_full_analysis(resume: Resume) -> dict:
    """Deterministic analysis + best-effort AI recommendation enrichment."""
    parsed = resume.parsed_data or {}
    existing = resume.analysis if isinstance(resume.analysis, dict) else {}
    job_match = existing.get("jobMatch")
    analysis = await analyze_resume(parsed)
    recommendations = build_recommendations(parsed, analysis, job_match)
    analysis["recommendations"] = recommendations

    ai_recs = await enhance_recommendations(parsed, analysis, job_match)
    if ai_recs:
        merged = recommendations + ai_recs
        seen = set()
        analysis["recommendations"] = []
        for rec in merged:
            key = rec.get("category", "") + "|" + rec.get("issue", "").lower()[:60]
            if key in seen:
                continue
            seen.add(key)
            analysis["recommendations"].append(rec)

    analysis["resumeScore"] = analysis.get("resumeScore", 0)
    analysis["atsScore"] = analysis.get("atsScore", 0)
    resume.analysis = analysis
    resume.resume_score = float(analysis.get("resumeScore", 0))
    resume.ats_score = float(analysis.get("atsScore", 0))
    return analysis


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...), uid: str = Depends(verify_token)):
    content = await file.read()
    try:
        storage_key = validate_upload_file(file.filename or "", content)
    except HTTPException:
        raise
    parsed = None
    try:
        parsed = await parse_resume_file(content, file.filename or storage_key)
    except ValueError as e:
        raise HTTPException(400, str(e))

    doc = Resume(
        id=str(uuid.uuid4()),
        user_id=uid,
        original_file=file.filename or "",
        parsed_data=parsed,
        analysis={},
        storage_key=storage_key,
        file_type=storage_key.rsplit(".", 1)[-1].lower(),
        file_size=len(content),
        created_at=datetime.now(timezone.utc),
    )
    async with get_db()() as session:
        session.add(doc)
        await session.commit()
        await session.refresh(doc)

    analysis = await run_full_analysis(doc)
    async with get_db()() as session:
        resume = await session.get(Resume, doc.id)
        resume.analysis = analysis
        resume.resume_score = float(analysis.get("resumeScore", 0))
        resume.ats_score = float(analysis.get("atsScore", 0))
        await session.commit()

    result = serialize_resume_full(resume)
    result["analysis"] = analysis
    return result


@router.get("/")
async def list_resumes(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(Resume).where(Resume.user_id == uid).order_by(Resume.created_at.desc()).limit(20)
        result = await session.execute(stmt)
        resumes = result.scalars().all()
        return [serialize_resume(r) for r in resumes]


@router.get("/{resume_id}")
async def get_resume(resume_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        resume = await get_owned_resume(session, resume_id, uid)
        return serialize_resume_full(resume)


@router.delete("/{resume_id}")
async def delete_resume(resume_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        resume = await get_owned_resume(session, resume_id, uid)
        await session.delete(resume)
        await session.commit()
    return {"message": "Resume deleted"}


@router.post("/{resume_id}/analyze")
async def analyze_resume_endpoint(resume_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        resume = await get_owned_resume(session, resume_id, uid)
        analysis = await run_full_analysis(resume)
        await session.commit()
    return analysis


@router.post("/{resume_id}/job-match")
async def job_match_endpoint(resume_id: str, body: JobMatchRequest, uid: str = Depends(verify_token)):
    jd_text = body.jdText.strip()
    if not jd_text:
        raise HTTPException(400, "Job description text is required")
    async with get_db()() as session:
        resume = await get_owned_resume(session, resume_id, uid)
        jd_analysis = await analyze_job_description(jd_text)
        match = await compute_job_match(resume.parsed_data or {}, jd_text, jd_analysis)
        analysis = resume.analysis or {}
        if not isinstance(analysis, dict):
            analysis = {}
        merged = dict(analysis)
        merged["jobMatch"] = match
        resume.analysis = merged
        resume.jd_match_score = float(match.get("score", 0))
        await session.commit()
    return {"jobMatch": match}


@router.get("/{resume_id}/analysis")
async def get_analysis(resume_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        resume = await get_owned_resume(session, resume_id, uid)
        return resume.analysis or {}


@router.get("/{resume_id}/skills")
async def get_skills(resume_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        resume = await get_owned_resume(session, resume_id, uid)
    parsed = resume.parsed_data or {}
    analysis = resume.analysis or {}
    return {
        "skills": parsed.get("skills", []),
        "skillLevels": analysis.get("skillLevels", {}),
        "jobMatch": analysis.get("jobMatch", {}).get("matchedSkills", []),
    }


@router.get("/{resume_id}/recommendations")
async def get_recommendations(resume_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        resume = await get_owned_resume(session, resume_id, uid)
    return (resume.analysis or {}).get("recommendations", [])


# ---------------------------------------------------------------------------
# Legacy endpoints (kept for backward compatibility)
# ---------------------------------------------------------------------------

@router.post("/{resume_id}/ats-score")
async def get_ats_score(resume_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        resume = await get_owned_resume(session, resume_id, uid)
        analysis = await analyze_resume(resume.parsed_data or {})
        resume.analysis = analysis
        resume.ats_score = float(analysis.get("atsScore", 0))
        await session.commit()
    return {
        "overall": analysis["atsScore"],
        "keywordScore": analysis["atsBreakdown"]["keywordRelevance"],
        "formatScore": analysis["atsBreakdown"]["formatting"],
        "lengthScore": analysis["atsBreakdown"]["readability"],
        "verbScore": analysis["atsBreakdown"]["structure"],
        "sectionScore": analysis["atsBreakdown"]["sectionCompleteness"],
        "suggestions": [w["message"] for w in analysis["atsWarnings"]],
    }


@router.post("/{resume_id}/match-jd")
async def match_job_description(resume_id: str, jd_text: str = "", body: JobMatchLegacyRequest = None, uid: str = Depends(verify_token)):
    if not jd_text and body and body.jd_text:
        jd_text = body.jd_text
    if not jd_text:
        raise HTTPException(400, "Job description text is required")
    async with get_db()() as session:
        resume = await get_owned_resume(session, resume_id, uid)
        result = await compute_job_match(resume.parsed_data or {}, jd_text)
        resume.jd_match_score = float(result.get("score", 0))
        await session.commit()
    return {
        "matchScore": result["score"],
        "matchingSkills": result["matchedSkills"],
        "missingSkills": result["missingSkills"],
        "suggestions": [
            f"Missing skills: {', '.join(result['missingSkills'][:5])}" if result["missingSkills"] else "All key skills matched."
        ],
    }


@router.post("/grammar-check")
async def grammar_check(text: str = "", body: dict = None, uid: str = Depends(verify_token)):
    from app.services.grammar_checker import check_grammar
    if not text and body:
        text = body.get("text", "")
    if not text:
        raise HTTPException(400, "Text is required")
    return await check_grammar(text)
