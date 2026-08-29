from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.auth import verify_token
from app.models import LearningTopic, LearningProgress, User
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone

router = APIRouter()


class ProgressUpdate(BaseModel):
    topic_id: int
    progress_pct: float
    score: Optional[float] = None


@router.get("/topics")
async def list_topics(
    career_type: Optional[str] = None,
    uid: str = Depends(verify_token),
):
    async with get_db()() as session:
        user_result = await session.execute(select(User).where(User.uid == uid))
        user = user_result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        query = select(LearningTopic, LearningProgress).outerjoin(
            LearningProgress,
            (LearningTopic.id == LearningProgress.topic_id)
            & (LearningProgress.user_id == uid),
        )

        filter_type = career_type or user.career_type
        if filter_type:
            query = query.where(LearningTopic.career_type == filter_type)

        result = await session.execute(query)
        rows = result.all()

        topics = []
        for topic, progress in rows:
            topics.append(
                {
                    "id": topic.id,
                    "title": topic.name,
                    "description": topic.description,
                    "career_type": topic.career_type,
                    "difficulty": topic.difficulty,
                    "progress_pct": progress.progress_pct if progress else 0.0,
                    "score": progress.score if progress else None,
                }
            )

        return {"topics": topics}


@router.get("/topics/{topic_id}")
async def get_topic(topic_id: int, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        result = await session.execute(
            select(LearningTopic, LearningProgress)
            .outerjoin(
                LearningProgress,
                (LearningTopic.id == LearningProgress.topic_id)
                & (LearningProgress.user_id == uid),
            )
            .where(LearningTopic.id == topic_id)
        )
        row = result.one_or_none()
        if not row:
            raise HTTPException(status_code=404, detail="Topic not found")

        topic, progress = row
        return {
            "id": topic.id,
            "title": topic.name,
            "description": topic.description,
            "career_type": topic.career_type,
            "difficulty": topic.difficulty,
            "content": topic.description,
            "progress_pct": progress.progress_pct if progress else 0.0,
            "score": progress.score if progress else None,
            "completed": (progress.progress_pct == 100.0) if progress else False,
        }


@router.post("/progress")
async def update_progress(body: ProgressUpdate, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        result = await session.execute(
            select(LearningProgress).where(
                LearningProgress.user_id == uid,
                LearningProgress.topic_id == body.topic_id,
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            existing.progress_pct = body.progress_pct
            existing.score = body.score
            existing.last_accessed = datetime.now(timezone.utc)
        else:
            progress = LearningProgress(
                user_id=uid,
                topic_id=body.topic_id,
                progress_pct=body.progress_pct,
                score=body.score,
                created_at=datetime.now(timezone.utc),
                last_accessed=datetime.now(timezone.utc),
            )
            session.add(progress)

        await session.commit()
        return {"status": "ok", "progress_pct": body.progress_pct, "score": body.score}


@router.get("/recommended")
async def get_recommended(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        user_result = await session.execute(select(User).where(User.uid == uid))
        user = user_result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        query = (
            select(LearningTopic, LearningProgress)
            .outerjoin(
                LearningProgress,
                (LearningTopic.id == LearningProgress.topic_id)
                & (LearningProgress.user_id == uid),
            )
            .where(LearningTopic.career_type == user.career_type)
            .order_by(
                func.coalesce(LearningProgress.progress_pct, 0.0).asc()
            )
            .limit(10)
        )

        result = await session.execute(query)
        rows = result.all()

        topics = []
        for topic, progress in rows:
            topics.append(
                {
                    "id": topic.id,
                    "title": topic.name,
                    "description": topic.description,
                    "career_type": topic.career_type,
                    "difficulty": topic.difficulty,
                    "progress_pct": progress.progress_pct if progress else 0.0,
                    "score": progress.score if progress else None,
                }
            )

        return {"recommended": topics}


@router.get("/stats")
async def get_stats(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        topics_result = await session.execute(
            select(LearningTopic).where(LearningTopic.career_type.isnot(None))
        )
        all_topics = topics_result.scalars().all()
        total_topics = len(all_topics)

        progress_result = await session.execute(
            select(LearningProgress).where(LearningProgress.user_id == uid)
        )
        all_progress = progress_result.scalars().all()

        completed_topics = sum(1 for p in all_progress if p.progress_pct == 100.0)
        topics_in_progress = sum(
            1 for p in all_progress if 0 < p.progress_pct < 100.0
        )

        scores = [p.score for p in all_progress if p.score is not None]
        average_score = round(sum(scores) / len(scores), 2) if scores else 0.0

        return {
            "total_topics": total_topics,
            "completed_topics": completed_topics,
            "average_score": average_score,
            "topics_in_progress": topics_in_progress,
        }
