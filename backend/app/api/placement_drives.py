from fastapi import APIRouter, Depends, HTTPException, Body
from app.database import get_db
from app.auth import verify_token
from app.models import PlacementDrive, PlacementDriveRegistration, User, Notification
from sqlalchemy import select, func
from datetime import datetime, timezone

router = APIRouter()


@router.get("/")
async def list_drives(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(PlacementDrive).order_by(PlacementDrive.drive_date.desc())
        result = await session.execute(stmt)
        drives = result.scalars().all()
        items = []
        for d in drives:
            reg_stmt = select(func.count(PlacementDriveRegistration.id)).where(
                PlacementDriveRegistration.drive_id == d.id
            )
            reg_count = (await session.execute(reg_stmt)).scalar() or 0
            is_registered = False
            r = await session.execute(
                select(PlacementDriveRegistration).where(
                    PlacementDriveRegistration.drive_id == d.id,
                    PlacementDriveRegistration.user_id == uid,
                )
            )
            is_registered = r.scalar_one_or_none() is not None
            user = await session.get(User, uid)
            eligible = True
            if user and d.eligibility_cgpa > 0 and (user.cgpa or 0) < d.eligibility_cgpa:
                eligible = False
            if user and d.eligible_branches and len(d.eligible_branches) > 0:
                if user.branch and user.branch not in d.eligible_branches:
                    eligible = False
            items.append({
                "id": d.id, "company_name": d.company_name, "role": d.role,
                "description": d.description, "location": d.location,
                "salary_range": d.salary_range, "eligibility_cgpa": d.eligibility_cgpa,
                "eligible_branches": d.eligible_branches, "required_skills": d.required_skills,
                "drive_date": d.drive_date.isoformat() if d.drive_date else "",
                "application_deadline": d.application_deadline.isoformat() if d.application_deadline else "",
                "total_positions": d.total_positions, "status": d.status,
                "registrations": reg_count, "is_registered": is_registered, "eligible": eligible,
            })
        return items


@router.post("/")
async def create_drive(payload: dict = Body(...), uid: str = Depends(verify_token)):
    async with get_db()() as session:
        now = datetime.now(timezone.utc)
        drive = PlacementDrive(
            company_name=payload["company_name"],
            role=payload["role"],
            description=payload.get("description", ""),
            location=payload.get("location", ""),
            salary_range=payload.get("salary_range", ""),
            eligibility_cgpa=payload.get("eligibility_cgpa", 0.0),
            eligible_branches=payload.get("eligible_branches", []),
            required_skills=payload.get("required_skills", []),
            drive_date=payload.get("drive_date"),
            application_deadline=payload.get("application_deadline"),
            total_positions=payload.get("total_positions", 0),
            status=payload.get("status", "upcoming"),
            created_by=uid,
            created_at=now,
        )
        session.add(drive)
        await session.commit()
        await session.refresh(drive)
        return {"id": drive.id, "message": "Drive created"}


@router.post("/{drive_id}/register")
async def register_drive(drive_id: int, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        drive = await session.get(PlacementDrive, drive_id)
        if not drive:
            raise HTTPException(404, "Drive not found")
        existing = await session.execute(
            select(PlacementDriveRegistration).where(
                PlacementDriveRegistration.drive_id == drive_id,
                PlacementDriveRegistration.user_id == uid,
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(400, "Already registered")
        reg = PlacementDriveRegistration(
            drive_id=drive_id, user_id=uid, registered_at=datetime.now(timezone.utc)
        )
        session.add(reg)
        n = Notification(
            user_id=uid, title="Drive Registration Confirmed",
            message=f"You have registered for {drive.company_name} - {drive.role}",
            type="success", link="/applications",
            created_at=datetime.now(timezone.utc),
        )
        session.add(n)
        await session.commit()
    return {"message": "Registered successfully"}


@router.get("/my-registrations")
async def my_registrations(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = (
            select(PlacementDrive, PlacementDriveRegistration)
            .join(PlacementDriveRegistration, PlacementDriveRegistration.drive_id == PlacementDrive.id)
            .where(PlacementDriveRegistration.user_id == uid)
        )
        result = await session.execute(stmt)
        rows = result.all()
        return [{
            "drive_id": d.id, "company_name": d.company_name, "role": d.role,
            "drive_date": d.drive_date.isoformat() if d.drive_date else "",
            "status": d.status, "registration_status": r.status,
        } for d, r in rows]
