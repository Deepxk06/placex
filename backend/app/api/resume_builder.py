from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.auth import verify_token
from app.models import ResumeTemplate, ResumeBuilder
from app.services.pdf_generator import generate_ats_pdf
from app.services.ats_scorer import calculate_ats_score
from sqlalchemy import select
from datetime import datetime, timezone
import uuid

router = APIRouter()


@router.get("/templates")
async def get_templates(role: str = "", uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(ResumeTemplate)
        if role:
            stmt = stmt.where(ResumeTemplate.target_role == role)
        result = await session.execute(stmt.limit(20))
        templates = result.scalars().all()
        return [{c.name: str(getattr(t, c.name)) if isinstance(getattr(t, c.name), uuid.UUID) else getattr(t, c.name) for c in ResumeTemplate.__table__.columns} for t in templates]


@router.post("/create")
async def create_resume(template_id: str, sections: list, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        template = await session.get(ResumeTemplate, uuid.UUID(template_id))
        if not template:
            raise HTTPException(404, "Template not found")
        now = datetime.now(timezone.utc)
        doc = ResumeBuilder(id=uuid.uuid4(), user_id=uid, template_id=template_id, sections=sections, created_at=now, updated_at=now)
        session.add(doc)
        await session.commit()
    return {"id": str(doc.id)}


@router.put("/{builder_id}/section")
async def update_section(builder_id: str, section_name: str, data: dict, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(ResumeBuilder).where(ResumeBuilder.id == uuid.UUID(builder_id), ResumeBuilder.user_id == uid)
        builder = (await session.execute(stmt)).scalar_one_or_none()
        if not builder:
            raise HTTPException(404, "Resume builder not found")
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


@router.post("/{builder_id}/preview")
async def preview_resume(builder_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(ResumeBuilder).where(ResumeBuilder.id == uuid.UUID(builder_id), ResumeBuilder.user_id == uid)
        builder = (await session.execute(stmt)).scalar_one_or_none()
        if not builder:
            raise HTTPException(404, "Resume builder not found")
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
            raise HTTPException(404, "Resume builder not found")
        pdf_bytes = await generate_ats_pdf(builder.sections)
    from fastapi.responses import Response
    return Response(content=pdf_bytes, media_type="application/pdf",
                    headers={"Content-Disposition": "attachment; filename=resume.pdf"})


@router.post("/ats-score")
async def get_builder_ats_score(body: dict, uid: str = Depends(verify_token)):
    result = await calculate_ats_score({"sections": body.get("sections", [])})
    return result
