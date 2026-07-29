from app.database import get_db
from app.models import Job, ScrapedJob
from sqlalchemy import select
from datetime import datetime, timezone, timedelta


async def recommend_jobs(user) -> list:
    user_skills = set(s.lower().strip() for s in (user.skills or []))
    target_role = (user.target_role or "").lower()
    location = (user.preferred_location or "").lower()
    async with get_db()() as session:
        jobs = (await session.execute(select(Job).limit(100))).scalars().all()
    scored = []
    for job in jobs:
        score = 0.0
        job_skills = set(s.lower().strip() for s in (job.required_skills or []))
        skill_match = len(user_skills & job_skills) / max(len(job_skills), 1)
        score += skill_match * 50
        if target_role and target_role in (job.title or "").lower():
            score += 20
        elif target_role and target_role in (job.role or "").lower():
            score += 15
        if location and location in (job.location or "").lower():
            score += 15
        job_type = (job.type or "").lower()
        if "intern" in job_type or "fresher" in (job.title or "").lower():
            score += 10
        scored.append((score, {
            "id": job.id, "title": job.title, "company": job.company,
            "location": job.location, "description": job.description,
            "requiredSkills": job.required_skills, "type": job.type,
            "salaryRange": {"min": job.salary_min, "max": job.salary_max},
            "salaryText": job.salary_text, "applyUrl": job.apply_url,
            "role": job.role, "matchScore": round(score, 2),
        }))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [job for _, job in scored[:20]]


async def recommend_scraped_jobs(user) -> list:
    user_skills = set(s.lower().strip() for s in (user.skills or []))
    target_role = (user.target_role or "").lower()
    async with get_db()() as session:
        cutoff = datetime.now(timezone.utc) - timedelta(days=7)
        stmt = select(ScrapedJob).where(ScrapedJob.scraped_at >= cutoff).limit(200)
        recent = (await session.execute(stmt)).scalars().all()
    scored = []
    for job in recent:
        score = 0.0
        job_skills = set(s.lower().strip() for s in (job.skills or []))
        skill_match = len(user_skills & job_skills) / max(len(job_skills), 1)
        score += skill_match * 50
        if target_role and target_role in (job.title or "").lower():
            score += 20
        if target_role and target_role in (job.role or "").lower():
            score += 15
        scored.append((score, {
            "id": job.id, "title": job.title, "company": job.company,
            "location": job.location, "description": job.description,
            "applyUrl": job.apply_url, "source": job.source,
            "salaryText": job.salary_text, "salaryMin": job.salary_min,
            "salaryMax": job.salary_max, "skills": job.skills,
            "role": job.role, "jobType": job.job_type,
            "postedDate": job.posted_date.isoformat() if job.posted_date else None,
            "matchScore": round(score, 2),
        }))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [job for _, job in scored[:20]]
