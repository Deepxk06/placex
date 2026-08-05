from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.auth import verify_token
from app.models import User, Resume, Assessment, Interview, Prediction
from app.services.placement_predictor import predict_placement
from sqlalchemy import select
from datetime import datetime, timezone
import uuid

router = APIRouter()


@router.get("/placement")
async def get_placement_prediction(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        user = await session.get(User, uid)
        if not user:
            raise HTTPException(404, "User not found")
        stmt = select(Resume).where(Resume.user_id == uid).order_by(Resume.created_at.desc()).limit(1)
        resume = (await session.execute(stmt)).scalar_one_or_none()
        stmt = select(Assessment).where(Assessment.user_id == uid)
        assessments = (await session.execute(stmt)).scalars().all()
        aptitude_scores = [a for a in assessments if a.type == "aptitude"]
        latest_aptitude = aptitude_scores[-1] if aptitude_scores else None
        stmt = select(Interview).where(Interview.user_id == uid, Interview.status == "completed").order_by(Interview.created_at.desc()).limit(5)
        interviews = (await session.execute(stmt)).scalars().all()
        features = {
            "cgpa": user.cgpa or 0.0,
            "skillsCount": len(user.skills or []),
            "projectCount": len(user.projects or []),
            "resumeScore": resume.ats_score or 0,
            "aptitudeScore": (latest_aptitude.score / max(latest_aptitude.total, 1)) * 100 if latest_aptitude else 0,
            "interviewScore": interviews[0].overall_score if interviews else 0,
        }
        result = await predict_placement(features)
        now = datetime.now(timezone.utc)
        doc = Prediction(id=uuid.uuid4(), user_id=uid,
                         placement_probability=result["placementProbability"],
                         expected_salary=result["expectedSalary"],
                         predicted_role=result["predictedRole"],
                         skill_recommendations=result["skillRecommendations"],
                         features_used=features, created_at=now)
        session.add(doc)
        await session.commit()
    result["featuresUsed"] = features
    return result


@router.get("/salary")
async def get_salary_prediction(uid: str = Depends(verify_token)):
    return await get_placement_prediction(uid)


@router.get("/skill-recommend")
async def get_skill_recommendations(uid: str = Depends(verify_token)):
    result = await get_placement_prediction(uid)
    return {"recommendations": result["skillRecommendations"]}


@router.get("/history")
async def get_prediction_history(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(Prediction).where(Prediction.user_id == uid).order_by(Prediction.created_at.desc()).limit(10)
        result = await session.execute(stmt)
        preds = result.scalars().all()
        return [{c.name: str(getattr(p, c.name)) if isinstance(getattr(p, c.name), uuid.UUID) else getattr(p, c.name) for c in Prediction.__table__.columns} for p in preds]
