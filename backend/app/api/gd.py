from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.auth import verify_token
from app.models import GDTopic
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class GDResponse(BaseModel):
    topic_id: int
    response_text: str


def score_response(text: str) -> dict:
    lower = text.lower()

    positive_keywords = [
        "advantage", "benefit", "support", "agree", "positive",
        "pros", "strength", "improve", "growth", "progress",
        "opportunity", "helpful", "effective", "efficient", "good"
    ]
    negative_keywords = [
        "disadvantage", "drawback", "disagree", "against", "negative",
        "cons", "weakness", "risk", "problem", "issue",
        "challenge", "concern", "difficulty", "limit", "bad"
    ]

    has_positive = any(kw in lower for kw in positive_keywords)
    has_negative = any(kw in lower for kw in negative_keywords)
    has_both_sides = has_positive and has_negative

    good_length = len(text) > 100

    structure_keywords = [
        "first", "second", "third", "additionally", "furthermore",
        "moreover", "however", "on the other hand", "in conclusion",
        "to sum up", "in summary", "therefore", "thus", "hence"
    ]
    has_structure = any(kw in lower for kw in structure_keywords)

    example_keywords = [
        "for example", "for instance", "such as", "like",
        "statistics", "data", "research", "according to", "case study"
    ]
    has_examples = any(kw in lower for kw in example_keywords)

    score = 0
    strengths = []
    improvements = []

    if has_both_sides:
        score += 30
        strengths.append("Presents arguments from both sides of the topic")
    else:
        improvements.append("Include arguments from both sides (for and against)")

    if good_length:
        score += 20
        strengths.append("Good length and detail in the response")
    else:
        improvements.append("Provide a more detailed response (aim for 150+ words)")

    if has_structure:
        score += 25
        strengths.append("Well-structured with logical flow")
    else:
        improvements.append("Use transitional phrases to improve flow")

    if has_examples:
        score += 25
        strengths.append("Includes examples or evidence to support points")
    else:
        improvements.append("Add examples or evidence to strengthen your arguments")

    if not strengths:
        strengths.append("Shows effort in attempting the response")
    if not improvements:
        improvements.append("Keep practicing to maintain this level")

    if score >= 80:
        feedback = "Excellent response! You demonstrate strong GD skills with balanced arguments."
    elif score >= 60:
        feedback = "Good response with room for improvement. Focus on the suggestions below."
    elif score >= 40:
        feedback = "Average response. Work on structuring your arguments better."
    else:
        feedback = "Needs significant improvement. Practice presenting balanced viewpoints."

    return {
        "score": score,
        "feedback": feedback,
        "strengths": strengths,
        "improvements": improvements,
    }


@router.get("/topics")
async def list_topics(
    category: Optional[str] = None,
    uid: str = Depends(verify_token),
):
    async with get_db()() as session:
        if category:
            stmt = select(GDTopic).where(GDTopic.category == category)
        else:
            stmt = select(GDTopic)
        result = await session.execute(stmt)
        topics = result.scalars().all()

    return {"topics": [{"id": t.id, "title": t.title, "category": t.category, "difficulty": t.difficulty} for t in topics]}


@router.get("/topics/{topic_id}")
async def get_topic(
    topic_id: int,
    uid: str = Depends(verify_token),
):
    async with get_db()() as session:
        stmt = select(GDTopic).where(GDTopic.id == topic_id)
        result = await session.execute(stmt)
        topic = result.scalar_one_or_none()

    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    return {
        "id": topic.id,
        "title": topic.title,
        "category": topic.category,
        "description": topic.description,
        "key_arguments": topic.key_arguments,
    }


@router.post("/practice")
async def submit_practice(
    body: GDResponse,
    uid: str = Depends(verify_token),
):
    async with get_db()() as session:
        stmt = select(GDTopic).where(GDTopic.id == body.topic_id)
        result = await session.execute(stmt)
        topic = result.scalar_one_or_none()

    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    if len(body.response_text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Response too short")

    evaluation = score_response(body.response_text)

    return {
        "topic_id": body.topic_id,
        "topic_title": topic.title,
        "evaluation": evaluation,
    }
