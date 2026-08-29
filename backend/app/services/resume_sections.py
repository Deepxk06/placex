import re
from typing import Dict, List, Optional, Tuple

SECTION_HEADINGS: Dict[str, List[str]] = {
    "personal_info": [
        r"^personal\s*(information|details|info|profile)?$",
        r"^contact\s*(information|details)?$",
        r"^contact$",
        r"^about(\s*me)?$",
    ],
    "summary": [
        r"^professional\s*summary$",
        r"^summary$",
        r"^profile\s*summary$",
        r"^summary\s*of\s*qualifications$",
        r"^about\s*me$",
    ],
    "education": [
        r"^education$",
        r"^academic\s*background$",
        r"^academic\s*qualification(s)?$",
        r"^educational\s*(qualification|details|background|profile)(s)?$",
        r"^academics$",
        r"^educational\s*history$",
    ],
    "skills": [
        r"^technical\s*skills$",
        r"^core\s*competencies$",
        r"^skills$",
        r"^technologies$",
        r"^tech\s*stack$",
        r"^technical\s*proficiency$",
        r"^expertise$",
        r"^skills\s*&\s*tools$",
        r"^computer\s*skills$",
        r"^areas\s*of\s*expertise$",
    ],
    "experience": [
        r"^work\s*experience$",
        r"^professional\s*experience$",
        r"^employment\s*history$",
        r"^work\s*history$",
        r"^professional\s*background$",
        r"^experience$",
        r"^relevant\s*experience$",
    ],
    "internships": [
        r"^internships?$",
        r"^internship\s*experience$",
        r"^internships?\s*&?\s*trainings?$",
        r"^traineeships?$",
    ],
    "projects": [
        r"^projects?$",
        r"^academic\s*projects?$",
        r"^personal\s*projects?$",
        r"^project\s*work$",
        r"^key\s*projects?$",
        r"^major\s*projects?$",
        r"^software\s*projects?$",
        r"^independent\s*projects?$",
    ],
    "certifications": [
        r"^certifications?$",
        r"^certificates?$",
        r"^professional\s*certifications?$",
        r"^credentials$",
        r"^courses?\s*(completed|undertaken)?$",
        r"^online\s*courses?$",
    ],
    "achievements": [
        r"^achievements?$",
        r"^accomplishments?$",
        r"^awards?\s*(&\s*)?(honours?|achievements?)?$",
        r"^honours?\s*(&\s*)?(awards?|achievements?)?$",
        r"^honors?$",
        r"^awards?$",
    ],
    "languages": [
        r"^languages?$",
        r"^language\s*proficiency$",
        r"^spoken\s*languages?$",
    ],
    "publications": [
        r"^publications?$",
        r"^research\s*publications?$",
        r"^papers?\s*(published|presented)?$",
    ],
    "activities": [
        r"^activities?$",
        r"^extracurricular\s*activities?$",
        r"^volunteering?$",
        r"^volunteer\s*work$",
        r"^co-curricular$",
    ],
    "hobbies": [
        r"^hobbies?$",
        r"^interests?$",
        r"^hobbies?\s*&\s*interests?$",
    ],
    "soft_skills": [
        r"^soft\s*skills?$",
        r"^interpersonal\s*skills?$",
    ],
    "objective": [
        r"^objective$",
        r"^career\s*objective$",
        r"^professional\s*objective$",
        r"^summary$",
    ],
}

SECTION_PRIORITY = [
    "personal_info", "summary", "objective", "education", "skills",
    "soft_skills", "experience", "internships", "projects", "certifications",
    "achievements", "languages", "publications", "activities", "hobbies",
]

HEADING_MAX_LENGTH = 40

_HEADING_PATTERNS = [
    (section, pattern)
    for section, patterns in SECTION_HEADINGS.items()
    for pattern in patterns
]


def detect_sections(text: str) -> Dict[str, Dict[str, object]]:
    """Split resume text into sections by normalized heading detection.

    Returns {section_name: {"heading": str, "body": str, "lines": [...]}}.
    """
    if not text:
        return {}
    lines = [line.strip() for line in text.split("\n")]
    sections: Dict[str, Dict[str, object]] = {}
    current: Optional[Tuple[str, str, str]] = None  # (name, heading, body)

    def flush(name: Optional[str], heading: str, body: str):
        if name and body.strip():
            sections[name] = {"heading": heading, "body": body.strip(), "lines": [l for l in body.split("\n") if l.strip()]}

    for line in lines:
        if not line:
            continue
        detected = detect_heading(line)
        if detected:
            if current:
                flush(current[0], current[1], current[2])
            current = (detected, line, "")
        else:
            if current is None:
                continue
            current = (current[0], current[1], current[2] + "\n" + line if current[2] else line)
    if current:
        flush(current[0], current[1], current[2])

    ordered = {}
    for name in SECTION_PRIORITY:
        if name in sections:
            ordered[name] = sections[name]
    for name, data in sections.items():
        if name not in ordered:
            ordered[name] = data
    return ordered


def detect_heading(line: str) -> Optional[str]:
    """Return the normalized section name if the line looks like a section heading."""
    if not line:
        return None
    cleaned = line.strip().lstrip("-*•·›#").rstrip(":.")
    if not cleaned or len(cleaned) > HEADING_MAX_LENGTH:
        return None
    lower = cleaned.lower()
    # headings should not contain sentence-ending periods / lots of words
    if lower.count(" ") > 4 and not any(c.isdigit() for c in lower):
        return None
    for section, pattern in _HEADING_PATTERNS:
        if re.search(pattern, lower):
            return section
    return None


def normalize_heading(section_name: str) -> str:
    """Map a raw heading to the normalized section name."""
    detected = detect_heading(section_name)
    if detected:
        return detected
    return section_name.lower().strip()


def get_section_text(sections: Dict[str, Dict[str, object]], name: str) -> str:
    data = sections.get(name)
    if not data:
        return ""
    return str(data.get("body", ""))
