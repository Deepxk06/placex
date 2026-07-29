from app.database import get_db
from app.models import ScrapedJob
from datetime import datetime, timezone, timedelta


async def scrape_all_jobs():
    async with get_db()() as session:
        sample_jobs = [
            ScrapedJob(external_id="sample_sde_001", title="Software Engineer", company="Google",
                       location="Bangalore, India", description="Build and maintain large-scale distributed systems...",
                       apply_url="https://careers.google.com/jobs/", source="linkedin", source_job_id="linkedin_001",
                       salary_text="₹30L - ₹50L/yr", salary_min=3000000, salary_max=5000000,
                       skills=["python", "java", "c++", "data structures", "algorithms"], role="sde", job_type="fulltime",
                       posted_date=datetime.now(timezone.utc) - timedelta(days=2), scraped_at=datetime.now(timezone.utc)),
            ScrapedJob(external_id="sample_sde_002", title="Frontend Developer", company="Microsoft",
                       location="Hyderabad, India", description="Develop user interfaces for Microsoft products...",
                       apply_url="https://careers.microsoft.com/", source="linkedin", source_job_id="linkedin_002",
                       salary_text="₹25L - ₹40L/yr", salary_min=2500000, salary_max=4000000,
                       skills=["javascript", "react", "typescript", "html", "css"], role="frontend", job_type="fulltime",
                       posted_date=datetime.now(timezone.utc) - timedelta(days=1), scraped_at=datetime.now(timezone.utc)),
            ScrapedJob(external_id="sample_ds_001", title="Data Scientist", company="Amazon",
                       location="Bangalore, India", description="Apply ML techniques to solve business problems...",
                       apply_url="https://amazon.jobs/", source="indeed", source_job_id="indeed_001",
                       salary_text="₹28L - ₹45L/yr", salary_min=2800000, salary_max=4500000,
                       skills=["python", "machine learning", "sql", "nlp", "deep learning"], role="data-science", job_type="fulltime",
                       posted_date=datetime.now(timezone.utc) - timedelta(days=3), scraped_at=datetime.now(timezone.utc)),
            ScrapedJob(external_id="sample_intern_001", title="Software Engineering Intern", company="Google",
                       location="Remote, India", description="Summer internship for 2025 batch students...",
                       apply_url="https://careers.google.com/students/", source="linkedin", source_job_id="linkedin_003",
                       salary_text="₹50K - ₹80K/month", salary_min=50000, salary_max=80000,
                       skills=["python", "java", "data structures", "problem solving"], role="sde", job_type="internship",
                       posted_date=datetime.now(timezone.utc) - timedelta(hours=12), scraped_at=datetime.now(timezone.utc)),
        ]
        for job in sample_jobs:
            session.add(job)
        await session.commit()
    return f"Inserted {len(sample_jobs)} scraped jobs"
