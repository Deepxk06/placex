from fastapi import APIRouter, Depends, HTTPException
from app.database import get_db
from app.auth import verify_token
from app.models import User, Resume, Assessment, Interview, Prediction, UserProfile
from app.schemas.profile import ProfileUpdate
from app.api.profile import serialize_profile, get_or_create_profile, apply_profile_update, sync_user_fields, log_activity
from sqlalchemy import select, func
from datetime import datetime, timezone
import uuid

router = APIRouter()


async def require_admin(session, uid: str):
    user = await session.get(User, uid)
    if not user or user.role != "admin":
        raise HTTPException(403, "Unauthorized. Admin access required.")
    return user


@router.get("/analytics")
async def get_admin_analytics(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        await require_admin(session, uid)
        total_students = (await session.execute(select(func.count()).select_from(User).where(User.role == "student"))).scalar()
        total_resumes = (await session.execute(select(func.count()).select_from(Resume))).scalar()
        total_assessments = (await session.execute(select(func.count()).select_from(Assessment))).scalar()
        total_interviews = (await session.execute(select(func.count()).select_from(Interview))).scalar()
        students = (await session.execute(select(User).where(User.role == "student").limit(1000))).scalars().all()
        cgpas = [s.cgpa for s in students if s.cgpa and s.cgpa > 0]
        avg_cgpa = round(sum(cgpas) / len(cgpas), 2) if cgpas else 0
        branches = {}
        for s in students:
            b = s.branch or "Unknown"
            branches[b] = branches.get(b, 0) + 1
        branch_stats = [{"branch": k, "count": v} for k, v in branches.items()]
        predictions = (await session.execute(select(Prediction).limit(100))).scalars().all()
        avg_placement_prob = round(
            sum(p.placement_probability or 0 for p in predictions) / max(len(predictions), 1) * 100, 2
        )
        return {
            "totalStudents": total_students,
            "totalResumes": total_resumes,
            "totalAssessments": total_assessments,
            "totalInterviews": total_interviews,
            "averageCgpa": avg_cgpa,
            "averagePlacementProbability": avg_placement_prob,
            "branchWiseStats": branch_stats,
        }


@router.get("/placement-stats")
async def get_placement_stats(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        await require_admin(session, uid)
        predictions = (await session.execute(select(Prediction).limit(500))).scalars().all()
        high = sum(1 for p in predictions if (p.placement_probability or 0) >= 0.7)
        medium = sum(1 for p in predictions if 0.4 <= (p.placement_probability or 0) < 0.7)
        low = sum(1 for p in predictions if (p.placement_probability or 0) < 0.4)
        return {
            "totalPredictions": len(predictions),
            "highChance": high,
            "mediumChance": medium,
            "lowChance": low,
            "averageSalary": round(
                sum(p.expected_salary or 0 for p in predictions) / max(len(predictions), 1), 2
            ),
        }


@router.get("/department-reports")
async def get_department_reports(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        await require_admin(session, uid)
        students = (await session.execute(select(User).where(User.role == "student").limit(1000))).scalars().all()
        departments = {}
        for s in students:
            branch = s.branch or "Unknown"
            if branch not in departments:
                departments[branch] = {"count": 0, "cgpaSum": 0, "cgpaCount": 0, "uids": []}
            departments[branch]["count"] += 1
            if s.cgpa and s.cgpa > 0:
                departments[branch]["cgpaSum"] += s.cgpa
                departments[branch]["cgpaCount"] += 1
            departments[branch]["uids"].append(s.uid)
        reports = []
        for branch, data in departments.items():
            avg_cgpa = round(data["cgpaSum"] / data["cgpaCount"], 2) if data["cgpaCount"] > 0 else 0
            stmt = select(Prediction).where(Prediction.user_id.in_(data["uids"])).limit(200)
            predictions = (await session.execute(stmt)).scalars().all()
            avg_prob = round(
                sum(p.placement_probability or 0 for p in predictions) / max(len(predictions), 1) * 100, 2
            )
            reports.append({
                "department": branch,
                "studentCount": data["count"],
                "averageCgpa": avg_cgpa,
                "averagePlacementProbability": avg_prob,
            })
        return reports


@router.post("/jobs/trigger-scrape")
async def trigger_job_scrape(uid: str = Depends(verify_token)):
    from app.tasks.scrape_jobs import scrape_all_jobs
    async with get_db()() as session:
        await require_admin(session, uid)
    message = await scrape_all_jobs()
    return {"message": message}


@router.get("/profiles")
async def list_student_profiles(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        await require_admin(session, uid)
        users = (await session.execute(
            select(User).where(User.role == "student").limit(1000)
        )).scalars().all()
        result = []
        for user in users:
            profile = await session.get(UserProfile, user.uid)
            result.append({
                "uid": user.uid,
                "name": user.name,
                "email": user.email,
                "college": user.college or "",
                "branch": user.branch or "",
                "hasPhoto": bool(profile and profile.photo),
                "isVerified": bool(profile and profile.is_verified),
                "completionPct": profile.completion_pct() if profile else 0,
                "lastUpdated": (profile.updated_at.isoformat() if profile and profile.updated_at else None),
            })
        return result


@router.get("/profiles/{target_uid}")
async def get_student_profile(target_uid: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        await require_admin(session, uid)
        profile = await get_or_create_profile(session, target_uid)
        user = await session.get(User, target_uid)
        if not user:
            raise HTTPException(404, "Student not found")
        return serialize_profile(profile, user)


@router.put("/profiles/{target_uid}")
async def update_student_profile(target_uid: str, payload: ProfileUpdate, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        await require_admin(session, uid)
        profile = await get_or_create_profile(session, target_uid)
        user = await session.get(User, target_uid)
        if not user:
            raise HTTPException(404, "Student not found")
        changed = apply_profile_update(profile, payload, user)
        sync_user_fields(profile, user)
        if changed:
            profile.updated_at = datetime.now(timezone.utc)
            log_activity(profile, "admin_updated", "Profile updated by admin")
        await session.commit()
        return serialize_profile(profile, user)
