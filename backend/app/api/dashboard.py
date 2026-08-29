from fastapi import APIRouter, Depends
from app.database import get_db
from app.auth import verify_token
from app.models import User, Resume, Assessment, Interview, Prediction
from sqlalchemy import select
from datetime import datetime, timezone

router = APIRouter()


@router.get("/student")
async def get_student_dashboard(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        user = await session.get(User, uid)
        stmt = select(Resume).where(Resume.user_id == uid).order_by(Resume.created_at.desc()).limit(1)
        resume = (await session.execute(stmt)).scalar_one_or_none()
        stmt = select(Assessment).where(Assessment.user_id == uid)
        assessments = (await session.execute(stmt)).scalars().all()
        stmt = select(Interview).where(Interview.user_id == uid, Interview.status == "completed").order_by(Interview.created_at.desc()).limit(10)
        interviews = (await session.execute(stmt)).scalars().all()
        stmt = select(Prediction).where(Prediction.user_id == uid).order_by(Prediction.created_at.desc()).limit(1)
        prediction = (await session.execute(stmt)).scalar_one_or_none()
        resume_score = resume.ats_score if resume else None
        coding_assessments = [a for a in assessments if a.type == "coding"]
        aptitude_assessments = [a for a in assessments if a.type == "aptitude"]
        coding_progress = {
            "attempted": len(coding_assessments),
            "passed": sum(1 for a in coding_assessments if a.score == a.total and a.total > 0),
            "avgScore": round(sum((a.score or 0) / max((a.total or 1), 1) * 100 for a in coding_assessments) / max(len(coding_assessments), 1), 2),
        }
        aptitude_progress = {
            "attempted": len(aptitude_assessments),
            "avgScore": round(sum((a.score or 0) / max((a.total or 1), 1) * 100 for a in aptitude_assessments) / max(len(aptitude_assessments), 1), 2),
        }
        interview_performance = {
            "completed": len(interviews),
            "avgScore": round(sum(i.overall_score or 0 for i in interviews) / max(len(interviews), 1), 2),
        }
        readiness = compute_readiness(resume_score, coding_progress, aptitude_progress, interview_performance, prediction)
        recent = []
        if resume:
            recent.append({"type": "resume", "message": "Resume uploaded", "time": resume.created_at})
        for a in assessments[-5:]:
            recent.append({"type": a.type, "message": f"{a.type} completed: {a.score}/{a.total}",
                           "time": a.completed_at})
        for i in interviews[:3]:
            recent.append({"type": "interview", "message": f"Interview: {i.overall_score}%",
                           "time": i.completed_at})
        return {
            "resumeScore": resume_score,
            "codingProgress": coding_progress,
            "aptitudeProgress": aptitude_progress,
            "interviewScore": interview_performance["avgScore"],
            "interviewPerformance": interview_performance,
            "placementReadiness": readiness,
            "recentActivity": sorted(recent, key=lambda x: x.get("time") or datetime.min.replace(tzinfo=timezone.utc), reverse=True)[:10],
            "userProfile": {
                "name": user.name if user else "",
                "college": user.college if user else "",
                "branch": user.branch if user else "",
                "gradYear": user.grad_year if user else None,
                "targetRole": user.target_role if user else "",
                "skills": user.skills if user else [],
                "cgpa": user.cgpa if user else 0.0,
            },
        }


@router.get("/readiness")
async def get_readiness_score(uid: str = Depends(verify_token)):
    dashboard = await get_student_dashboard(uid)
    return {"placementReadiness": dashboard["placementReadiness"]}


def compute_readiness(resume_score, coding, aptitude, interview, prediction):
    weights = {"resume": 0.2, "coding": 0.2, "aptitude": 0.15, "interview": 0.15, "prediction": 0.3}
    score = 0.0
    if resume_score:
        score += (resume_score / 100) * weights["resume"]
    if coding["attempted"] > 0:
        score += (coding["avgScore"] / 100) * weights["coding"]
    if aptitude["attempted"] > 0:
        score += (aptitude["avgScore"] / 100) * weights["aptitude"]
    if interview["completed"] > 0:
        score += (interview["avgScore"] / 100) * weights["interview"]
    if prediction:
        prob = prediction.placement_probability or 0
        score += prob * weights["prediction"]
    return round(min(score * 100, 100), 2)
