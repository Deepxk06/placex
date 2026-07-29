from app.schemas.resume import ATSResult
from typing import List

ACTION_VERBS = [
    "achieved", "implemented", "developed", "designed", "optimized", "managed",
    "led", "created", "built", "improved", "delivered", "launched", "engineered",
    "deployed", "integrated", "automated", "configured", "reduced", "increased",
    "established", "generated", "spearheaded", "transformed", "architected",
]

ROLE_KEYWORDS = {
    "sde": ["python", "java", "c++", "javascript", "react", "node", "sql",
            "docker", "aws", "api", "backend", "frontend", "full stack",
            "algorithm", "data structure", "system design", "microservice"],
    "data-science": ["python", "machine learning", "deep learning", "nlp",
                      "tensorflow", "pytorch", "sql", "pandas", "numpy",
                      "statistics", "data visualization", "a/b testing"],
    "product": ["product management", "agile", "scrum", "user research",
                 "a/b testing", "analytics", "roadmap", "stakeholder"],
    "design": ["ui/ux", "figma", "sketch", "user research", "prototyping",
                "wireframing", "design system", "responsive design"],
}


async def calculate_ats_score(resume_data: dict) -> ATSResult:
    text = resume_data.get("rawText", "")
    sections_text = resume_data.get("sections", [])
    if sections_text:
        combined = ""
        for s in sections_text:
            if isinstance(s, dict):
                combined += str(s.get("data", {})) + " "
        text = combined
    
    keyword_score = await analyze_keywords(text)
    format_score = check_format(text)
    length_score = check_length(text)
    verb_score = check_action_verbs(text)
    section_score = check_sections(text)

    overall = int(0.35 * keyword_score + 0.20 * format_score +
                  0.15 * length_score + 0.15 * verb_score + 0.15 * section_score)

    suggestions = generate_suggestions(keyword_score, format_score, length_score, verb_score, section_score)

    return ATSResult(
        overall=overall,
        keywordScore=keyword_score,
        formatScore=format_score,
        lengthScore=length_score,
        verbScore=verb_score,
        sectionScore=section_score,
        suggestions=suggestions,
    )


async def analyze_keywords(text: str) -> float:
    text_lower = text.lower()
    all_keywords = set()
    for role_kws in ROLE_KEYWORDS.values():
        all_keywords.update(role_kws)
    found = sum(1 for kw in all_keywords if kw in text_lower)
    total = len(all_keywords)
    return min(round(found / max(total, 1) * 100, 2), 100)


def check_format(text: str) -> float:
    score = 100
    if "|" in text or "\t" in text:
        score -= 15
    if re.search(r"\[object\]|Object\]", text, re.IGNORECASE):
        score -= 10
    return max(score, 0)


def check_length(text: str) -> float:
    word_count = len(text.split())
    if 400 <= word_count <= 800:
        return 100
    elif 300 <= word_count <= 1000:
        return 70
    else:
        return 40


def check_action_verbs(text: str) -> float:
    text_lower = text.lower()
    found = sum(1 for verb in ACTION_VERBS if verb in text_lower)
    score = min(found * 10, 100)
    return score


def check_sections(text: str) -> float:
    required = ["education", "experience", "skills", "project"]
    text_lower = text.lower()
    found = sum(1 for section in required if section in text_lower)
    return round((found / len(required)) * 100, 2)


def generate_suggestions(keyword_score: float, format_score: float,
                         length_score: float, verb_score: float,
                         section_score: float) -> list:
    suggestions = []
    if keyword_score < 60:
        suggestions.append("Add more relevant keywords from job descriptions in your target role.")
    if format_score < 80:
        suggestions.append("Avoid using tables, columns, or special characters. Use standard ATS-friendly formatting.")
    if length_score < 70:
        suggestions.append("Aim for 1-2 pages (400-800 words). Your resume is either too short or too long.")
    if verb_score < 60:
        suggestions.append("Use more action verbs like 'achieved', 'implemented', 'developed', 'optimized'.")
    if section_score < 80:
        suggestions.append("Ensure your resume has clear sections: Education, Experience, Skills, Projects.")
    if len(suggestions) == 0:
        suggestions.append("Your resume looks ATS-friendly! Consider tailoring it for specific job descriptions.")
    return suggestions


import re
