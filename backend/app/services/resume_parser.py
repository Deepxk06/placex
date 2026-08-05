import re
from typing import Optional


SKILL_PATTERNS = {
    "programming": ["python", "java", "javascript", "c\\+\\+", "typescript", "go", "rust", "swift", "kotlin"],
    "web": ["react", "angular", "vue", "node", "django", "flask", "html", "css", "express"],
    "database": ["sql", "mongodb", "postgresql", "mysql", "redis", "oracle", "firebase"],
    "cloud": ["aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins"],
    "data": ["machine learning", "deep learning", "nlp", "tensorflow", "pytorch", "pandas", "numpy"],
    "tools": ["git", "linux", "agile", "scrum", "jira", "ci/cd"],
}


async def parse_resume_pdf(content: bytes, filename: str) -> dict:
    try:
        import fitz  # PyMuPDF (lazy-loaded to keep startup fast)
        doc = fitz.open(stream=content, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
    except Exception:
        text = content.decode("utf-8", errors="ignore")
    return extract_resume_data(text)


def extract_resume_data(text: str) -> dict:
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    email = extract_email(text)
    phone = extract_phone(text)
    name = lines[0] if lines else ""
    skills = extract_skills(text)
    education = extract_education(text)
    experience = extract_experience(text)
    projects = extract_projects(text)
    certifications = extract_certifications(text)
    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": skills,
        "education": education,
        "experience": experience,
        "projects": projects,
        "certifications": certifications,
        "rawText": text,
    }


def extract_email(text: str) -> str:
    match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    return match.group(0) if match else ""


def extract_phone(text: str) -> str:
    match = re.search(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)
    return match.group(0) if match else ""


def extract_skills(text: str) -> list:
    found = set()
    text_lower = text.lower()
    for category, patterns in SKILL_PATTERNS.items():
        for pattern in patterns:
            if re.search(r"\b" + pattern + r"\b", text_lower):
                found.add(pattern.replace("\\", "").replace("+", "+"))
    return sorted(found)


def extract_education(text: str) -> list:
    education_keywords = ["bachelor", "master", "phd", "b.tech", "m.tech", "b.e", "m.e",
                          "b.sc", "m.sc", "bca", "mca", "bba", "mba", "degree", "university",
                          "college", "institute", "school"]
    lines = text.split("\n")
    education = []
    for i, line in enumerate(lines):
        line_lower = line.lower()
        if any(kw in line_lower for kw in education_keywords):
            entry = {"degree": line.strip(), "institute": "", "year": "", "gpa": ""}
            if i + 1 < len(lines):
                entry["institute"] = lines[i + 1].strip()
            education.append(entry)
    return education


def extract_experience(text: str) -> list:
    exp_keywords = ["experience", "work", "employment", "job", "intern", "professional"]
    lines = text.split("\n")
    experience = []
    in_exp = False
    current = {}
    for line in lines:
        line_lower = line.lower()
        if any(kw in line_lower for kw in exp_keywords) and len(line) < 30:
            in_exp = True
            continue
        if in_exp and line.strip():
            if not current:
                current = {"company": line.strip(), "role": "", "duration": "", "description": ""}
            elif "role" not in current or not current["role"]:
                current["role"] = line.strip()
            elif "duration" not in current or not current["duration"]:
                current["duration"] = line.strip()
            else:
                current["description"] += line.strip() + " "
        elif in_exp and not line.strip() and current:
            experience.append(current)
            current = {}
    if current:
        experience.append(current)
    return experience


def extract_projects(text: str) -> list:
    proj_keywords = ["project", "projects"]
    lines = text.split("\n")
    projects = []
    in_proj = False
    current = {}
    for line in lines:
        line_lower = line.lower()
        if any(kw in line_lower for kw in proj_keywords) and len(line) < 30:
            in_proj = True
            continue
        if in_proj and line.strip():
            if not current:
                current = {"title": line.strip(), "description": "", "techStack": []}
            else:
                current["description"] += line.strip() + " "
        elif in_proj and not line.strip() and current:
            projects.append(current)
            current = {}
    if current:
        projects.append(current)
    return projects


def extract_certifications(text: str) -> list:
    cert_keywords = ["certification", "certificate", "certified", "credential"]
    lines = text.split("\n")
    certs = []
    for i, line in enumerate(lines):
        line_lower = line.lower()
        if any(kw in line_lower for kw in cert_keywords) and len(line) < 40:
            certs.append({"name": line.strip(), "issuer": lines[i + 1].strip() if i + 1 < len(lines) else ""})
    return certs
