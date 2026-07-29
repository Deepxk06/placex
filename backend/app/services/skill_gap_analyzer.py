from app.schemas.assessment import SkillGapResult
from typing import List

ROLE_SKILLS = {
    "software engineer": ["python", "java", "javascript", "sql", "git", "data structures",
                          "algorithms", "system design", "oop", "rest api"],
    "data scientist": ["python", "sql", "machine learning", "statistics", "pandas",
                       "numpy", "data visualization", "deep learning", "nlp"],
    "product manager": ["product management", "agile", "analytics", "user research",
                        "a/b testing", "roadmapping", "stakeholder management"],
    "frontend developer": ["javascript", "react", "html", "css", "typescript",
                            "rest api", "git", "responsive design"],
    "backend developer": ["python", "java", "node.js", "sql", "mongodb", "rest api",
                          "docker", "git", "microservices"],
    "devops engineer": ["docker", "kubernetes", "aws", "ci/cd", "linux", "terraform",
                        "jenkins", "git", "python"],
    "data analyst": ["sql", "python", "excel", "data visualization", "statistics",
                     "pandas", "tableau", "power bi"],
    "ml engineer": ["python", "machine learning", "deep learning", "tensorflow",
                    "pytorch", "sql", "docker", "mlops"],
}


async def analyze_skill_gap(current_skills: List[str], target_role: str) -> dict:
    current_set = set(s.lower().strip() for s in current_skills)
    target_role_lower = target_role.lower().strip()
    
    target_skills = set()
    for role, skills in ROLE_SKILLS.items():
        if role in target_role_lower or target_role_lower in role:
            target_skills.update(skills)
    
    if not target_skills:
        target_skills = set(ROLE_SKILLS.get("software engineer", []))
    
    matching = current_set & target_skills
    missing = target_skills - current_set
    extra = current_set - target_skills
    
    recommendations = []
    
    for skill in list(missing)[:10]:
        if skill in ["python", "java", "javascript", "c++"]:
            recommendations.append(f"Master {skill} with practical projects")
        elif skill in ["machine learning", "deep learning", "nlp"]:
            recommendations.append(f"Learn {skill}: take an online course and build a project")
        elif skill in ["docker", "kubernetes", "aws", "git"]:
            recommendations.append(f"Get hands-on with {skill} through tutorials and practice")
        elif skill in ["data structures", "algorithms"]:
            recommendations.append(f"Practice {skill} on LeetCode (150+ problems)")
        elif skill in ["sql", "mongodb"]:
            recommendations.append(f"Master {skill} with real-world query practice")
        else:
            recommendations.append(f"Learn {skill} for your target role")
    
    return SkillGapResult(
        currentSkills=list(current_set),
        targetSkills=list(target_skills),
        missingSkills=list(missing)[:15],
        recommendations=recommendations[:10],
    )


