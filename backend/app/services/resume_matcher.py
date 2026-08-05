from app.schemas.resume import JDMatchResult
from typing import List, Optional


async def match_resume_to_jd(resume_data: dict, jd_text: str) -> JDMatchResult:
    resume_skills = extract_resume_skills(resume_data)
    resume_skills_lower = set(s.lower() for s in resume_skills)
    jd_text_lower = jd_text.lower()
    
    # Try using sentence-transformers if available
    try:
        from sentence_transformers import SentenceTransformer, util
        model = SentenceTransformer('all-MiniLM-L6-v2')
        resume_text = " ".join([
            resume_data.get("summary", ""),
            " ".join(resume_skills),
            " ".join(e.get("degree", "") + " " + e.get("institute", "") for e in extract_resume_entries(resume_data, "education")),
            " ".join(p.get("title", "") + " " + p.get("description", "") for p in extract_resume_entries(resume_data, "projects")),
        ])
        emb1 = model.encode(resume_text, convert_to_tensor=True)
        emb2 = model.encode(jd_text, convert_to_tensor=True)
        similarity = util.pytorch_cos_sim(emb1, emb2).item()
        semantic_score = round(similarity * 100, 2)
    except Exception:
        semantic_score = 50.0

    # Extract skills from JD
    jd_skills = extract_skills_from_jd(jd_text_lower)
    
    # Match skills
    matching_skills = list(resume_skills_lower & jd_skills)
    missing_skills = list(jd_skills - resume_skills_lower)
    
    skill_match_ratio = len(matching_skills) / max(len(jd_skills), 1)
    skill_score = round(skill_match_ratio * 100, 2)
    
    match_score = round(0.6 * skill_score + 0.4 * semantic_score, 2)
    
    suggestions = []
    if missing_skills:
        suggestions.append(f"Add these missing skills: {', '.join(missing_skills[:5])}")
    if match_score < 50:
        suggestions.append("Your resume needs significant tailoring for this job description.")
    elif match_score < 75:
        suggestions.append("Good match! Consider adding more specific keywords from the JD.")
    else:
        suggestions.append("Excellent match! Your profile aligns well with this position.")

    return JDMatchResult(
        matchScore=match_score,
        matchingSkills=matching_skills,
        missingSkills=missing_skills,
        suggestions=suggestions,
    )


def extract_resume_skills(resume_data: dict) -> list:
    if isinstance(resume_data.get("skills"), list):
        return resume_data["skills"]
    return extract_resume_entries(resume_data, "skills", key="items")


def extract_resume_entries(resume_data: dict, section_name: str, key: str = "entries") -> list:
    if isinstance(resume_data.get(section_name), list):
        return resume_data[section_name]
    sections = resume_data.get("sections", [])
    if isinstance(sections, list):
        for s in sections:
            if s.get("name") == section_name:
                data = s.get("data", {})
                items = data.get(key, []) if isinstance(data, dict) else []
                if isinstance(items, list):
                    return items
    return []


def extract_skills_from_jd(jd_text: str) -> set:
    common_skills = [
        "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
        "react", "angular", "vue", "node.js", "django", "flask", "spring",
        "sql", "mongodb", "postgresql", "mysql", "redis", "oracle",
        "aws", "azure", "gcp", "docker", "kubernetes", "terraform",
        "machine learning", "deep learning", "nlp", "tensorflow", "pytorch",
        "git", "linux", "rest api", "graphql", "microservices", "agile",
        "html", "css", "sass", "bootstrap", "tailwind",
        "data analysis", "data visualization", "statistics",
        "product management", "ui/ux", "figma", "sketch",
        "communication", "leadership", "problem solving", "teamwork",
    ]
    found = set()
    for skill in common_skills:
        if skill in jd_text:
            found.add(skill)
    return found
