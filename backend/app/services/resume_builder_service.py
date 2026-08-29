"""Shared helpers for the Build Resume module.

Keeps the router thin and gives the mapping logic a single place to be tested.
The PlaceX profile (User + UserProfile) stays the source of truth; a resume
holds an independent snapshot of its sections.
"""
from typing import Dict, List, Any

DEFAULT_SECTIONS: List[Dict[str, Any]] = [
    {"name": "personalInfo", "data": {}},
    {"name": "education", "data": {"entries": []}},
    {"name": "skills", "data": {"items": []}},
    {"name": "experience", "data": {"entries": []}},
    {"name": "projects", "data": {"entries": []}},
]

ALL_SECTIONS = [
    "personalInfo", "summary", "education", "skills", "projects",
    "experience", "internships", "certifications", "achievements",
    "languages", "coursework", "publications", "leadership",
    "volunteer", "extracurricular",
]

EXPERIENCE_LEVELS = ["fresher", "intern", "1-2 years", "3+ years"]

TARGET_ROLES = [
    "Data Scientist", "Data Analyst", "ML Engineer", "AI Engineer",
    "Software Developer", "Frontend Developer", "Backend Developer",
    "Full Stack Developer", "Cloud Engineer", "DevOps Engineer",
]

TEMPLATES = [
    {"id": "classic", "name": "Classic"},
    {"id": "modern", "name": "Modern Professional"},
    {"id": "minimal", "name": "Minimal"},
    {"id": "technical", "name": "Technical"},
]


def default_sections() -> List[Dict[str, Any]]:
    return [{"name": s["name"], "data": dict(s["data"])} for s in DEFAULT_SECTIONS]


def serialize_builder(b: Any) -> Dict[str, Any]:
    return {
        "id": str(b.id),
        "name": getattr(b, "name", None) or "Untitled Resume",
        "targetRole": getattr(b, "target_role", None) or "",
        "experienceLevel": getattr(b, "experience_level", None) or "fresher",
        "templateId": getattr(b, "template_id", None) or "classic",
        "version": getattr(b, "version", None) or 1,
        "sections": getattr(b, "sections", None) or [],
        "customizations": getattr(b, "customizations", None) or {},
        "createdAt": b.created_at.isoformat() if getattr(b, "created_at", None) else None,
        "updatedAt": b.updated_at.isoformat() if getattr(b, "updated_at", None) else None,
    }


def sections_to_dict(sections: List[Dict[str, Any]]) -> Dict[str, Dict]:
    return {s.get("name"): s.get("data", {}) for s in sections if isinstance(s, dict)}


def normalize_imported_skills(skills: List[str]) -> List[str]:
    """Deduplicate case-insensitively while preserving the user's spelling."""
    seen = set()
    result = []
    for s in skills or []:
        if not isinstance(s, str) or not s.strip():
            continue
        key = s.strip().lower()
        if key not in seen:
            seen.add(key)
            result.append(s.strip())
    return result


def build_profile_import(user: Any, profile: Any) -> Dict[str, Any]:
    """Map existing PlaceX profile data into resume sections (snapshot source)."""
    college = profile or None
    personal = {
        "fullName": user.name or "",
        "email": user.email or "",
        "phone": (college.phone if college else "") or "",
        "location": _join_location(college),
        "linkedIn": user.linked_in or "",
        "github": "",
        "portfolio": (college.website if college else "") or "",
        "targetRole": user.target_role or "",
        "summary": (college.bio if college else "") or "",
    }
    education = []
    if college and (college.college_name or college.degree):
        education.append({
            "degree": college.degree or "",
            "branch": college.branch or "",
            "institute": college.college_name or "",
            "year": college.end_year or "",
            "gpa": college.cgpa or "",
        })
    skills = normalize_imported_skills(list(user.skills or []) + list(user.desired_skills or []))
    projects = []
    for p in user.projects or []:
        if isinstance(p, dict):
            projects.append({
                "title": str(p.get("title", "") or ""),
                "description": str(p.get("description", "") or ""),
                "techStack": list(p.get("techStack", []) or p.get("technologies", []) or []),
                "link": str(p.get("link", "") or p.get("github", "") or ""),
            })
        elif isinstance(p, str) and p.strip():
            projects.append({"title": p.strip(), "description": "", "techStack": [], "link": ""})
    experience = []
    if user.current_company:
        experience.append({
            "company": user.current_company or "",
            "role": user.current_role or "",
            "location": "",
            "duration": f"{user.experience_years or 1} years" if (user.experience_years or 0) > 0 else "Present",
            "description": "",
            "technologies": [],
        })
    summary = personal.get("summary", "")
    return {
        "personalInfo": {"data": personal, "available": True},
        "education": {"data": {"entries": education}, "available": len(education) > 0},
        "skills": {"data": {"items": skills}, "available": len(skills) > 0},
        "projects": {"data": {"entries": projects}, "available": len(projects) > 0},
        "experience": {"data": {"entries": experience}, "available": len(experience) > 0},
        "certifications": {"data": {"entries": []}, "available": False, "note": "Add certifications manually in the editor."},
        "achievements": {"data": {"items": []}, "available": False, "note": "Add achievements manually in the editor."},
        "summary": {"data": {"text": summary}, "available": bool(summary), "note": "Stored in the Personal Info section."},
    }


def sections_to_parsed_data(sections: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Convert builder sections into the parsed-data shape used by the
    Resume Analysis / Job Matching services (reuse, no second engine)."""
    data = sections_to_dict(sections)
    personal = data.get("personalInfo", {})
    skills = data.get("skills", {}).get("items", [])
    parsed = {
        "name": personal.get("fullName", ""),
        "email": personal.get("email", ""),
        "phone": personal.get("phone", ""),
        "location": personal.get("location", ""),
        "linkedin": personal.get("linkedIn", ""),
        "github": personal.get("github", ""),
        "portfolio": personal.get("portfolio", ""),
        "targetRole": personal.get("targetRole", ""),
        "summary": personal.get("summary", ""),
        "skills": list(skills),
        "skillDetails": [{"skill": s, "category": ""} for s in skills],
        "education": [
            {
                "degree": e.get("degree", ""),
                "branch": e.get("branch", ""),
                "institute": e.get("institute", ""),
                "year": e.get("year", ""),
                "gpa": e.get("gpa", ""),
            }
            for e in data.get("education", {}).get("entries", [])
        ],
        "experience": [
            {
                "company": e.get("company", ""),
                "role": e.get("role", ""),
                "location": e.get("location", ""),
                "duration": e.get("duration", ""),
                "description": e.get("description", ""),
                "technologies": list(e.get("technologies", [])),
            }
            for e in data.get("experience", {}).get("entries", [])
        ],
        "internships": [
            {
                "company": e.get("company", ""),
                "role": e.get("role", ""),
                "duration": e.get("duration", ""),
                "description": e.get("description", ""),
            }
            for e in data.get("internships", {}).get("entries", [])
        ],
        "projects": [
            {
                "title": p.get("title", ""),
                "description": p.get("description", ""),
                "techStack": list(p.get("techStack", [])),
                "link": p.get("link", ""),
                "demo": p.get("demo", ""),
            }
            for p in data.get("projects", {}).get("entries", [])
        ],
        "certifications": [
            {
                "name": c.get("name", ""),
                "issuer": c.get("issuer", ""),
                "date": c.get("date", ""),
            }
            for c in data.get("certifications", {}).get("entries", [])
        ],
        "achievements": [a if isinstance(a, str) else a.get("text", "") for a in data.get("achievements", {}).get("items", [])],
        "languages": [l.get("language", "") for l in data.get("languages", {}).get("items", [])],
    }
    return parsed


def _join_location(profile: Any) -> str:
    if not profile:
        return ""
    parts = [p for p in [profile.city or "", profile.state or "", profile.country or ""] if p]
    return ", ".join(parts)


def estimate_page_count(parsed: Dict[str, Any]) -> int:
    words = len((parsed.get("summary") or "").split())
    for section in ("education", "experience", "internships", "projects", "certifications", "achievements"):
        words += sum(len(str(v).split()) for item in parsed.get(section, []) for v in item.values() if v)
    words += len(parsed.get("skills", []))
    if words <= 480:
        return 1
    if words <= 900:
        return 2
    return 3