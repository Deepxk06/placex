from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.auth import verify_token
from app.models import User, Job, ScrapedJob
from app.services.job_recommender import recommend_jobs, recommend_scraped_jobs
from sqlalchemy import select, or_
import uuid

router = APIRouter()


@router.get("/recommended")
async def get_recommended_jobs(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        user = await session.get(User, uid)
        if not user:
            raise HTTPException(404, "User not found")
    return await recommend_jobs(user)


@router.get("/scraped")
async def get_scraped_jobs(source: str = "", role: str = "", location: str = "",
                           min_salary: float = 0, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(ScrapedJob)
        if source:
            stmt = stmt.where(ScrapedJob.source == source)
        if role:
            stmt = stmt.where(ScrapedJob.role == role)
        if location:
            stmt = stmt.where(ScrapedJob.location.ilike(f"%{location}%"))
        if min_salary:
            stmt = stmt.where(ScrapedJob.salary_min >= min_salary)
        stmt = stmt.order_by(ScrapedJob.scraped_at.desc()).limit(50)
        result = await session.execute(stmt)
        jobs = result.scalars().all()
        return [{c.name: getattr(j, c.name) for c in ScrapedJob.__table__.columns} for j in jobs]


@router.get("/scraped/recommended")
async def get_recommended_scraped_jobs(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        user = await session.get(User, uid)
        if not user:
            raise HTTPException(404, "User not found")
    return await recommend_scraped_jobs(user)


@router.get("/search")
async def search_jobs(query: str = "", location: str = "", job_type: str = "",
                      skills: str = "", uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(Job)
        if query:
            stmt = stmt.where(or_(
                Job.title.ilike(f"%{query}%"),
                Job.company.ilike(f"%{query}%"),
                Job.description.ilike(f"%{query}%"),
            ))
        if location:
            stmt = stmt.where(Job.location.ilike(f"%{location}%"))
        if job_type:
            stmt = stmt.where(Job.type == job_type)
        if skills:
            skill_list = [s.strip() for s in skills.split(",")]
            stmt = stmt.where(Job.required_skills.overlap(skill_list))
        stmt = stmt.limit(50)
        result = await session.execute(stmt)
        jobs = result.scalars().all()
        return [{c.name: getattr(j, c.name) for c in Job.__table__.columns} for j in jobs]


@router.get("/internships")
async def get_internships(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(Job).where(Job.type == "internship").order_by(Job.posted_at.desc()).limit(50)
        result = await session.execute(stmt)
        jobs = result.scalars().all()
        return [{c.name: getattr(j, c.name) for c in Job.__table__.columns} for j in jobs]
