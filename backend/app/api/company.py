from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.auth import verify_token
from app.models import Company
from sqlalchemy import select

router = APIRouter()


def serialize_company(co) -> dict:
    return {
        "id": co.id,
        "companyName": co.company_name,
        "industry": co.industry,
        "logo": co.logo,
        "website": co.website,
        "salaries": co.salaries or [],
        "interviewExperiences": co.interview_experiences or [],
        "requiredSkills": co.required_skills or [],
        "faqs": co.faqs or [],
    }


@router.get("/insights/{company_name}")
async def get_company_insights(company_name: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(Company).where(Company.company_name.ilike(f"%{company_name}%"))
        company = (await session.execute(stmt)).scalar_one_or_none()
        if not company:
            companies = (await session.execute(select(Company).limit(10))).scalars().all()
            if companies:
                return [serialize_company(c) for c in companies]
            raise HTTPException(404, "Company not found")
        return serialize_company(company)


@router.get("/salaries/{company_name}")
async def get_company_salaries(company_name: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(Company).where(Company.company_name.ilike(f"%{company_name}%"))
        company = (await session.execute(stmt)).scalar_one_or_none()
        if not company:
            raise HTTPException(404, "Company not found")
        return {"company": company.company_name, "salaries": company.salaries}


@router.get("/questions/{company_name}")
async def get_company_questions(company_name: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(Company).where(Company.company_name.ilike(f"%{company_name}%"))
        company = (await session.execute(stmt)).scalar_one_or_none()
        if not company:
            raise HTTPException(404, "Company not found")
        questions = []
        for exp in company.interview_experiences or []:
            questions.extend(exp.get("questions", []))
        return {"company": company.company_name, "questions": questions, "faqs": company.faqs}


@router.get("/")
async def list_companies(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        result = await session.execute(select(Company))
        companies = result.scalars().all()
        return [{"id": c.id, "companyName": c.company_name, "industry": c.industry} for c in companies]