from typing import List, Optional


async def generate_roadmap(user, skill_gap) -> dict:
    if isinstance(user, dict):
        target_role = user.get("targetRole", "Software Engineer")
        current_skills = user.get("skills", [])
    else:
        target_role = getattr(user, "target_role", None) or "Software Engineer"
        current_skills = getattr(user, "skills", None) or []
    missing_skills = []
    if isinstance(skill_gap, dict):
        missing_skills = skill_gap.get("missingSkills", [])
    elif skill_gap is not None:
        missing_skills = getattr(skill_gap, "missingSkills", None) or []
    if not isinstance(missing_skills, list):
        missing_skills = []
    
    roadmap = {
        "targetRole": target_role,
        "timeline": generate_timeline(target_role, missing_skills),
        "dailyGoals": generate_daily_goals(target_role, current_skills),
        "certifications": get_certifications(target_role),
        "projects": get_project_suggestions(target_role, current_skills),
        "resources": get_learning_resources(target_role),
    }
    return roadmap


def generate_timeline(role: str, missing_skills: list) -> list:
    timeline = [
        {
            "month": 1,
            "focus": "Foundation",
            "goals": [
                "Master core programming concepts",
                "Learn data structures and algorithms",
                "Start building your resume with PlaceX Builder",
            ]
        },
        {
            "month": 2,
            "focus": "Skill Development",
            "goals": [
                f"Learn: {', '.join(missing_skills[:3])}" if missing_skills else "Learn in-demand technologies",
                "Build 2 mini-projects",
                "Complete 50+ coding problems",
            ]
        },
        {
            "month": 3,
            "focus": "Project Building",
            "goals": [
                "Build 1 major project",
                "Contribute to open source",
                "Practice mock interviews on PlaceX",
            ]
        },
        {
            "month": 4,
            "focus": "Placement Preparation",
            "goals": [
                "Apply for internships and jobs",
                "Practice aptitude questions daily",
                "Take mock interviews every week",
                "Network with alumni on PlaceX",
            ]
        },
    ]
    return timeline


def generate_daily_goals(role: str, current_skills: list) -> list:
    goals = [
        "Solve 2-3 coding problems on PlaceX",
        "Practice 10 aptitude questions",
        "Spend 30 minutes learning a new concept",
        "Review and update your resume",
        "Read one article about your target industry",
    ]
    if not current_skills:
        goals.insert(0, "Enroll in a programming course (Python/Java)")
    return goals


def get_certifications(role: str) -> list:
    certs = {
        "software engineer": [
            {"name": "AWS Certified Developer", "platform": "AWS", "url": ""},
            {"name": "Google Cloud Associate Engineer", "platform": "Google", "url": ""},
            {"name": "Microsoft Azure Developer", "platform": "Microsoft", "url": ""},
        ],
        "data scientist": [
            {"name": "TensorFlow Developer Certificate", "platform": "Google", "url": ""},
            {"name": "AWS Certified ML Specialty", "platform": "AWS", "url": ""},
            {"name": "Data Science Professional Certificate", "platform": "IBM", "url": ""},
        ],
    }
    role_lower = role.lower()
    for key, value in certs.items():
        if key in role_lower:
            return value
    return [
        {"name": "Meta Front-End Developer", "platform": "Coursera", "url": ""},
        {"name": "Google IT Automation with Python", "platform": "Coursera", "url": ""},
        {"name": "AWS Cloud Practitioner", "platform": "AWS", "url": ""},
    ]


def get_project_suggestions(role: str, current_skills: list) -> list:
    projects = [
        {
            "title": "E-Commerce API",
            "description": "Build a REST API for an e-commerce platform",
            "techStack": ["Python", "FastAPI", "MongoDB", "Redis"],
        },
        {
            "title": "Machine Learning Model Deployment",
            "description": "Train and deploy an ML model as a web service",
            "techStack": ["Python", "scikit-learn", "Flask", "Docker"],
        },
        {
            "title": "Real-Time Chat Application",
            "description": "Build a WebSocket-based chat app",
            "techStack": ["JavaScript", "Node.js", "Socket.io", "React"],
        },
        {
            "title": "Portfolio Website",
            "description": "Create a personal portfolio with all your projects",
            "techStack": ["React", "Tailwind CSS", "Vercel"],
        },
    ]
    return projects


def get_learning_resources(role: str) -> list:
    return [
        {"name": "LeetCode", "type": "platform", "description": "Practice coding problems", "url": "https://leetcode.com"},
        {"name": "GeeksforGeeks", "type": "platform", "description": "DSA tutorials and problems", "url": "https://geeksforgeeks.org"},
        {"name": "Coursera", "type": "course", "description": "Online courses from top universities", "url": "https://coursera.org"},
        {"name": "Udemy", "type": "course", "description": "Affordable tech courses", "url": "https://udemy.com"},
        {"name": "YouTube (freeCodeCamp)", "type": "video", "description": "Free full courses", "url": "https://youtube.com/freecodecamp"},
    ]
