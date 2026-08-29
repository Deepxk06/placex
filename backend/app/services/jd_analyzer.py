import re
from typing import Dict, List

from app.services.resume_skills import match_skills_in_text

HEADING_PATTERNS = {
    "preferred": [r"preferred\s*qualifications?", r"nice\s*to\s*haves?", r"good\s*to\s*haves?", r"bonus\s*(points)?", r"plus", r"desired\s*(skills|qualifications)?", r"would\s*be\s*(great|nice)"],
    "optional": [r"optional", r"not\s*required", r"benefits"],
    "required": [r"^requirements?$", r"^qualifications?$", r"what\s*you[\'’]ll?\s*(need|bring)", r"must\s*haves?", r"essential", r"minimum\s*qualifications?"],
    "responsibilities": [r"responsibilities?", r"what\s*you[\'’]ll\s*do", r"key\s*responsibilities?", r"duties", r"day[- ]to[- ]day", r"the\s*role"],
    "education": [r"education", r"educational\s*requirements?", r"academic\s*requirements?"],
}

REQUIRED_PHRASE = re.compile(r"\b(must|required|requirement|essential|strong|proficiency|proficient|experience\s*(with|in)|hands-?on|solid|expert)\b", re.IGNORECASE)
PREFERRED_PHRASE = re.compile(r"\b(preferred|preferably|nice-?to-?have|desired|plus|bonus|good\s*to\s*have|advantageous|bonus)\b", re.IGNORECASE)

EXPERIENCE_REQ_PATTERN = re.compile(r"(\d{1,2})\s*\+?\s*(?:-|to)?\s*(\d{1,2})?\s*years?\s*(?:of)?\s*(?:relevant\s*)?(?:professional\s*)?(?:work\s*)?experience", re.IGNORECASE)

DEGREE_KEYWORDS = ["b.tech", "b.e.", "b.sc", "m.tech", "m.sc", "bca", "mca", "bba", "mba", "bachelor", "master", "phd", "degree", "diploma"]

TITLE_PATTERN = re.compile(
    r"^(?P<title>[A-Z][A-Za-z&\-\s]+?(?:Engineer|Developer|Scientist|Analyst|Architect|Designer|Manager|Consultant|Intern|Specialist|Lead|Trainee|Executive|Coordinator))"
)


async def analyze_job_description(jd_text: str) -> Dict:
    """Extract structured information from a job description."""
    if not jd_text or not jd_text.strip():
        return {"title": "", "skills": {"required": [], "preferred": [], "optional": []}, "experience": {"minYears": None, "text": ""}, "education": [], "responsibilities": [], "certifications": []}

    title = extract_title(jd_text)
    segments = _split_segments(jd_text)
    skills_by_class = _extract_skills_by_class(segments)
    experience = extract_experience_requirement(jd_text)
    education = extract_education_requirement(jd_text)
    responsibilities = extract_responsibilities(segments)
    certifications = extract_certifications(jd_text)

    return {
        "title": title,
        "skills": skills_by_class,
        "experience": experience,
        "education": education,
        "responsibilities": responsibilities,
        "certifications": certifications,
    }


def extract_title(jd_text: str) -> str:
    lines = [l.strip() for l in jd_text.split("\n") if l.strip()]
    for line in lines[:8]:
        match = TITLE_PATTERN.match(line)
        if match:
            return match.group("title").strip()
        if len(line) < 60 and not line.lower().endswith((".", ":", ")")):
            if re.search(r"(Engineer|Developer|Scientist|Analyst|Designer|Manager|Intern|Specialist|Lead|Trainee)\b", line, re.IGNORECASE):
                return line.strip()
    return ""


def _split_segments(jd_text: str) -> Dict[str, str]:
    lines = [l.strip() for l in jd_text.split("\n")]
    segments = {k: [] for k in ("required", "preferred", "optional", "responsibilities", "general")}
    current = "general"
    for line in lines:
        if not line:
            continue
        cleaned = line.lstrip("-*•·#").rstrip(":.").lower()
        if len(cleaned) <= 35:
            matched = False
            for group, patterns in HEADING_PATTERNS.items():
                if group in ("required", "preferred", "optional"):
                    if any(re.search(p, cleaned) for p in patterns):
                        current = group
                        matched = True
                        break
                elif group == "responsibilities":
                    if any(re.search(p, cleaned) for p in patterns):
                        current = "responsibilities"
                        matched = True
                        break
            if matched:
                continue
        if current == "general":
            if REQUIRED_PHRASE.search(line):
                segments["required"].append(line)
            elif PREFERRED_PHRASE.search(line):
                segments["preferred"].append(line)
            else:
                segments["general"].append(line)
        else:
            segments[current].append(line)
    return {k: "\n".join(v) for k, v in segments.items()}


def _extract_skills_by_class(segments: Dict[str, str]) -> Dict[str, List[str]]:
    required_text = segments.get("required", "") + "\n" + segments.get("general", "")
    preferred_text = segments.get("preferred", "") + "\n" + segments.get("optional", "")

    required = match_skills_in_text(required_text)
    preferred_in = match_skills_in_text(preferred_text)

    # Skills mentioned in both preferred sections and requirements stay required.
    preferred = [s for s in preferred_in if s not in required]
    optional = [s for s in match_skills_in_text(segments.get("optional", "")) if s not in required and s not in preferred]

    return {
        "required": _dedupe(required),
        "preferred": _dedupe(preferred),
        "optional": _dedupe(optional),
    }


def _dedupe(items: List[str]) -> List[str]:
    seen = set()
    result = []
    for item in items:
        if item.lower() not in seen:
            seen.add(item.lower())
            result.append(item)
    return result


def extract_experience_requirement(jd_text: str) -> Dict:
    match = EXPERIENCE_REQ_PATTERN.search(jd_text)
    if not match:
        return {"minYears": None, "text": ""}
    min_years = int(match.group(1))
    max_years = int(match.group(2)) if match.group(2) else None
    return {"minYears": min_years, "maxYears": max_years, "text": match.group(0)}


def extract_education_requirement(jd_text: str) -> List[str]:
    lower = jd_text.lower()
    found = []
    for keyword in DEGREE_KEYWORDS:
        if re.search(r"\b" + re.escape(keyword) + r"\b", lower) and keyword not in found:
            found.append(keyword.title())
    return found[:6]


def extract_responsibilities(segments: Dict[str, str]) -> List[str]:
    text = segments.get("responsibilities", "")
    lines = [l.strip().lstrip("-*•·›") for l in text.split("\n") if l.strip()]
    return lines[:10]


def extract_certifications(jd_text: str) -> List[str]:
    lower = jd_text.lower()
    certs = []
    for keyword in ["aws certified", "google cloud certified", "azure certified", "pmp", "scrum master", "certified", "certification"]:
        if keyword in lower:
            certs.append(keyword.title())
    return certs[:5]
