import re
from typing import Dict, List, Tuple

SKILL_CATALOG = [
    # Programming Languages
    {"name": "Python", "category": "Programming Languages", "aliases": ["python", "python3"]},
    {"name": "Java", "category": "Programming Languages", "aliases": ["java"]},
    {"name": "C", "category": "Programming Languages", "aliases": ["c programming", "c language", r"\bc\b(?!\+|#)"]},
    {"name": "C++", "category": "Programming Languages", "aliases": ["c++", "cpp"]},
    {"name": "C#", "category": "Programming Languages", "aliases": ["c#", "csharp"]},
    {"name": "JavaScript", "category": "Programming Languages", "aliases": ["javascript", "java script", r"\bjs\b"]},
    {"name": "TypeScript", "category": "Programming Languages", "aliases": ["typescript", "type script"]},
    {"name": "Go", "category": "Programming Languages", "aliases": [r"\bgolang\b", r"\bgo\b(?!lang)"]},
    {"name": "Rust", "category": "Programming Languages", "aliases": ["rust"]},
    {"name": "Swift", "category": "Programming Languages", "aliases": ["swift"]},
    {"name": "Kotlin", "category": "Programming Languages", "aliases": ["kotlin"]},
    {"name": "Ruby", "category": "Programming Languages", "aliases": ["ruby", "ruby on rails", "rails"]},
    {"name": "PHP", "category": "Programming Languages", "aliases": ["php"]},
    {"name": "HTML", "category": "Programming Languages", "aliases": ["html", "html5"]},
    {"name": "CSS", "category": "Programming Languages", "aliases": ["css", "css3", "scss", "sass"]},
    {"name": "MATLAB", "category": "Programming Languages", "aliases": ["matlab"]},
    {"name": "R", "category": "Programming Languages", "aliases": [r"\br\b(?!esponsive)"]},
    # Data Science & AI
    {"name": "Machine Learning", "category": "Data Science & AI", "aliases": ["machine learning", "machine-learning", r"\bml\b"]},
    {"name": "Deep Learning", "category": "Data Science & AI", "aliases": ["deep learning", "deep-learning"]},
    {"name": "NLP", "category": "Data Science & AI", "aliases": [r"\bnlp\b", "natural language processing"]},
    {"name": "Computer Vision", "category": "Data Science & AI", "aliases": ["computer vision", "image processing"]},
    {"name": "LLM", "category": "Data Science & AI", "aliases": [r"\bllm\b", "large language model", "large language models"]},
    {"name": "Generative AI", "category": "Data Science & AI", "aliases": ["generative ai", "gen ai", "genai"]},
    {"name": "RAG", "category": "Data Science & AI", "aliases": [r"\brag\b", "retrieval augmented generation"]},
    {"name": "Pandas", "category": "Data Science & AI", "aliases": ["pandas"]},
    {"name": "NumPy", "category": "Data Science & AI", "aliases": ["numpy", "num py"]},
    {"name": "Scikit-learn", "category": "Data Science & AI", "aliases": ["scikit-learn", "scikit learn", "sklearn"]},
    {"name": "TensorFlow", "category": "Data Science & AI", "aliases": ["tensorflow", "tensor flow"]},
    {"name": "PyTorch", "category": "Data Science & AI", "aliases": ["pytorch", "py torch"]},
    {"name": "Keras", "category": "Data Science & AI", "aliases": ["keras"]},
    {"name": "OpenCV", "category": "Data Science & AI", "aliases": ["opencv", "open cv"]},
    {"name": "Statistics", "category": "Data Science & AI", "aliases": ["statistics", "statistical", r"\bstats\b"]},
    {"name": "Data Visualization", "category": "Data Science & AI", "aliases": ["data visualization", "data visualisation", "visualization"]},
    {"name": "Data Analysis", "category": "Data Science & AI", "aliases": ["data analysis", "data analytics", "analytics"]},
    {"name": "A/B Testing", "category": "Data Science & AI", "aliases": ["a/b testing", "ab testing"]},
    {"name": "Feature Engineering", "category": "Data Science & AI", "aliases": ["feature engineering"]},
    {"name": "MLOps", "category": "Data Science & AI", "aliases": ["mlops", "ml ops"]},
    {"name": "LangChain", "category": "Data Science & AI", "aliases": ["langchain", "lang chain"]},
    {"name": "Transformers", "category": "Data Science & AI", "aliases": ["transformers", "transformer model", "transformer models"]},
    # Databases
    {"name": "SQL", "category": "Databases", "aliases": [r"\bsql\b", "structured query language", r"\btsql\b"]},
    {"name": "PostgreSQL", "category": "Databases", "aliases": ["postgresql", "postgres", "postgres db", "postgres sql"]},
    {"name": "MySQL", "category": "Databases", "aliases": ["mysql"]},
    {"name": "MongoDB", "category": "Databases", "aliases": ["mongodb", "mongo db", r"\bmongo\b"]},
    {"name": "Redis", "category": "Databases", "aliases": ["redis"]},
    {"name": "Oracle", "category": "Databases", "aliases": ["oracle"]},
    {"name": "SQLite", "category": "Databases", "aliases": ["sqlite"]},
    {"name": "SQL Server", "category": "Databases", "aliases": ["sql server", "mssql"]},
    {"name": "Firebase", "category": "Databases", "aliases": ["firebase", "fire store", "firestore"]},
    {"name": "Elasticsearch", "category": "Databases", "aliases": ["elasticsearch", "elastic search"]},
    # Cloud
    {"name": "AWS", "category": "Cloud", "aliases": [r"\baws\b", "amazon web services", "amazon s3", r"\bec2\b", r"\blambda\b"]},
    {"name": "Azure", "category": "Cloud", "aliases": ["azure", "microsoft azure"]},
    {"name": "GCP", "category": "Cloud", "aliases": [r"\bgcp\b", "google cloud", "google cloud platform"]},
    # DevOps & Tools
    {"name": "Docker", "category": "DevOps & Tools", "aliases": ["docker", "dockerize", "containerization", "containers"]},
    {"name": "Kubernetes", "category": "DevOps & Tools", "aliases": ["kubernetes", "k8s"]},
    {"name": "Git", "category": "DevOps & Tools", "aliases": [r"\bgit\b", "version control", "vcs"]},
    {"name": "GitHub", "category": "DevOps & Tools", "aliases": ["github"]},
    {"name": "GitLab", "category": "DevOps & Tools", "aliases": ["gitlab"]},
    {"name": "Linux", "category": "DevOps & Tools", "aliases": ["linux", "ubuntu", "unix"]},
    {"name": "CI/CD", "category": "DevOps & Tools", "aliases": ["ci/cd", "cicd", "continuous integration", "continuous deployment"]},
    {"name": "Jenkins", "category": "DevOps & Tools", "aliases": ["jenkins"]},
    {"name": "Terraform", "category": "DevOps & Tools", "aliases": ["terraform"]},
    {"name": "Agile", "category": "DevOps & Tools", "aliases": ["agile", "agile methodology", "agile development"]},
    {"name": "Scrum", "category": "DevOps & Tools", "aliases": ["scrum"]},
    {"name": "Jira", "category": "DevOps & Tools", "aliases": ["jira"]},
    {"name": "Kafka", "category": "DevOps & Tools", "aliases": ["kafka", "apache kafka"]},
    {"name": "Spark", "category": "DevOps & Tools", "aliases": ["spark", "pyspark", "apache spark"]},
    {"name": "Airflow", "category": "DevOps & Tools", "aliases": ["airflow", "apache airflow"]},
    {"name": "Postman", "category": "DevOps & Tools", "aliases": ["postman"]},
    {"name": "Excel", "category": "DevOps & Tools", "aliases": ["excel", "microsoft excel"]},
    {"name": "Tableau", "category": "DevOps & Tools", "aliases": ["tableau"]},
    {"name": "Power BI", "category": "DevOps & Tools", "aliases": ["power bi", "powerbi"]},
    # Frameworks & Libraries
    {"name": "FastAPI", "category": "Frameworks & Libraries", "aliases": ["fastapi", "fast api"]},
    {"name": "Django", "category": "Frameworks & Libraries", "aliases": ["django"]},
    {"name": "Flask", "category": "Frameworks & Libraries", "aliases": ["flask"]},
    {"name": "React", "category": "Frameworks & Libraries", "aliases": ["react", "react.js", "reactjs"]},
    {"name": "React Native", "category": "Frameworks & Libraries", "aliases": ["react native"]},
    {"name": "Angular", "category": "Frameworks & Libraries", "aliases": ["angular"]},
    {"name": "Vue", "category": "Frameworks & Libraries", "aliases": ["vue", "vue.js", "vuejs"]},
    {"name": "Node.js", "category": "Frameworks & Libraries", "aliases": ["node.js", "nodejs", r"\bnode\b"]},
    {"name": "Express", "category": "Frameworks & Libraries", "aliases": ["express", "express.js"]},
    {"name": "Spring", "category": "Frameworks & Libraries", "aliases": ["spring boot", "springboot", r"\bspring\b"]},
    {"name": "Next.js", "category": "Frameworks & Libraries", "aliases": ["next.js", "nextjs"]},
    {"name": "Tailwind CSS", "category": "Frameworks & Libraries", "aliases": ["tailwind", "tailwind css"]},
    {"name": "Bootstrap", "category": "Frameworks & Libraries", "aliases": ["bootstrap"]},
    {"name": "REST API", "category": "Frameworks & Libraries", "aliases": ["rest api", "restful api", "rest apis", "restful"]},
    {"name": "GraphQL", "category": "Frameworks & Libraries", "aliases": ["graphql"]},
    {"name": "Microservices", "category": "Frameworks & Libraries", "aliases": ["microservices", "micro service", "micro-services"]},
    {"name": "OOP", "category": "Frameworks & Libraries", "aliases": [r"\boop\b", "object oriented programming", "object-oriented programming"]},
    {"name": "Data Structures", "category": "Frameworks & Libraries", "aliases": ["data structures", "data structure"]},
    {"name": "Algorithms", "category": "Frameworks & Libraries", "aliases": ["algorithms"]},
    {"name": "System Design", "category": "Frameworks & Libraries", "aliases": ["system design", "system architecture", "high level design", "low level design"]},
    # Testing & QA
    {"name": "Unit Testing", "category": "Testing & QA", "aliases": ["unit testing", "unit tests"]},
    {"name": "Jest", "category": "Testing & QA", "aliases": ["jest"]},
    {"name": "Pytest", "category": "Testing & QA", "aliases": ["pytest", "py test"]},
    {"name": "Selenium", "category": "Testing & QA", "aliases": ["selenium"]},
    # Soft Skills
    {"name": "Communication", "category": "Soft Skills", "aliases": ["communication", "communication skills"]},
    {"name": "Teamwork", "category": "Soft Skills", "aliases": ["teamwork", "team work", "team collaboration"]},
    {"name": "Leadership", "category": "Soft Skills", "aliases": ["leadership", "leadership skills"]},
    {"name": "Problem Solving", "category": "Soft Skills", "aliases": ["problem solving", "problem-solving", "problem solver"]},
    {"name": "Critical Thinking", "category": "Soft Skills", "aliases": ["critical thinking"]},
    {"name": "Time Management", "category": "Soft Skills", "aliases": ["time management"]},
    {"name": "Adaptability", "category": "Soft Skills", "aliases": ["adaptability", "adaptable"]},
    {"name": "Creativity", "category": "Soft Skills", "aliases": ["creativity", "creative thinking"]},
    {"name": "Attention to Detail", "category": "Soft Skills", "aliases": ["attention to detail", "detail oriented"]},
    {"name": "Collaboration", "category": "Soft Skills", "aliases": ["collaboration", "collaborative"]},
    {"name": "Presentation", "category": "Soft Skills", "aliases": ["presentation", "presentation skills"]},
    {"name": "Public Speaking", "category": "Soft Skills", "aliases": ["public speaking"]},
    {"name": "Documentation", "category": "Soft Skills", "aliases": ["documentation", "technical documentation"]},
    {"name": "Project Management", "category": "Soft Skills", "aliases": ["project management", "project planning"]},
]

CATEGORY_ORDER = [
    "Programming Languages", "Data Science & AI", "Databases", "Cloud",
    "DevOps & Tools", "Frameworks & Libraries", "Testing & QA",
    "Soft Skills", "Other",
]

CATEGORY_DISPLAY = {cat: cat for cat in CATEGORY_ORDER}

CANONICAL_TO_CATEGORY = {e["name"]: e["category"] for e in SKILL_CATALOG}

NON_SKILL_ALIASES = {  # regex aliases too ambiguous to trust outside an explicit skills context
    r"\bml\b", r"\bcpp\b", r"\br\b(?!esponsive)", r"\bnode\b", r"\bspring\b",
    r"\bgo\b(?!lang)", r"\bc\b(?!\+|#)", r"\bjs\b", r"\btsql\b", r"\blambda\b",
}


def _wrap_alias(alias: str) -> str:
    """Wrap plain aliases in word boundaries; regex aliases are used as-is."""
    if alias.startswith("\\"):
        return alias
    return r"\b" + re.escape(alias) + r"\b"


def _compile_patterns() -> List[Tuple[str, str, str]]:
    patterns = []
    for entry in SKILL_CATALOG:
        for alias in entry["aliases"]:
            try:
                compiled = _wrap_alias(alias)
                re.compile(compiled)
            except re.error:
                continue
            patterns.append((entry["name"], entry["category"], compiled))
    return patterns


_SKILL_PATTERNS = _compile_patterns()


def _raw_to_canonical_map() -> Dict[str, str]:
    mapping = {}
    for entry in SKILL_CATALOG:
        mapping[entry["name"].lower()] = entry["name"]
        for alias in entry["aliases"]:
            mapping[alias.lower()] = entry["name"]
    return mapping


_CANONICAL_BY_RAW = _raw_to_canonical_map()


def _clean_key(value: str) -> str:
    v = value.replace("\\b", "").replace("\\B", "")
    v = re.sub(r"\(\?[!=][^)]*\)", "", v)
    v = re.sub(r"\\[dDwWsS]", "", v)
    return re.sub(r"[^a-z0-9]", "", v.lower())


def _clean_canonical_map() -> Dict[str, str]:
    """Map alias text stripped of punctuation/symbols to canonical names.

    Only unambiguous cleaned keys are included (e.g. 'c++' -> 'c' collides
    with the language 'C', so it is excluded and handled by exact match).
    """
    clean_keys: Dict[str, str] = {}
    for entry in SKILL_CATALOG:
        for alias in entry["aliases"]:
            cleaned = _clean_key(alias)
            if cleaned in clean_keys and clean_keys[cleaned] != entry["name"]:
                clean_keys[cleaned] = None
            elif cleaned not in clean_keys:
                clean_keys[cleaned] = entry["name"]
    return {k: v for k, v in clean_keys.items() if v is not None}


_CANONICAL_BY_CLEAN = _clean_canonical_map()


def normalize_skill(raw: str) -> str:
    """Normalize a raw skill name to its canonical form, or return the title-cased raw value."""
    if not raw:
        return ""
    key = raw.strip().lower()
    canonical = _CANONICAL_BY_RAW.get(key)
    if canonical:
        return canonical
    cleaned = _clean_key(key)
    if cleaned in _CANONICAL_BY_CLEAN:
        return _CANONICAL_BY_CLEAN[cleaned]
    return raw.strip().title()


def normalize_skill_list(skills) -> List[str]:
    """Normalize a list of raw skill strings to canonical names (deduplicated, order preserved)."""
    seen = set()
    result = []
    for skill in skills or []:
        if not skill or not str(skill).strip():
            continue
        name = normalize_skill(str(skill))
        key = name.lower()
        if key not in seen:
            seen.add(key)
            result.append(name)
    return result


def match_skills_in_text(text: str, trust_ambiguous: bool = True) -> List[str]:
    """Find canonical skills present in text (deduplicated, ordered by catalog)."""
    if not text:
        return []
    text_lower = text.lower()
    found = set()
    for canonical, _category, pattern in _SKILL_PATTERNS:
        if pattern in NON_SKILL_ALIASES and not trust_ambiguous:
            continue
        try:
            if re.search(pattern, text_lower):
                found.add(canonical)
        except re.error:
            continue
    return [e["name"] for e in SKILL_CATALOG if e["name"] in found]


def categorize_skills(skills: List[str]) -> Dict[str, List[str]]:
    """Group canonical skills by category."""
    grouped: Dict[str, List[str]] = {}
    for skill in skills or []:
        category = CANONICAL_TO_CATEGORY.get(skill, "Other")
        grouped.setdefault(category, []).append(skill)
    return {cat: grouped.get(cat, []) for cat in CATEGORY_ORDER if grouped.get(cat)}


def skill_occurrence_count(text: str, canonical: str) -> int:
    """Count approximate occurrences of a canonical skill in text (alias-aware)."""
    if not text:
        return 0
    text_lower = text.lower()
    count = 0
    for entry in SKILL_CATALOG:
        if entry["name"] != canonical:
            continue
        for alias in entry["aliases"]:
            try:
                count += len(re.findall(_wrap_alias(alias), text_lower))
            except re.error:
                continue
        return count
    return 0


def extract_skills_from_section(section_text: str) -> List[str]:
    """Extract skills from a skills section body (comma / pipe / bullet separated)."""
    if not section_text:
        return []
    parts = []
    for line in section_text.split("\n"):
        line = line.strip().lstrip("-*•·›")
        parts.extend(re.split(r"[,|;]", line))
    parts = [p.strip() for p in parts if p.strip()]
    return normalize_skill_list(parts)
