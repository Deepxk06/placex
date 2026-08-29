from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.auth import verify_token
from app.models import JobApplication
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta

router = APIRouter()

VALID_STATUSES = ["applied", "reviewing", "interview", "offer", "rejected", "accepted", "withdrawn"]

class JobApplicationCreate(BaseModel):
    job_id: Optional[int] = None
    job_title: str
    company: str
    notes: Optional[str] = None

class JobApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

@router.get("/")
async def list_applications(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        applications = (
            await session.execute(
                JobApplication.__table__.select()
                .where(JobApplication.user_id == uid)
                .order_by(JobApplication.applied_at.desc())
            )
        ).fetchall()
        return [dict(app) for app in applications]

@router.post("/")
async def create_application(body: JobApplicationCreate, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        new_app = JobApplication(
            user_id=uid,
            job_id=body.job_id,
            job_title=body.job_title,
            company=body.company,
            notes=body.notes,
            status="applied",
            applied_at=datetime.now(timezone.utc),
        )
        session.add(new_app)
        await session.commit()
        await session.refresh(new_app)
        return {"message": "Application created", "id": new_app.id}

@router.put("/{app_id}")
async def update_application(app_id: str, body: JobApplicationUpdate, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        app = await session.get(JobApplication, app_id)
        if not app or app.user_id != uid:
            raise HTTPException(status_code=404, detail="Application not found")
        if body.status is not None:
            if body.status not in VALID_STATUSES:
                raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {VALID_STATUSES}")
            app.status = body.status
        if body.notes is not None:
            app.notes = body.notes
        await session.commit()
        return {"message": "Application updated"}

@router.delete("/{app_id}")
async def delete_application(app_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        app = await session.get(JobApplication, app_id)
        if not app or app.user_id != uid:
            raise HTTPException(status_code=404, detail="Application not found")
        await session.delete(app)
        await session.commit()
        return {"message": "Application deleted"}

@router.get("/stats")
async def get_stats(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        applications = (
            await session.execute(
                JobApplication.__table__.select().where(JobApplication.user_id == uid)
            )
        ).fetchall()
        total = len(applications)
        by_status = {}
        recent_count = 0
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        for app in applications:
            status = app.status
            by_status[status] = by_status.get(status, 0) + 1
            if app.applied_at and app.applied_at >= thirty_days_ago:
                recent_count += 1
        return {
            "total": total,
            "by_status": by_status,
            "recent_count": recent_count,
        }
