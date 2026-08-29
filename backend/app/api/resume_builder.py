from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.auth import verify_token
from app.models import ResumeBuilder, User, UserProfile
from app.services.pdf_generator import generate_ats_pdf
from app.services.docx_generator import generate_resume_docx
from app.services.ats_scorer import calculate_ats_score
from app.services.ai_resume import generate_summary, improve_project_description, improve_experience_description, rewrite_summary
from app.services.resume_builder_service import (
    serialize_builder, default_sections, build_profile_import,
    sections_to_parsed_data, TEMPLATES, EXPERIENCE_LEVELS, estimate_page_count,
)
from app.services.resume_analyzer import analyze_resume
from app.services.jd_analyzer import analyze_job_description
from app.services.job_match import compute_job_match
from sqlalchemy import select
from datetime import datetime, timezone
import uuid
import copy

router = APIRouter()


def _lookup_builder(builder_id: str):
    try:
        return str(uuid.UUID(builder_id))
    except (ValueError, AttributeError):
        raise HTTPException(404, "Resume not found")


async def _get_owned_builder(session, builder_id: str, uid: str) -> ResumeBuilder:
    stmt = select(ResumeBuilder).where(ResumeBuilder.id == _lookup_builder(builder_id), ResumeBuilder.user_id == uid)
    builder = (await session.execute(stmt)).scalar_one_or_none()
    if not builder:
        raise HTTPException(404, "Resume not found")
    return builder


async def _get_profile_source(session, uid: str):
    user = await session.get(User, uid)
    if not user:
        raise HTTPException(404, "User profile not found")
    profile = (await session.execute(select(UserProfile).where(UserProfile.user_id == uid))).scalar_one_or_none()
    return user, profile


@router.get("/templates")
async def list_templates(uid: str = Depends(verify_token)):
    return {"templates": TEMPLATES, "targetRoles": [
        "Data Scientist", "Data Analyst", "ML Engineer", "AI Engineer",
        "Software Developer", "Frontend Developer", "Backend Developer",
        "Full Stack Developer", "Cloud Engineer", "DevOps Engineer",
    ], "experienceLevels": EXPERIENCE_LEVELS}


@router.get("/profile-source")
async def get_profile_source(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        user, profile = await _get_profile_source(session, uid)
        return build_profile_import(user, profile)


@router.get("/user")
async def list_user_resumes(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(ResumeBuilder).where(ResumeBuilder.user_id == uid).order_by(ResumeBuilder.updated_at.desc()).limit(20)
        result = await session.execute(stmt)
        return [serialize_builder(r) for r in result.scalars().all()]


@router.get("/{builder_id}")
async def get_resume(builder_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        builder = await _get_owned_builder(session, builder_id, uid)
        return serialize_builder(builder)


@router.post("/create")
async def create_resume(body: dict, uid: str = Depends(verify_token)):
    try:
        name = str(body.get("name") or "Untitled Resume").strip()[:120]
        target_role = str(body.get("targetRole") or "").strip()[:120]
        experience_level = str(body.get("experienceLevel") or "fresher").strip()[:40]
        template_id = str(body.get("templateId") or "classic")
        if template_id not in {t["id"] for t in TEMPLATES}:
            template_id = "classic"
        sections = body.get("sections") or default_sections()
        import_profile = bool(body.get("importProfile"))
        now = datetime.now(timezone.utc)
        doc = ResumeBuilder(
            id=str(uuid.uuid4()), user_id=uid, name=name, target_role=target_role,
            experience_level=experience_level, template_id=template_id,
            sections=copy.deepcopy(sections), created_at=now, updated_at=now,
        )
        async with get_db()() as session:
            session.add(doc)
            await session.commit()
            await session.refresh(doc)
            if import_profile:
                user, profile = await _get_profile_source(session, uid)
                imported = build_profile_import(user, profile)
                for section_name, payload in imported.items():
                    if section_name in {"summary"}:
                        continue
                    if not payload.get("available"):
                        continue
                    merged = [s for s in doc.sections if s.get("name") != section_name]
                    merged.append({"name": section_name, "data": copy.deepcopy(payload["data"])})
                    doc.sections = merged
                if not any(s.get("name") == "personalInfo" for s in doc.sections):
                    doc.sections.append({"name": "personalInfo", "data": {}})
                doc.updated_at = datetime.now(timezone.utc)
                await session.commit()
        return serialize_builder(doc)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{builder_id}")
async def update_resume(builder_id: str, body: dict, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        builder = await _get_owned_builder(session, builder_id, uid)
        version_changed = False
        if "sections" in body:
            if not isinstance(body["sections"], list):
                raise HTTPException(422, "sections must be a list")
            builder.sections = body["sections"]
            version_changed = True
        if "customizations" in body:
            builder.customizations = body["customizations"]
        for field, column, max_len in (
            ("name", "name", 120), ("targetRole", "target_role", 120),
            ("experienceLevel", "experience_level", 40),
        ):
            if field in body and body[field] is not None:
                setattr(builder, column, str(body[field]).strip()[:max_len])
        if "templateId" in body and body["templateId"]:
            template_id = str(body["templateId"])
            if template_id not in {t["id"] for t in TEMPLATES}:
                raise HTTPException(422, f"Unknown template: {template_id}")
            builder.template_id = template_id
        if version_changed:
            builder.version = (builder.version or 1) + 1
        builder.updated_at = datetime.now(timezone.utc)
        await session.commit()
        await session.refresh(builder)
    return serialize_builder(builder)


@router.put("/{builder_id}/section")
async def update_section(builder_id: str, section_name: str, data: dict, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        builder = await _get_owned_builder(session, builder_id, uid)
        sections = list(builder.sections or [])
        updated = False
        for s in sections:
            if s.get("name") == section_name:
                s["data"] = data
                updated = True
                break
        if not updated:
            sections.append({"name": section_name, "data": data})
        builder.sections = sections
        builder.version = (builder.version or 1) + 1
        builder.updated_at = datetime.now(timezone.utc)
        await session.commit()
    ats_result = await calculate_ats_score({"sections": sections})
    return {"message": "Section updated", "atsScore": ats_result, "version": builder.version}


@router.post("/{builder_id}/duplicate")
async def duplicate_resume(builder_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        builder = await _get_owned_builder(session, builder_id, uid)
        now = datetime.now(timezone.utc)
        new_doc = ResumeBuilder(
            id=str(uuid.uuid4()), user_id=uid,
            name=f"{builder.name or 'Untitled Resume'} (Copy)",
            target_role=builder.target_role or "",
            experience_level=builder.experience_level or "fresher",
            template_id=builder.template_id or "classic",
            version=1,
            sections=copy.deepcopy(builder.sections or []),
            customizations=copy.deepcopy(builder.customizations or {}),
            created_at=now, updated_at=now,
        )
        session.add(new_doc)
        await session.commit()
        await session.refresh(new_doc)
    return serialize_builder(new_doc)


@router.post("/{builder_id}/sync-profile")
async def sync_profile(builder_id: str, body: dict, uid: str = Depends(verify_token)):
    include = body.get("include") or ["personalInfo", "education", "skills", "projects", "experience"]
    if not isinstance(include, list) or not include:
        raise HTTPException(422, "include must be a non-empty list of section names")
    async with get_db()() as session:
        builder = await _get_owned_builder(session, builder_id, uid)
        user, profile = await _get_profile_source(session, uid)
        source = build_profile_import(user, profile)
        sections = list(builder.sections or [])
        applied = []
        for section_name in include:
            if section_name == "summary":
                continue
            payload = source.get(section_name)
            if not payload or not payload.get("available"):
                continue
            sections = [s for s in sections if s.get("name") != section_name]
            sections.append({"name": section_name, "data": copy.deepcopy(payload["data"])})
            applied.append(section_name)
        builder.sections = sections
        if applied:
            builder.version = (builder.version or 1) + 1
        builder.updated_at = datetime.now(timezone.utc)
        await session.commit()
        await session.refresh(builder)
    return {"imported": applied, "resume": serialize_builder(builder)}


@router.post("/{builder_id}/analyze")
async def analyze_builder_resume(builder_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        builder = await _get_owned_builder(session, builder_id, uid)
    parsed = sections_to_parsed_data(builder.sections or [])
    analysis = await analyze_resume(parsed)
    analysis["pageCount"] = estimate_page_count(parsed)
    return analysis


@router.post("/{builder_id}/optimize-jd")
async def optimize_for_jd(builder_id: str, body: dict, uid: str = Depends(verify_token)):
    jd_text = (body.get("jdText") or "").strip()
    if not jd_text:
        raise HTTPException(400, "Job description text is required")
    async with get_db()() as session:
        builder = await _get_owned_builder(session, builder_id, uid)
    parsed = sections_to_parsed_data(builder.sections or [])
    jd_analysis = await analyze_job_description(jd_text)
    match = await compute_job_match(parsed, jd_text, jd_analysis)
    return {"jobMatch": match}


@router.delete("/{builder_id}")
async def delete_resume(builder_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        builder = await _get_owned_builder(session, builder_id, uid)
        await session.delete(builder)
        await session.commit()
    return {"message": "Resume deleted"}


@router.post("/{builder_id}/preview")
async def preview_resume(builder_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        builder = await _get_owned_builder(session, builder_id, uid)
        pdf_bytes = await generate_ats_pdf(builder.sections, builder.template_id or "classic")
    from fastapi.responses import Response
    return Response(content=pdf_bytes, media_type="application/pdf",
                    headers={"Content-Disposition": "inline; filename=resume_preview.pdf"})


@router.post("/{builder_id}/export")
async def export_resume(builder_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        builder = await _get_owned_builder(session, builder_id, uid)
        pdf_bytes = await generate_ats_pdf(builder.sections, builder.template_id or "classic")
    from fastapi.responses import Response
    name = (builder.name or "resume").replace(" ", "_")
    return Response(content=pdf_bytes, media_type="application/pdf",
                    headers={"Content-Disposition": f"attachment; filename={name}.pdf"})


@router.post("/{builder_id}/export-docx")
async def export_resume_docx(builder_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        builder = await _get_owned_builder(session, builder_id, uid)
        docx_bytes = await generate_resume_docx(builder.sections, builder.template_id or "classic")
    from fastapi.responses import Response
    name = (builder.name or "resume").replace(" ", "_")
    return Response(content=docx_bytes, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    headers={"Content-Disposition": f"attachment; filename={name}.docx"})


@router.post("/ats-score")
async def get_builder_ats_score(body: dict, uid: str = Depends(verify_token)):
    result = await calculate_ats_score({"sections": body.get("sections", [])})
    return result


@router.post("/ai-summary")
async def get_ai_summary(body: dict, uid: str = Depends(verify_token)):
    sections = body.get("sections", [])
    text = str(body.get("text") or "").strip()
    action = str(body.get("action") or "improve")
    target_role = str(body.get("targetRole") or "")
    if text:
        summary = await rewrite_summary(text, action, target_role)
    else:
        summary = await generate_summary({"sections": sections})
    if not summary or "unavailable" in summary.lower():
        raise HTTPException(503, "AI service unavailable. Please try again later.")
    return {"summary": summary}


@router.post("/improve-project")
async def improve_project(body: dict, uid: str = Depends(verify_token)):
    description = body.get("description", "")
    if not description:
        raise HTTPException(400, "Description is required")
    improved = await improve_project_description(description)
    if not improved or "unavailable" in improved.lower():
        raise HTTPException(503, "AI service unavailable. Please try again later.")
    return {"improved": improved}


@router.post("/improve-experience")
async def improve_experience(body: dict, uid: str = Depends(verify_token)):
    description = body.get("description", "")
    if not description:
        raise HTTPException(400, "Description is required")
    improved = await improve_experience_description(description)
    if not improved or "unavailable" in improved.lower():
        raise HTTPException(503, "AI service unavailable. Please try again later.")
    return {"improved": improved}