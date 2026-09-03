from fastapi import APIRouter, Depends, HTTPException, Body
from app.database import get_db
from app.auth import verify_token
from app.models import Notification
from sqlalchemy import select, func, update
from datetime import datetime, timezone

router = APIRouter()


@router.get("/")
async def get_notifications(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = (
            select(Notification)
            .where(Notification.user_id == uid)
            .order_by(Notification.created_at.desc())
            .limit(50)
        )
        result = await session.execute(stmt)
        notifications = result.scalars().all()
        return [{
            "id": n.id, "title": n.title, "message": n.message,
            "type": n.type, "link": n.link, "is_read": n.is_read,
            "created_at": n.created_at.isoformat() if n.created_at else "",
        } for n in notifications]


@router.get("/unread-count")
async def get_unread_count(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(func.count(Notification.id)).where(
            Notification.user_id == uid, Notification.is_read == False
        )
        count = (await session.execute(stmt)).scalar() or 0
        return {"count": count}


@router.post("/read")
async def mark_as_read(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = (
            update(Notification)
            .where(Notification.user_id == uid, Notification.is_read == False)
            .values(is_read=True)
        )
        await session.execute(stmt)
        await session.commit()
    return {"message": "All notifications marked as read"}


@router.post("/{notification_id}/read")
async def mark_single_read(notification_id: int, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = (
            update(Notification)
            .where(Notification.id == notification_id, Notification.user_id == uid)
            .values(is_read=True)
        )
        await session.execute(stmt)
        await session.commit()
    return {"message": "Notification marked as read"}


@router.post("/create")
async def create_notification(payload: dict = Body(...), uid: str = Depends(verify_token)):
    async with get_db()() as session:
        now = datetime.now(timezone.utc)
        n = Notification(
            user_id=payload.get("user_id", uid),
            title=payload["title"],
            message=payload["message"],
            type=payload.get("type", "info"),
            link=payload.get("link", ""),
            created_at=now,
        )
        session.add(n)
        await session.commit()
        await session.refresh(n)
        return {"id": n.id, "message": "Notification created"}
