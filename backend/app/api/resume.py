from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from app.database import get_db
from app.auth import verify_token
from app.models import Resume
from app.services.resume_parser import parse_resume_pdf
from app.services.ats_scorer import calculate_ats_score
from app.services.resume_matcher import match_resume_to_jd
from sqlalchemy import select
from datetime import datetime, timezone
import uuid

router = APIRouter()


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...), uid: str = Depends(verify_token)):
    async with get_db()() as session:
        content = await file.read()
        parsed = await parse_resume_pdf(content, file.filename)
        doc = Resume(id=uuid.uuid4(), user_id=uid, original_file=file.filename, parsed_data=parsed, created_at=datetime.now(timezone.utc))
        session.add(doc)
        await session.commit()
    return {"id": str(doc.id), "parsedData": parsed}


@router.get("/{resume_id}")
async def get_resume(resume_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        resume = await session.get(Resume, uuid.UUID(resume_id))
        if not resume:
            raise HTTPException(404, "Resume not found")
        return {c.name: getattr(resume, c.name) for c in Resume.__table__.columns}


@router.post("/{resume_id}/ats-score")
async def get_ats_score(resume_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        resume = await session.get(Resume, uuid.UUID(resume_id))
        if not resume:
            raise HTTPException(404, "Resume not found")
        ats_result = await calculate_ats_score(resume.parsed_data or {})
        resume.ats_score = ats_result.overall
        await session.commit()
    return ats_result


@router.post("/{resume_id}/match-jd")
async def match_job_description(resume_id: str, jd_text: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        resume = await session.get(Resume, uuid.UUID(resume_id))
        if not resume:
            raise HTTPException(404, "Resume not found")
        result = await match_resume_to_jd(resume.parsed_data or {}, jd_text)
        resume.jd_match_score = result.matchScore
        await session.commit()
    return result


@router.post("/grammar-check")
async def grammar_check(text: str, uid: str = Depends(verify_token)):
    from app.services.grammar_checker import check_grammar
    result = await check_grammar(text)
    return result


@router.get("/")
async def list_resumes(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(Resume).where(Resume.user_id == uid).order_by(Resume.created_at.desc()).limit(20)
        result = await session.execute(stmt)
        resumes = result.scalars().all()
        return [{c.name: str(getattr(r, c.name)) if isinstance(getattr(r, c.name), uuid.UUID) else getattr(r, c.name) for c in Resume.__table__.columns} for r in resumes]
