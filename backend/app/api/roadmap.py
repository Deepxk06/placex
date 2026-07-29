from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.auth import verify_token
from app.models import User, Roadmap
from app.services.roadmap_generator import generate_roadmap
from app.services.skill_gap_analyzer import analyze_skill_gap
from sqlalchemy import select
from datetime import datetime, timezone

router = APIRouter()


@router.get("/generate")
async def get_roadmap(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        user = await session.get(User, uid)
        if not user:
            raise HTTPException(404, "User not found")
        skill_gap = await analyze_skill_gap(user.skills or [], user.target_role or "")
        rm = await generate_roadmap(user, skill_gap)
        now = datetime.now(timezone.utc)
        doc = Roadmap(user_id=uid, career_goal=user.target_role or "", timeline=rm.get("timeline", []),
                      milestones=rm.get("milestones", []), daily_goals=rm.get("dailyGoals", []),
                      certifications=rm.get("certifications", []), created_at=now, updated_at=now)
        session.add(doc)
        await session.commit()
    return rm


@router.get("/daily-goals")
async def get_daily_goals(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(Roadmap).where(Roadmap.user_id == uid).order_by(Roadmap.created_at.desc()).limit(1)
        result = await session.execute(stmt)
        rm = result.scalar_one_or_none()
        if not rm:
            return {"dailyGoals": ["Complete a coding challenge", "Update your resume", "Practice aptitude questions"]}
        goals = rm.daily_goals or []
        return {"dailyGoals": goals[:3]}


@router.get("/certifications")
async def get_certifications(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(Roadmap).where(Roadmap.user_id == uid).order_by(Roadmap.created_at.desc()).limit(1)
        result = await session.execute(stmt)
        rm = result.scalar_one_or_none()
        if not rm:
            return {"certifications": []}
        return {"certifications": rm.certifications or []}
