from fastapi import APIRouter, HTTPException, Depends, Query
from app.database import get_db
from app.auth import verify_token
from app.models import CompanyQuestion
from sqlalchemy import select
from typing import Optional

router = APIRouter()


@router.get("/")
async def list_company_questions(
    uid: str = Depends(verify_token),
    company: Optional[str] = Query(None),
    year: Optional[str] = Query(None),
    topic: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
):
    async with get_db()() as session:
        query = select(CompanyQuestion)
        if company:
            query = query.where(CompanyQuestion.company_name == company)
        if year:
            query = query.where(CompanyQuestion.year == year)
        if topic:
            query = query.where(CompanyQuestion.topic == topic)
        if difficulty:
            query = query.where(CompanyQuestion.difficulty == difficulty)
        if role:
            query = query.where(CompanyQuestion.role == role)

        result = await session.execute(query)
        questions = result.scalars().all()

        return [
            {
                "id": q.id,
                "company_name": q.company_name,
                "year": q.year,
                "question_text": q.question,
                "topic": q.topic,
                "difficulty": q.difficulty,
                "role": q.role,
                "created_at": str(q.created_at) if q.created_at else None,
            }
            for q in questions
        ]


@router.get("/{question_id}")
async def get_company_question(
    question_id: int,
    uid: str = Depends(verify_token),
):
    async with get_db()() as session:
        query = select(CompanyQuestion).where(CompanyQuestion.id == question_id)
        result = await session.execute(query)
        question = result.scalar_one_or_none()

        if not question:
            raise HTTPException(status_code=404, detail="Question not found")

        return {
            "id": question.id,
            "company_name": question.company_name,
            "year": question.year,
            "question_text": question.question,
            "topic": question.topic,
            "difficulty": question.difficulty,
            "role": question.role,
            "created_at": str(question.created_at) if question.created_at else None,
        }


@router.get("/companies/list")
async def list_companies(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        query = select(CompanyQuestion.company_name).distinct()
        result = await session.execute(query)
        companies = [row[0] for row in result.all()]

        return {"companies": companies}


@router.get("/topics/list")
async def list_topics(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        query = select(CompanyQuestion.topic).distinct()
        result = await session.execute(query)
        topics = [row[0] for row in result.all()]

        return {"topics": topics}
