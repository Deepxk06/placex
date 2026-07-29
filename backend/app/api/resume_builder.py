from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.auth import verify_token
from app.models import ResumeBuilder
from app.services.pdf_generator import generate_ats_pdf
from app.services.ats_scorer import calculate_ats_score
from app.services.ai_resume import generate_summary, improve_project_description, improve_experience_description
from sqlalchemy import select
from datetime import datetime, timezone
import uuid

router = APIRouter()


@router.get("/user")
async def list_user_resumes(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(ResumeBuilder).where(ResumeBuilder.user_id == uid).order_by(ResumeBuilder.updated_at.desc()).limit(20)
        result = await session.execute(stmt)
        resumes = result.scalars().all()
        return [{
            "id": str(r.id),
            "templateId": r.template_id,
            "sections": r.sections,
            "customizations": r.customizations,
            "createdAt": r.created_at.isoformat() if r.created_at else None,
            "updatedAt": r.updated_at.isoformat() if r.updated_at else None,
        } for r in resumes]


@router.get("/{builder_id}")
async def get_resume(builder_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(ResumeBuilder).where(ResumeBuilder.id == uuid.UUID(builder_id), ResumeBuilder.user_id == uid)
        builder = (await session.execute(stmt)).scalar_one_or_none()
        if not builder:
            raise HTTPException(404, "Resume not found")
        return {
            "id": str(builder.id),
            "templateId": builder.template_id,
            "sections": builder.sections,
            "customizations": builder.customizations,
            "createdAt": builder.created_at.isoformat() if builder.created_at else None,
            "updatedAt": builder.updated_at.isoformat() if builder.updated_at else None,
        }


@router.post("/create")
async def create_resume(body: dict, uid: str = Depends(verify_token)):
    sections = body.get("sections", [])
    template_id = body.get("templateId", "")
    now = datetime.now(timezone.utc)
    doc = ResumeBuilder(
        id=uuid.uuid4(), user_id=uid, template_id=template_id,
        sections=sections, created_at=now, updated_at=now,
    )
    async with get_db()() as session:
        session.add(doc)
        await session.commit()
    return {"id": str(doc.id)}


@router.put("/{builder_id}")
async def update_resume(builder_id: str, body: dict, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(ResumeBuilder).where(ResumeBuilder.id == uuid.UUID(builder_id), ResumeBuilder.user_id == uid)
        builder = (await session.execute(stmt)).scalar_one_or_none()
        if not builder:
            raise HTTPException(404, "Resume not found")
        if "sections" in body:
            builder.sections = body["sections"]
        if "customizations" in body:
            builder.customizations = body["customizations"]
        builder.updated_at = datetime.now(timezone.utc)
        await session.commit()
    return {"message": "Resume updated"}


@router.put("/{builder_id}/section")
async def update_section(builder_id: str, section_name: str, data: dict, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(ResumeBuilder).where(ResumeBuilder.id == uuid.UUID(builder_id), ResumeBuilder.user_id == uid)
        builder = (await session.execute(stmt)).scalar_one_or_none()
        if not builder:
            raise HTTPException(404, "Resume not found")
        sections = builder.sections or []
        updated = False
        for s in sections:
            if s.get("name") == section_name:
                s["data"] = data
                updated = True
                break
        if not updated:
            sections.append({"name": section_name, "data": data})
        builder.sections = sections
        builder.updated_at = datetime.now(timezone.utc)
        await session.commit()
    ats_result = await calculate_ats_score({"sections": sections})
    return {"message": "Section updated", "atsScore": ats_result}


@router.delete("/{builder_id}")
async def delete_resume(builder_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(ResumeBuilder).where(ResumeBuilder.id == uuid.UUID(builder_id), ResumeBuilder.user_id == uid)
        builder = (await session.execute(stmt)).scalar_one_or_none()
        if not builder:
            raise HTTPException(404, "Resume not found")
        await session.delete(builder)
        await session.commit()
    return {"message": "Resume deleted"}


@router.post("/{builder_id}/preview")
async def preview_resume(builder_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(ResumeBuilder).where(ResumeBuilder.id == uuid.UUID(builder_id), ResumeBuilder.user_id == uid)
        builder = (await session.execute(stmt)).scalar_one_or_none()
        if not builder:
            raise HTTPException(404, "Resume not found")
        pdf_bytes = await generate_ats_pdf(builder.sections)
    from fastapi.responses import Response
    return Response(content=pdf_bytes, media_type="application/pdf",
                    headers={"Content-Disposition": "inline; filename=resume_preview.pdf"})


@router.post("/{builder_id}/export")
async def export_resume(builder_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(ResumeBuilder).where(ResumeBuilder.id == uuid.UUID(builder_id), ResumeBuilder.user_id == uid)
        builder = (await session.execute(stmt)).scalar_one_or_none()
        if not builder:
            raise HTTPException(404, "Resume not found")
        pdf_bytes = await generate_ats_pdf(builder.sections)
    from fastapi.responses import Response
    return Response(content=pdf_bytes, media_type="application/pdf",
                    headers={"Content-Disposition": "attachment; filename=resume.pdf"})


@router.post("/ats-score")
async def get_builder_ats_score(body: dict, uid: str = Depends(verify_token)):
    result = await calculate_ats_score({"sections": body.get("sections", [])})
    return result


@router.post("/ai-summary")
async def get_ai_summary(body: dict, uid: str = Depends(verify_token)):
    sections = body.get("sections", [])
    summary = await generate_summary({"sections": sections})
    return {"summary": summary}


@router.post("/improve-project")
async def improve_project(body: dict, uid: str = Depends(verify_token)):
    description = body.get("description", "")
    if not description:
        raise HTTPException(400, "Description is required")
    improved = await improve_project_description(description)
    return {"improved": improved}


@router.post("/improve-experience")
async def improve_experience(body: dict, uid: str = Depends(verify_token)):
    description = body.get("description", "")
    if not description:
        raise HTTPException(400, "Description is required")
    improved = await improve_experience_description(description)
    return {"improved": improved}
