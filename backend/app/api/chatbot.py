from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.auth import verify_token
from app.models import ChatHistory, User
from app.services.chatbot_service import chat_with_groq
from sqlalchemy import select
from datetime import datetime, timezone

router = APIRouter()


@router.post("/message")
async def send_message(message: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        user = await session.get(User, uid)
        if not user:
            raise HTTPException(404, "User not found")
        now = datetime.now(timezone.utc)
        session.add(ChatHistory(user_id=uid, role="user", content=message, created_at=now))
        context = {
            "name": user.name or "",
            "college": user.college or "",
            "branch": user.branch or "",
            "cgpa": user.cgpa or 0,
            "skills": user.skills or [],
            "targetRole": user.target_role or "",
        }
        reply = await chat_with_groq(message, context)
        session.add(ChatHistory(user_id=uid, role="assistant", content=reply, created_at=datetime.now(timezone.utc)))
        await session.commit()
    return {"reply": reply, "timestamp": datetime.now(timezone.utc).isoformat()}


@router.post("/domain-recommend")
async def get_domain_recommendation(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        user = await session.get(User, uid)
        if not user:
            raise HTTPException(404, "User not found")
        skills = user.skills or []
        prompt = f"""
        Based on the following student profile, recommend the best career domain:
        Skills: {skills}
        CGPA: {user.cgpa}
        Branch: {user.branch}
        Provide: domain name, match score (0-100), and reason.
        """
        reply = await chat_with_groq(prompt, {"name": user.name or ""})
    return {"recommendation": reply}


@router.get("/history")
async def get_chat_history(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(ChatHistory).where(ChatHistory.user_id == uid).order_by(ChatHistory.created_at)
        result = await session.execute(stmt)
        messages = result.scalars().all()
        return [{"id": m.id, "role": m.role, "content": m.content, "createdAt": m.created_at.isoformat()} for m in messages]
