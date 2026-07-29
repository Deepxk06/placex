import re

ACTION_VERBS = [
    "achieved", "implemented", "developed", "designed", "optimized", "managed",
    "led", "created", "built", "improved", "delivered", "launched", "engineered",
    "deployed", "integrated", "automated", "configured", "reduced", "increased",
    "established", "generated", "spearheaded", "transformed", "architected",
    "mentored", "coordinated", "facilitated", "streamlined", "accelerated",
]

ROLE_KEYWORDS = {
    "sde": ["python", "java", "c++", "javascript", "react", "node", "sql",
            "docker", "aws", "api", "backend", "frontend", "full stack",
            "algorithm", "data structure", "system design", "microservice",
            "rest", "graphql", "ci/cd", "testing", "git"],
    "data-science": ["python", "machine learning", "deep learning", "nlp",
                      "tensorflow", "pytorch", "sql", "pandas", "numpy",
                      "statistics", "data visualization", "a/b testing",
                      "computer vision", "llm", "rag", "transformer"],
    "product": ["product management", "agile", "scrum", "user research",
                 "a/b testing", "analytics", "roadmap", "stakeholder",
                 "sprint", "backlog", "kpi", "metrics"],
    "design": ["ui/ux", "figma", "sketch", "user research", "prototyping",
                "wireframing", "design system", "responsive design",
                "accessibility", "design thinking"],
}


async def calculate_ats_score(resume_data: dict) -> dict:
    sections_text = resume_data.get("sections", [])
    sections = {s.get("name"): s.get("data", {}) for s in sections_text} if isinstance(sections_text, list) else {}
    raw_text = _build_text(sections)

    contact = _score_contact(sections.get("personalInfo", {}))
    skills_score = _score_skills(sections.get("skills", {}).get("items", []))
    education_score = _score_education(sections.get("education", {}).get("entries", []))
    projects_score = _score_projects(sections.get("projects", {}).get("entries", []))
    experience_score = _score_experience(sections.get("experience", {}).get("entries", []))
    achievements_score = _score_achievements(sections.get("achievements", {}).get("items", []))
    length_score = _check_length(raw_text)
    format_score = _check_format(raw_text)
    verb_score = _check_action_verbs(raw_text)
    section_score = _check_sections(sections)
    keyword_score = _analyze_keywords(raw_text, sections.get("personalInfo", {}).get("targetRole", ""))

    overall = int(
        0.10 * contact +
        0.10 * skills_score +
        0.10 * education_score +
        0.10 * projects_score +
        0.10 * experience_score +
        0.05 * achievements_score +
        0.10 * length_score +
        0.10 * format_score +
        0.10 * verb_score +
        0.15 * section_score +
        0.10 * keyword_score
    )

    suggestions = _generate_suggestions(
        sections, contact, skills_score, education_score, projects_score,
        experience_score, achievements_score, length_score, format_score,
        verb_score, section_score, keyword_score,
    )

    return {
        "overall": min(overall, 100),
        "contactScore": contact,
        "skillsScore": skills_score,
        "educationScore": education_score,
        "projectsScore": projects_score,
        "experienceScore": experience_score,
        "achievementsScore": achievements_score,
        "lengthScore": length_score,
        "formatScore": format_score,
        "verbScore": verb_score,
        "sectionScore": section_score,
        "keywordScore": keyword_score,
        "suggestions": suggestions,
    }


def _build_text(sections: dict) -> str:
    parts = []
    for name, data in sections.items():
        if isinstance(data, dict):
            parts.append(str(data.get("text", "")))
            parts.append(" ".join(str(e) for e in data.get("entries", [])))
            parts.append(" ".join(data.get("items", [])))
    return " ".join(parts)


def _score_contact(personal: dict) -> float:
    score = 0
    if personal.get("fullName"): score += 15
    if personal.get("email"): score += 15
    if personal.get("phone"): score += 15
    if personal.get("linkedIn"): score += 20
    if personal.get("github"): score += 20
    if personal.get("portfolio"): score += 15
    return min(score, 100)


def _score_skills(skills: list) -> float:
    if not skills:
        return 0
    count = len(skills)
    if count >= 10: return 100
    if count >= 7: return 80
    if count >= 5: return 60
    if count >= 3: return 40
    return 20


def _score_education(entries: list) -> float:
    if not entries:
        return 0
    score = 50
    for e in entries:
        if e.get("degree"): score += 10
        if e.get("institute"): score += 10
        if e.get("year"): score += 10
        if e.get("gpa"): score += 10
    return min(score, 100)


def _score_projects(entries: list) -> float:
    if not entries:
        return 0
    score = 40
    for p in entries:
        if p.get("title"): score += 10
        if p.get("description") and len(p["description"]) > 30: score += 15
        if p.get("techStack") and len(p["techStack"]) > 0: score += 10
        if p.get("link"): score += 5
    return min(score, 100)


def _score_experience(entries: list) -> float:
    if not entries:
        return 0
    score = 40
    for e in entries:
        if e.get("company"): score += 10
        if e.get("role"): score += 10
        if e.get("duration"): score += 10
        desc = e.get("description", "")
        if len(desc) > 50: score += 15
        if any(v in desc.lower() for v in ACTION_VERBS): score += 15
    return min(score, 100)


def _score_achievements(items: list) -> float:
    if not items:
        return 0
    return min(len(items) * 20, 100)


def _check_length(text: str) -> float:
    words = len(text.split())
    if 400 <= words <= 800: return 100
    if 300 <= words <= 1000: return 70
    return 40


def _check_format(text: str) -> float:
    score = 100
    if "|" in text or "\t" in text: score -= 15
    if re.search(r"\[object\]|Object\]", text, re.IGNORECASE): score -= 10
    return max(score, 0)


def _check_action_verbs(text: str) -> float:
    found = sum(1 for v in ACTION_VERBS if v in text.lower())
    return min(found * 10, 100)


def _check_sections(sections: dict) -> float:
    required = ["personalInfo", "education", "skills", "experience", "projects"]
    bonus = ["certifications", "achievements", "languages", "interests"]
    score = 0
    for s in required:
        if s in sections and sections[s]:
            data = sections[s]
            if isinstance(data, dict):
                entries = data.get("entries", data.get("items", []))
                if entries or data.get("text"):
                    score += 14
            elif isinstance(data, list):
                if data:
                    score += 14
    for s in bonus:
        if s in sections and sections[s]:
            data = sections[s]
            if isinstance(data, dict) and (data.get("entries") or data.get("items")):
                score += 5
            elif isinstance(data, list) and data:
                score += 5
    return min(score, 100)


def _analyze_keywords(text: str, target_role: str) -> float:
    text_lower = text.lower()
    if target_role and target_role.lower() in ROLE_KEYWORDS:
        keywords = ROLE_KEYWORDS[target_role.lower()]
    else:
        keywords = set()
        for kws in ROLE_KEYWORDS.values():
            keywords.update(kws)
    found = sum(1 for kw in keywords if kw in text_lower)
    total = len(keywords)
    return min(round(found / max(total, 1) * 100, 2), 100)


def _generate_suggestions(
    sections, contact, skills_score, education_score, projects_score,
    experience_score, achievements_score, length_score, format_score,
    verb_score, section_score, keyword_score,
) -> list:
    suggestions = []
    personal = sections.get("personalInfo", {})

    if contact < 80:
        if not personal.get("linkedIn"):
            suggestions.append("Add your LinkedIn profile URL for better professional visibility.")
        if not personal.get("github"):
            suggestions.append("Add your GitHub profile link to showcase your work.")
        if not personal.get("portfolio"):
            suggestions.append("Add a portfolio link to demonstrate your projects.")

    if skills_score < 60:
        suggestions.append("Add more relevant skills. Aim for at least 7-10 technical skills in your target domain.")

    if projects_score < 50:
        suggestions.append("Improve project descriptions with more detail on technologies used and your specific contributions.")
    if projects_score < 30:
        suggestions.append("Add projects to demonstrate practical application of your skills.")

    if experience_score < 50 and sections.get("experience", {}).get("entries"):
        suggestions.append("Enhance experience descriptions with more detail and action verbs. Include quantifiable results where possible.")

    if achievements_score < 20:
        suggestions.append("Add achievements or awards to highlight your exceptional performance.")

    if length_score < 70:
        suggestions.append("Aim for 1-2 pages (400-800 words). Your resume is either too short or too long.")

    if format_score < 80:
        suggestions.append("Avoid using tables, columns, or special characters. Use standard ATS-friendly formatting.")

    if verb_score < 60:
        suggestions.append(f"Use more action verbs like 'achieved', 'implemented', 'developed', 'optimized', 'architected'.")

    if section_score < 70:
        missing = []
        for s in ["personalInfo", "education", "skills", "experience", "projects"]:
            if s not in sections or not sections[s]:
                missing.append(s.replace("personalInfo", "Personal Information"))
        if missing:
            suggestions.append(f"Add missing sections: {', '.join(missing)}.")
        else:
            suggestions.append("Add more content to existing sections for a complete resume.")

    if keyword_score < 50:
        suggestions.append("Add more relevant keywords from job descriptions in your target role to pass ATS filters.")

    if not suggestions:
        suggestions.append("Your resume is well-optimized for ATS! Consider tailoring it for specific job applications.")

    return suggestions[:7]
