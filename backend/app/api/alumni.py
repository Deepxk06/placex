from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.auth import verify_token
from app.models import User, ConnectRequest
from sqlalchemy import select, or_
from datetime import datetime, timezone
import uuid

router = APIRouter()


@router.get("/recommended")
async def get_alumni_recommendations(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        user = await session.get(User, uid)
        if not user:
            raise HTTPException(404, "User not found")
        stmt = select(User).where(User.role == "alumni", User.college == user.college, User.uid != uid)
        alumni = (await session.execute(stmt)).scalars().all()
        scored = []
        for alum in alumni:
            score = 0.0
            if alum.branch == user.branch:
                score += 40
            elif alum.branch:
                score += 20
            if alum.current_role and user.target_role:
                if any(w in alum.current_role.lower() for w in user.target_role.lower().split()):
                    score += 25
            if alum.mentorship_available:
                score += 10
            user_skills = set(s.lower() for s in (user.skills or []))
            alum_skills = set(s.lower() for s in (alum.expertise or []))
            common = user_skills & alum_skills
            score += min(len(common) * 3, 15)
            scored.append({
                "alumni": {
                    "_id": alum.uid,
                    "name": alum.name or "",
                    "currentCompany": alum.current_company or "",
                    "currentRole": alum.current_role or "",
                    "branch": alum.branch or "",
                    "gradYear": alum.grad_year or "",
                    "expertise": alum.expertise or [],
                    "mentorshipAvailable": alum.mentorship_available or False,
                    "linkedIn": alum.linked_in or "",
                },
                "matchScore": min(score, 100),
                "commonSkills": list(common),
            })
        scored.sort(key=lambda x: x["matchScore"], reverse=True)
    return scored[:20]


@router.get("/{alumni_id}")
async def get_alumni_profile(alumni_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(User).where(User.uid == alumni_id, User.role == "alumni")
        alum = (await session.execute(stmt)).scalar_one_or_none()
        if not alum:
            raise HTTPException(404, "Alumni not found")
        return {
            "_id": alum.uid, "name": alum.name or "", "currentCompany": alum.current_company or "",
            "currentRole": alum.current_role or "", "branch": alum.branch or "",
            "gradYear": alum.grad_year or "", "expertise": alum.expertise or [],
            "mentorshipAvailable": alum.mentorship_available or False, "linkedIn": alum.linked_in or "",
        }


@router.post("/connect-request")
async def send_connect_request(alumni_id: str, message: str = "", uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(ConnectRequest).where(
            ConnectRequest.from_user_id == uid, ConnectRequest.to_user_id == alumni_id,
            ConnectRequest.status == "pending",
        )
        existing = (await session.execute(stmt)).scalar_one_or_none()
        if existing:
            raise HTTPException(400, "Connect request already sent")
        now = datetime.now(timezone.utc)
        doc = ConnectRequest(id=str(uuid.uuid4()), from_user_id=uid, to_user_id=alumni_id,
                             status="pending", message=message, created_at=now, updated_at=now)
        session.add(doc)
        await session.commit()
    return {"message": "Connect request sent", "id": str(doc.id)}
