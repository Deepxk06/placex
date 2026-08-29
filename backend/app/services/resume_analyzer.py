import re
from typing import Dict, List

from app.services.resume_skills import (
    match_skills_in_text,
    categorize_skills,
    skill_occurrence_count,
)
from app.services.resume_parser import ACTION_VERBS

REQUIRED_SECTIONS = ["personal_info", "education", "skills", "experience", "projects"]
BONUS_SECTIONS = ["certifications", "achievements", "languages", "internships", "summary", "soft_skills"]

QUANTIFICATION_PATTERN = re.compile(
    r"(\d+[\d,.]*\s*(?:%|percent|users|requests|sales|revenue|downloads|queries|\\$|₹|k|m|ms))"
    r"|(\\$|₹)\s*\d+"
    r"|(\b\d+\b\s*(?:x|times))\b",
    re.IGNORECASE,
)

PROBLEM_PATTERN = re.compile(
    r"\b(problem|challenge|issue|difficulty|bottleneck|limitation|goal|purpose|aimed to|objective|solve|optimiz)\w*",
    re.IGNORECASE,
)

RESULT_PATTERN = re.compile(
    r"\b(improved|reduced|increased|decreased|achieved|boosted|cut|saved|accelerated|outperformed|won|ranked)\w*",
    re.IGNORECASE,
)

PARAGRAPH_TOO_LONG = 400
UNUSUAL_SYMBOL_PATTERN = re.compile(r"[^\x00-\x7F\u0900-\u097F\u00C0-\u017F\u2010-\u2027\u20B9\u20AC\u00A3\u00A5\u0020-\u007E]")

CONTACT_ITEMS = {
    "email": "Email address",
    "phone": "Phone number",
    "linkedin": "LinkedIn profile",
    "github": "GitHub profile",
    "portfolio": "Portfolio / personal website",
}


async def analyze_resume(parsed_data: Dict) -> Dict:
    """Deterministic resume quality + estimated ATS analysis."""
    raw_text = parsed_data.get("rawText", "")
    sections = parsed_data.get("detectedSections", [])
    skills = parsed_data.get("skills", [])
    skill_details = parsed_data.get("skillDetails", {})
    projects = parsed_data.get("projects", [])
    experience = parsed_data.get("experience", [])
    education = parsed_data.get("education", [])
    summary = parsed_data.get("summary", "")

    contact = _score_contact(parsed_data)
    summary_score = _score_summary(summary)
    education_score = _score_education(education)
    skills_score = _score_skills(skills, skill_details)
    experience_score = _score_experience(experience)
    projects_score = _score_projects(projects)
    sections_score = _score_sections(sections)
    readability_score = _score_readability(raw_text)

    resume_score = int(
        0.15 * contact
        + 0.10 * summary_score
        + 0.10 * education_score
        + 0.15 * skills_score
        + 0.15 * experience_score
        + 0.20 * projects_score
        + 0.10 * sections_score
        + 0.05 * readability_score
    )

    resume_breakdown = {
        "contact": round(contact),
        "summary": round(summary_score),
        "education": round(education_score),
        "skills": round(skills_score),
        "experience": round(experience_score),
        "projects": round(projects_score),
        "sections": round(sections_score),
        "readability": round(readability_score),
    }

    ats = _analyze_ats(parsed_data, sections, skills, raw_text)
    ats_score = ats["overall"]
    ats_breakdown = ats["breakdown"]
    ats_warnings = ats["warnings"]

    project_analysis = _analyze_projects(projects)
    experience_analysis = _analyze_experience(experience)
    education_analysis = _analyze_education(education)

    skill_levels = _skill_levels(skills, skill_details, raw_text)

    return {
        "resumeScore": min(resume_score, 100),
        "resumeBreakdown": resume_breakdown,
        "atsScore": ats_score,
        "atsBreakdown": ats_breakdown,
        "atsWarnings": ats_warnings,
        "projectAnalysis": project_analysis,
        "experienceAnalysis": experience_analysis,
        "educationAnalysis": education_analysis,
        "skillLevels": skill_levels,
    }


def _score_contact(parsed_data: Dict) -> float:
    score = 0
    if parsed_data.get("email"): score += 20
    if parsed_data.get("phone"): score += 20
    if parsed_data.get("linkedin"): score += 20
    if parsed_data.get("github"): score += 20
    if parsed_data.get("portfolio"): score += 10
    if parsed_data.get("name"): score += 10
    return min(score, 100)


def _score_summary(summary: str) -> float:
    if not summary:
        return 0
    words = len(summary.split())
    if words >= 25:
        return 100
    if words >= 10:
        return 70
    return 40


def _score_education(education: List[Dict]) -> float:
    if not education:
        return 0
    score = 40
    for e in education:
        if e.get("degree"): score += 12
        if e.get("institute"): score += 12
        if e.get("year"): score += 12
        if e.get("gpa"): score += 12
        if e.get("branch"): score += 8
    return min(score, 100)


def _score_skills(skills: List[str], skill_details: Dict) -> float:
    if not skills:
        return 0
    count = len(skills)
    if count >= 10: base = 100
    elif count >= 7: base = 85
    elif count >= 5: base = 70
    elif count >= 3: base = 50
    else: base = 30
    weak = sum(1 for d in (skill_details or {}).values() if d.get("level") == "weak")
    penalty = min(weak * 3, 25)
    return max(base - penalty, 0)


def _score_experience(experience: List[Dict]) -> float:
    if not experience:
        return 0
    score = 40
    for e in experience:
        if e.get("company"): score += 8
        if e.get("role"): score += 8
        if e.get("duration"): score += 8
        desc = e.get("description", "")
        if len(desc) > 50: score += 10
        if any(v in desc.lower() for v in ACTION_VERBS): score += 10
        if QUANTIFICATION_PATTERN.search(desc): score += 8
        if e.get("technologies"): score += 8
    return min(score, 100)


def _score_projects(projects: List[Dict]) -> float:
    if not projects:
        return 0
    score = 40
    for p in projects:
        if p.get("title"): score += 8
        desc = p.get("description", "")
        if len(desc) > 30: score += 10
        if p.get("techStack"): score += 8
        if p.get("link"): score += 4
        if any(v in desc.lower() for v in ACTION_VERBS): score += 8
        if QUANTIFICATION_PATTERN.search(desc): score += 8
    return min(score, 100)


def _score_sections(sections: List[str]) -> float:
    if not sections:
        return 10
    present = set(sections)
    score = 0
    for s in REQUIRED_SECTIONS:
        if s in present:
            score += 14
    for s in BONUS_SECTIONS:
        if s in present:
            score += 5
    return min(score, 100)


def _score_readability(raw_text: str) -> float:
    words = len(raw_text.split())
    if not words:
        return 0
    if 350 <= words <= 900:
        return 100
    if 200 <= words <= 1200:
        return 70
    return 40


def _analyze_ats(parsed_data: Dict, sections: List[str], skills: List[str], raw_text: str) -> Dict:
    text_lower = raw_text.lower()
    words = len(raw_text.split())

    keyword_relevance = _keyword_relevance(text_lower)
    structure = _structure_score(sections)
    section_completeness = _section_completeness(sections, parsed_data)
    formatting = _formatting_score(raw_text)
    contact_information = _contact_score_ats(parsed_data)
    readability = _readability_score_ats(raw_text)

    overall = int(
        0.25 * keyword_relevance
        + 0.20 * structure
        + 0.20 * section_completeness
        + 0.15 * formatting
        + 0.10 * contact_information
        + 0.10 * readability
    )

    warnings = _generate_ats_warnings(parsed_data, sections, skills, raw_text, words)

    return {
        "overall": min(overall, 100),
        "breakdown": {
            "keywordRelevance": round(keyword_relevance),
            "structure": round(structure),
            "sectionCompleteness": round(section_completeness),
            "formatting": round(formatting),
            "contactInformation": round(contact_information),
            "readability": round(readability),
        },
        "warnings": warnings,
    }


def _keyword_relevance(text_lower: str) -> float:
    from app.services.ats_scorer import ROLE_KEYWORDS
    keywords = set()
    for kws in ROLE_KEYWORDS.values():
        keywords.update(kws)
    found = sum(1 for kw in keywords if kw in text_lower)
    return min(round(8 * found, 2), 100)


def _structure_score(sections: List[str]) -> float:
    if not sections:
        return 0
    present = set(sections)
    score = sum(1 for s in REQUIRED_SECTIONS if s in present)
    return round(score / len(REQUIRED_SECTIONS) * 100)


def _section_completeness(sections: List[str], parsed_data: Dict) -> float:
    present = set(sections)
    score = 0
    for s in REQUIRED_SECTIONS:
        if s in present:
            score += 14
        elif s == "experience" and parsed_data.get("projects"):
            score += 14
    for s in BONUS_SECTIONS:
        if s in present:
            score += 5
    return min(score, 100)


def _formatting_score(raw_text: str) -> float:
    score = 100
    if re.search(r"[|]{2,}", raw_text): score -= 10
    if "\t" in raw_text: score -= 10
    if UNUSUAL_SYMBOL_PATTERN.search(raw_text): score -= 15
    if re.search(r"\[object|\[object\]", raw_text, re.IGNORECASE): score -= 10
    long_paras = sum(1 for para in raw_text.split("\n\n") if len(para) > PARAGRAPH_TOO_LONG)
    if long_paras > 1: score -= 10
    return max(score, 0)


def _contact_score_ats(parsed_data: Dict) -> float:
    score = 0
    if parsed_data.get("name"): score += 20
    if parsed_data.get("email"): score += 25
    if parsed_data.get("phone"): score += 25
    if parsed_data.get("linkedin"): score += 15
    if parsed_data.get("github"): score += 15
    return min(score, 100)


def _readability_score_ats(raw_text: str) -> float:
    words = len(raw_text.split())
    if not words:
        return 0
    if 300 <= words <= 1000:
        return 100
    if 200 <= words <= 1400:
        return 60
    return 30


def _generate_ats_warnings(parsed_data: Dict, sections: List[str], skills: List[str], raw_text: str, words: int) -> List[Dict]:
    warnings: List[Dict] = []
    present = set(sections)

    if not parsed_data.get("email"):
        warnings.append({"type": "contact", "severity": "high", "message": "Email address not detected. Recruiters cannot contact you."})
    if not parsed_data.get("phone"):
        warnings.append({"type": "contact", "severity": "high", "message": "Phone number not detected."})
    if not parsed_data.get("linkedin"):
        warnings.append({"type": "contact", "severity": "medium", "message": "LinkedIn profile not detected."})
    if not parsed_data.get("summary"):
        warnings.append({"type": "summary", "severity": "medium", "message": "No professional summary detected."})
    if "experience" not in present and "internships" not in present:
        warnings.append({"type": "sections", "severity": "medium", "message": "No experience or internship section detected."})
    if "projects" not in present:
        warnings.append({"type": "sections", "severity": "medium", "message": "No projects section detected."})
    if "education" not in present:
        warnings.append({"type": "sections", "severity": "high", "message": "No education section detected."})
    if "skills" not in present:
        warnings.append({"type": "sections", "severity": "high", "message": "No dedicated skills section detected."})
    if len(skills) < 5:
        warnings.append({"type": "skills", "severity": "medium", "message": "Few technical skills detected. Add 7-10 skills relevant to your target role."})
    if words > 1000:
        warnings.append({"type": "length", "severity": "medium", "message": "Resume is quite long (1000+ words). Keep it within 1-2 pages."})
    elif words < 250:
        warnings.append({"type": "length", "severity": "medium", "message": "Resume is very short. Expand sections with more detail."})
    if UNUSUAL_SYMBOL_PATTERN.search(raw_text):
        warnings.append({"type": "formatting", "severity": "low", "message": "Unusual symbols detected that may confuse parsing."})
    if re.search(r"[|]{2,}", raw_text):
        warnings.append({"type": "formatting", "severity": "low", "message": "Multiple pipe characters detected; consider simpler separators."})
    long_paras = [len(p) for p in raw_text.split("\n\n") if len(p) > PARAGRAPH_TOO_LONG]
    if long_paras:
        warnings.append({"type": "formatting", "severity": "medium", "message": f"{len(long_paras)} very long paragraph(s) detected. Use concise bullet points."})
    if parsed_data.get("projects"):
        weak_projects = sum(1 for p in parsed_data["projects"] if len(p.get("description", "")) < 30)
        if weak_projects:
            warnings.append({"type": "projects", "severity": "low", "message": f"{weak_projects} project(s) have very short descriptions. Add problem, technologies and outcome."})

    return warnings[:8]


def _analyze_projects(projects: List[Dict]) -> List[Dict]:
    analysis = []
    for p in projects or []:
        desc = p.get("description", "")
        desc_lower = desc.lower()
        has_action = any(v in desc_lower for v in ACTION_VERBS)
        has_tech = bool(p.get("techStack")) or bool(match_skills_in_text(desc))
        has_problem = bool(PROBLEM_PATTERN.search(desc_lower))
        has_result = bool(RESULT_PATTERN.search(desc_lower))
        has_metric = bool(QUANTIFICATION_PATTERN.search(desc))
        has_link = bool(p.get("link"))

        score = sum([has_action, has_tech, has_problem, has_result, has_metric, has_link])
        if score >= 4:
            strength = "strong"
        elif score >= 3:
            strength = "moderate"
        elif len(desc) >= 10:
            strength = "weak"
        else:
            strength = "minimal"

        recommendation = _project_recommendation(strength, desc, has_problem, has_result, has_metric)

        analysis.append({
            "title": p.get("title", "Untitled project"),
            "hasAction": has_action,
            "hasTechnology": has_tech,
            "hasProblem": has_problem,
            "hasResult": has_result,
            "hasMetric": has_metric,
            "hasLink": has_link,
            "strength": strength,
            "recommendation": recommendation,
        })
    return analysis


def _project_recommendation(strength: str, desc: str, has_problem: bool, has_result: bool, has_metric: bool) -> str:
    if strength == "strong":
        return "Project is well described. Consider adding a live link or demo if you have one."
    if not desc:
        return "Add a description covering the problem solved, technologies used, implementation and outcome."
    parts = []
    if not has_problem:
        parts.append("state the problem or goal the project addresses")
    if not has_metric:
        parts.append("add a measurable outcome (e.g. accuracy %, load time reduced, users served) only if real")
    if not has_result:
        parts.append("describe the final outcome or impact")
    if not parts:
        parts.append("add the technologies used and your specific contribution")
    return "Describe it better: " + "; ".join(parts) + "."


def _analyze_experience(experience: List[Dict]) -> List[Dict]:
    analysis = []
    for e in experience or []:
        desc = e.get("description", "")
        desc_lower = desc.lower()
        has_action = any(v in desc_lower for v in ACTION_VERBS)
        has_tech = bool(e.get("technologies"))
        has_result = bool(RESULT_PATTERN.search(desc_lower))
        has_metric = bool(QUANTIFICATION_PATTERN.search(desc))
        completeness = sum([bool(e.get("company")), bool(e.get("role")), bool(e.get("duration")), has_action, has_tech])
        score = sum([has_action, has_tech, has_result, has_metric, has_metric])

        if completeness >= 4:
            strength = "strong"
        elif completeness >= 2:
            strength = "moderate"
        elif desc:
            strength = "weak"
        else:
            strength = "minimal"

        if strength == "strong":
            recommendation = "Well documented. Add any quantifiable achievement if available."
        elif not desc:
            recommendation = "Add responsibilities and achievements for this role with action verbs."
        else:
            parts = []
            if not has_action:
                parts.append("start bullets with action verbs (built, optimized, led)")
            if not has_metric:
                parts.append("add a quantifiable achievement if real (e.g. reduced processing time by 20%)")
            if not has_tech:
                parts.append("mention the technologies used")
            recommendation = "Improve: " + "; ".join(parts) + "."

        analysis.append({
            "company": e.get("company", ""),
            "role": e.get("role", ""),
            "duration": e.get("duration", ""),
            "hasAction": has_action,
            "hasTechnology": has_tech,
            "hasResult": has_result,
            "hasMetric": has_metric,
            "strength": strength,
            "recommendation": recommendation,
        })
    return analysis


def _analyze_education(education: List[Dict]) -> Dict:
    if not education:
        return {
            "detected": False,
            "entries": [],
            "completeness": 0,
            "missing": ["Add your degree, institution and graduation year."],
        }
    entries = []
    missing_fields = []
    for e in education:
        missing = []
        if not e.get("degree"): missing.append("degree")
        if not e.get("institute"): missing.append("institution")
        if not e.get("year"): missing.append("graduation year")
        if not e.get("gpa"): missing.append("CGPA/percentage")
        entries.append({"degree": e.get("degree", ""), "institute": e.get("institute", ""), "year": e.get("year", ""), "gpa": e.get("gpa", ""), "branch": e.get("branch", ""), "missing": missing})
        missing_fields.extend(missing)
    total_possible = len(entries) * 4
    present_count = total_possible - len(set(missing_fields))
    return {
        "detected": True,
        "entries": entries,
        "completeness": round(present_count / max(total_possible, 1) * 100),
        "missing": list(dict.fromkeys(missing_fields))[:5],
    }


def _skill_levels(skills: List[str], skill_details: Dict, raw_text: str) -> Dict[str, List[str]]:
    details = skill_details or {}
    strong = [s for s in skills if details.get(s, {}).get("level") == "strong"]
    mentioned = [s for s in skills if details.get(s, {}).get("level") == "mentioned"]
    weak = [s for s in skills if details.get(s, {}).get("level") == "weak"]
    return {
        "strong": strong,
        "mentioned": mentioned,
        "weak": weak,
        "categories": categorize_skills(skills),
    }


def estimate_experience_years(parsed_data: Dict) -> float:
    """Estimate total years of experience from duration strings."""
    total = 0.0
    entries = list(parsed_data.get("experience", [])) + list(parsed_data.get("internships", []))
    for e in entries:
        duration = e.get("duration", "")
        total += _duration_to_years(duration)
    if total > 0:
        return round(total, 1)
    return float(parsed_data.get("experienceYears") or 0)


def _duration_to_years(duration: str) -> float:
    if not duration:
        return 0.0
    months_match = re.findall(r"(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*(\d{4})", duration, re.IGNORECASE)
    if len(months_match) >= 2:
        start_y, end_y = int(months_match[0]), int(months_match[-1])
        return max(end_y - start_y + 1, 0.5)
    years_match = re.findall(r"\b((?:19|20)\d{2})\b", duration)
    if len(years_match) >= 2:
        start, end = int(years_match[0]), int(years_match[-1])
        return max(end - start + 1, 0.5)
    return 0.5 if re.search(r"\b\d{4}\b", duration) else 0.0
