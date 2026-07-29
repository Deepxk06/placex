import asyncio
import uuid
from datetime import datetime, timezone
import app.database
from app.database import connect_db, disconnect_db
from app.models import Base, User, Job, ScrapedJob, Company, ResumeTemplate, CodingProblem, AptitudeQuestion
from sqlalchemy import insert


async def seed():
    await connect_db()
    engine = app.database.engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with engine.begin() as conn:
        await conn.execute(Base.metadata.tables["users"].delete())
        await conn.execute(Base.metadata.tables["jobs"].delete())
        await conn.execute(Base.metadata.tables["scraped_jobs"].delete())
        await conn.execute(Base.metadata.tables["companies"].delete())
        await conn.execute(Base.metadata.tables["resume_templates"].delete())
        await conn.execute(Base.metadata.tables["coding_problems"].delete())
        await conn.execute(Base.metadata.tables["aptitude_questions"].delete())
        await conn.execute(Base.metadata.tables["connect_requests"].delete())

    now = datetime.now(timezone.utc)

    users = [
        User(uid="student_001", email="student@placex.com", name="Rahul Sharma", role="student",
             college="IIT Bombay", branch="Computer Science", cgpa=8.5, grad_year=2025,
             skills=["python", "java", "sql", "machine learning", "react"],
             target_role="Software Engineer", target_industry="Tech", preferred_location="Bangalore",
             projects=[{"title": "PlaceX", "description": "AI placement platform", "techStack": ["FastAPI", "React"]}],
             created_at=now, updated_at=now),
        User(uid="student_002", email="priya@placex.com", name="Priya Patel", role="student",
             college="IIT Delhi", branch="Data Science", cgpa=9.1, grad_year=2025,
             skills=["python", "machine learning", "deep learning", "nlp", "sql"],
             target_role="Data Scientist", target_industry="Tech", preferred_location="Bangalore",
             created_at=now, updated_at=now),
        User(uid="student_003", email="arjun@placex.com", name="Arjun Singh", role="student",
             college="NIT Trichy", branch="Electrical", cgpa=7.8, grad_year=2025,
             skills=["c++", "python", "embedded systems", "iot"],
             target_role="Embedded Engineer", target_industry="Hardware", preferred_location="Pune",
             created_at=now, updated_at=now),
        User(uid="student_004", email="neha@placex.com", name="Neha Gupta", role="student",
             college="IIT Kanpur", branch="Computer Science", cgpa=8.9, grad_year=2025,
             skills=["python", "java", "react", "node.js", "aws", "docker"],
             target_role="Full Stack Developer", target_industry="Tech", preferred_location="Bangalore",
             created_at=now, updated_at=now),
        User(uid="student_005", email="vikram@placex.com", name="Vikram Joshi", role="student",
             college="IIT Bombay", branch="Mechanical", cgpa=7.2, grad_year=2025,
             skills=["c++", "matlab", "solidworks", "ansys"],
             target_role="Mechanical Engineer", target_industry="Manufacturing", preferred_location="Pune",
             created_at=now, updated_at=now),
        User(uid="admin_001", email="admin@placex.com", name="Admin User", role="admin",
             college="", branch="", created_at=now, updated_at=now),
        User(uid="alumni_001", email="alumni_sde@placex.com", name="Sneha Reddy", role="alumni",
             college="IIT Bombay", branch="Computer Science", grad_year=2020,
             current_company="Google", current_role="Senior Software Engineer", experience_years=4,
             mentorship_available=True, expertise=["python", "java", "system design", "distributed systems"],
             linked_in="https://linkedin.com/in/snehareddy", created_at=now, updated_at=now),
        User(uid="alumni_002", email="alumni_ds@placex.com", name="Amit Verma", role="alumni",
             college="IIT Delhi", branch="Data Science", grad_year=2019,
             current_company="Amazon", current_role="Data Scientist", experience_years=5,
             mentorship_available=True, expertise=["python", "ml", "nlp", "deep learning", "sql"],
             linked_in="https://linkedin.com/in/amitverma", created_at=now, updated_at=now),
    ]
    async with engine.begin() as conn:
        for u in users:
            await conn.execute(insert(User).values({c.name: getattr(u, c.name) for c in User.__table__.columns}))

    jobs_data = [
        {"title": "Software Engineer", "company": "Google", "location": "Bangalore", "description": "Join Google's search infrastructure team...", "required_skills": ["python", "java", "c++", "data structures", "algorithms"], "type": "fulltime", "salary_min": 3000000, "salary_max": 5000000, "apply_url": "https://careers.google.com/", "role": "sde", "posted_at": now, "created_at": now},
        {"title": "Data Scientist", "company": "Amazon", "location": "Hyderabad", "description": "Apply ML to solve business problems...", "required_skills": ["python", "machine learning", "sql", "nlp"], "type": "fulltime", "salary_min": 2800000, "salary_max": 4500000, "apply_url": "https://amazon.jobs/", "role": "data-science", "posted_at": now, "created_at": now},
        {"title": "Frontend Developer", "company": "Microsoft", "location": "Hyderabad", "description": "Build UI components for Microsoft teams...", "required_skills": ["javascript", "react", "typescript", "html", "css"], "type": "fulltime", "salary_min": 2500000, "salary_max": 4000000, "apply_url": "https://careers.microsoft.com/", "role": "frontend", "posted_at": now, "created_at": now},
        {"title": "Full Stack Developer Intern", "company": "Flipkart", "location": "Bangalore", "description": "Work on e-commerce platform...", "required_skills": ["python", "react", "node.js", "sql"], "type": "internship", "salary_min": 50000, "salary_max": 80000, "apply_url": "https://flipkart.careers/", "role": "fullstack", "posted_at": now, "created_at": now},
        {"title": "Backend Developer", "company": "Uber", "location": "Bangalore", "description": "Build scalable microservices...", "required_skills": ["python", "go", "sql", "aws", "docker"], "type": "fulltime", "salary_min": 3000000, "salary_max": 4800000, "apply_url": "https://uber.careers/", "role": "backend", "posted_at": now, "created_at": now},
        {"title": "Machine Learning Engineer", "company": "Microsoft", "location": "Hyderabad", "description": "Develop and deploy ML models...", "required_skills": ["python", "tensorflow", "pytorch", "ml", "sql"], "type": "fulltime", "salary_min": 3200000, "salary_max": 5000000, "apply_url": "https://careers.microsoft.com/", "role": "ml-engineer", "posted_at": now, "created_at": now},
        {"title": "DevOps Engineer", "company": "Amazon", "location": "Bangalore", "description": "Manage CI/CD pipelines and cloud infra...", "required_skills": ["aws", "docker", "kubernetes", "python", "terraform"], "type": "fulltime", "salary_min": 2800000, "salary_max": 4200000, "apply_url": "https://amazon.jobs/", "role": "devops", "posted_at": now, "created_at": now},
        {"title": "Product Manager", "company": "Google", "location": "Bangalore", "description": "Drive product strategy...", "required_skills": ["product management", "analytics", "agile"], "type": "fulltime", "salary_min": 3500000, "salary_max": 5500000, "apply_url": "https://careers.google.com/", "role": "product", "posted_at": now, "created_at": now},
        {"title": "Data Analyst Intern", "company": "Swiggy", "location": "Bangalore", "description": "Analyze business data...", "required_skills": ["sql", "python", "excel", "tableau"], "type": "internship", "salary_min": 30000, "salary_max": 50000, "apply_url": "https://swiggy.careers/", "role": "data-analyst", "posted_at": now, "created_at": now},
        {"title": "Research Engineer", "company": "Google Research", "location": "Bangalore", "description": "Work on cutting-edge AI research...", "required_skills": ["python", "machine learning", "deep learning", "nlp"], "type": "fulltime", "salary_min": 3500000, "salary_max": 6000000, "apply_url": "https://research.google/", "role": "research", "posted_at": now, "created_at": now},
    ]
    async with engine.begin() as conn:
        for jd in jobs_data:
            await conn.execute(insert(Job).values(jd))

    scraped = [
        {"external_id": "s_linkedin_001", "title": "Software Development Engineer SDE", "company": "Amazon", "location": "Bangalore, India", "description": "SDE-2 position in Amazon's marketplace team...", "apply_url": "https://linkedin.com/jobs/1", "source": "linkedin", "source_job_id": "li_001", "salary_text": "₹30L - ₹50L", "salary_min": 3000000, "salary_max": 5000000, "skills": ["java", "python", "aws", "distributed systems"], "role": "sde", "job_type": "fulltime", "posted_date": now, "scraped_at": now},
        {"external_id": "s_indeed_001", "title": "Data Scientist", "company": "Microsoft", "location": "Hyderabad, India", "description": "Join ML team for Azure...", "apply_url": "https://indeed.com/jobs/1", "source": "indeed", "source_job_id": "in_001", "salary_text": "₹25L - ₹45L", "salary_min": 2500000, "salary_max": 4500000, "skills": ["python", "ml", "deep learning", "azure"], "role": "data-science", "job_type": "fulltime", "posted_date": now, "scraped_at": now},
        {"external_id": "s_naukri_001", "title": "Frontend Developer", "company": "Flipkart", "location": "Bangalore, India", "description": "React developer for Flipkart's UI team...", "apply_url": "https://naukri.com/jobs/1", "source": "naukri", "source_job_id": "nk_001", "salary_text": "₹20L - ₹35L", "salary_min": 2000000, "salary_max": 3500000, "skills": ["react", "javascript", "typescript", "css"], "role": "frontend", "job_type": "fulltime", "posted_date": now, "scraped_at": now},
    ]
    async with engine.begin() as conn:
        for sj in scraped:
            await conn.execute(insert(ScrapedJob).values(sj))

    companies_data = [
        {"company_name": "Google", "industry": "Technology", "logo": "", "website": "https://google.com", "salaries": [{"role": "SDE", "minSalary": 2500000, "maxSalary": 5000000, "source": "glassdoor"}], "interview_experiences": [], "required_skills": ["python", "java", "data structures", "algorithms"], "faqs": [{"question": "What is the hiring process?", "answer": "Online assessment → 3-4 technical rounds → hiring committee → offer"}], "created_at": now},
        {"company_name": "Microsoft", "industry": "Technology", "logo": "", "website": "https://microsoft.com", "salaries": [{"role": "SDE", "minSalary": 2000000, "maxSalary": 4500000, "source": "glassdoor"}], "interview_experiences": [], "required_skills": ["c++", "c#", "azure", "data structures"], "faqs": [{"question": "How many rounds?", "answer": "Online test → 4-5 rounds including system design and behavioral"}], "created_at": now},
        {"company_name": "Amazon", "industry": "Technology", "logo": "", "website": "https://amazon.com", "salaries": [{"role": "SDE", "minSalary": 2500000, "maxSalary": 5500000, "source": "glassdoor"}], "interview_experiences": [], "required_skills": ["java", "python", "aws", "system design"], "faqs": [{"question": "What is Amazon's leadership principle?", "answer": "Amazon has 16 leadership principles that guide all decisions"}], "created_at": now},
    ]
    async with engine.begin() as conn:
        for cd in companies_data:
            await conn.execute(insert(Company).values(cd))

    templates_data = [
        {"name": "Standard Tech Resume", "target_role": "Software Engineer", "sections": [{"name": "summary", "required": True}, {"name": "education", "required": True}, {"name": "experience", "required": True}, {"name": "projects", "required": True}, {"name": "skills", "required": True}], "ats_rules": {"maxPages": 2, "allowedFonts": ["Arial", "Calibri"], "noImages": True}, "created_at": now},
        {"name": "Data Science Resume", "target_role": "Data Scientist", "sections": [{"name": "summary", "required": True}, {"name": "education", "required": True}, {"name": "experience", "required": True}, {"name": "projects", "required": True}, {"name": "publications", "required": False}], "ats_rules": {"maxPages": 2, "noImages": True}, "created_at": now},
        {"name": "Internship Resume", "target_role": "Intern", "sections": [{"name": "education", "required": True}, {"name": "skills", "required": True}, {"name": "projects", "required": True}, {"name": "achievements", "required": False}], "ats_rules": {"maxPages": 1, "noImages": True}, "created_at": now},
    ]
    async with engine.begin() as conn:
        for td in templates_data:
            await conn.execute(insert(ResumeTemplate).values(td))

    coding_problems_data = [
        {"title": "Two Sum", "slug": "two-sum", "difficulty": "easy", "topics": ["arrays", "hash-table"], "companies": ["Google", "Amazon", "Microsoft"], "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.", "examples": [{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]"}], "constraints": "2 <= nums.length <= 10^4", "test_cases": [], "hidden_test_cases": [], "hints": ["Try using a hash map"], "solution": {"approach": "Use hash map to store complements", "code": "def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []"}, "time_limit": 1000, "memory_limit": 256, "total_submissions": 0, "total_accepted": 0, "created_at": now},
        {"title": "Reverse Linked List", "slug": "reverse-linked-list", "difficulty": "easy", "topics": ["linked-list"], "companies": ["Google", "Microsoft"], "description": "Reverse a singly linked list.", "examples": [{"input": "head = [1,2,3,4,5]", "output": "[5,4,3,2,1]"}], "constraints": "0 <= n <= 5000", "test_cases": [], "hidden_test_cases": [], "hints": ["Use three pointers"], "solution": {"approach": "Iterative with prev/curr/next", "code": "def reverseList(head):\n    prev, curr = None, head\n    while curr:\n        next_temp = curr.next\n        curr.next = prev\n        prev = curr\n        curr = next_temp\n    return prev"}, "time_limit": 1000, "memory_limit": 256, "total_submissions": 0, "total_accepted": 0, "created_at": now},
        {"title": "Valid Parentheses", "slug": "valid-parentheses", "difficulty": "medium", "topics": ["stack", "strings"], "companies": ["Amazon", "Google"], "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.", "examples": [{"input": "s = '()[]{}'", "output": "true"}], "constraints": "1 <= s.length <= 10^4", "test_cases": [], "hidden_test_cases": [], "hints": ["Use a stack"], "solution": {"approach": "Stack with matching pairs", "code": "def isValid(s):\n    stack = []\n    pairs = {')': '(', '}': '{', ']': '['}\n    for c in s:\n        if c in pairs:\n            if not stack or stack.pop() != pairs[c]:\n                return False\n        else:\n            stack.append(c)\n    return not stack"}, "time_limit": 1000, "memory_limit": 256, "total_submissions": 0, "total_accepted": 0, "created_at": now},
    ]
    async with engine.begin() as conn:
        for cp in coding_problems_data:
            await conn.execute(insert(CodingProblem).values(cp))

    aptitude_questions = [
        AptitudeQuestion(topic="quantitative", subtopic="percentage", difficulty="easy", question="If 20% of a number is 45, what is the number?", options=["180", "200", "225", "250"], correct_index=2, explanation="45/0.20 = 225", time_limit=60, created_at=now),
        AptitudeQuestion(topic="quantitative", subtopic="profit-loss", difficulty="medium", question="A shopkeeper sells an item at 20% profit. If the cost price is ₹500, what is the selling price?", options=["₹550", "₹600", "₹650", "₹700"], correct_index=1, explanation="SP = 500 * 1.20 = 600", time_limit=60, created_at=now),
        AptitudeQuestion(topic="logical", subtopic="series", difficulty="medium", question="What comes next: 2, 6, 12, 20, ?", options=["28", "30", "32", "36"], correct_index=1, explanation="Differences increase by 2: 4,6,8,10", time_limit=60, created_at=now),
        AptitudeQuestion(topic="logical", subtopic="coding-decoding", difficulty="hard", question="If CAT is coded as 3120, then what is DOG?", options=["4157", "4125", "4215", "4517"], correct_index=0, explanation="C=3, A=1, T=20 → 3120; D=4, O=15, G=7 → 4157", time_limit=60, created_at=now),
        AptitudeQuestion(topic="verbal", subtopic="analogy", difficulty="easy", question="Doctor : Hospital :: Teacher : ?", options=["School", "College", "University", "Classroom"], correct_index=0, explanation="A doctor works in a hospital, a teacher works in a school.", time_limit=60, created_at=now),
    ]
    async with engine.begin() as conn:
        for aq in aptitude_questions:
            vals = {c.name: getattr(aq, c.name) for c in AptitudeQuestion.__table__.columns if c.name != "id"}
            await conn.execute(insert(AptitudeQuestion).values(vals))

    await disconnect_db()
    print("Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
