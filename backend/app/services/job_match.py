import re
from functools import lru_cache
from typing import Dict, List, Optional

from app.services.jd_analyzer import analyze_job_description
from app.services.resume_analyzer import estimate_experience_years, QUANTIFICATION_PATTERN
from app.services.resume_skills import match_skills_in_text, normalize_skill_list

# Configurable weights for job match scoring (sums to 1.0).
MATCH_WEIGHTS = {
    "required_skills": 0.35,
    "preferred_skills": 0.20,
    "semantic_similarity": 0.15,
    "experience_match": 0.10,
    "project_relevance": 0.10,
    "education_match": 0.10,
}


@lru_cache(maxsize=1)
def _get_embedding_model():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer("all-MiniLM-L6-v2")


async def compute_job_match(resume_data: Dict, jd_text: str, jd_analysis: Optional[Dict] = None) -> Dict:
    """Compute weighted job match score between resume and job description."""
    jd = jd_analysis or await analyze_job_description(jd_text)

    resume_skills = normalize_skill_list(resume_data.get("skills", []))
    resume_skill_set = {s.lower() for s in resume_skills}
    raw_text = resume_data.get("rawText", "").lower()
    text_skills = {s.lower() for s in match_skills_in_text(resume_data.get("rawText", ""))}

    required = jd["skills"]["required"]
    preferred = jd["skills"]["preferred"]
    optional = jd["skills"]["optional"]

    matched_required = [s for s in required if s.lower() in resume_skill_set or s.lower() in text_skills]
    missing_required = [s for s in required if s.lower() not in resume_skill_set and s.lower() not in text_skills]
    matched_preferred = [s for s in preferred if s.lower() in resume_skill_set or s.lower() in text_skills]
    missing_preferred = [s for s in preferred if s.lower() not in resume_skill_set and s.lower() not in text_skills]

    required_score = round(len(matched_required) / max(len(required), 1) * 100, 1)
    preferred_score = round(len(matched_preferred) / max(len(preferred), 1) * 100, 1)

    semantic = await _semantic_similarity(resume_data, jd_text)
    project_relevance = _project_relevance(resume_data, required + preferred + optional)
    experience_match = _experience_match(resume_data, jd["experience"])
    education_match = _education_match(resume_data, jd["education"])

    components = {
        "required_skills": (required_score, len(required) > 0),
        "preferred_skills": (preferred_score, len(preferred) > 0),
        "semantic_similarity": (semantic, True),
        "experience_match": (experience_match, True),
        "project_relevance": (project_relevance, True),
        "education_match": (education_match, True),
    }

    total_weight = 0.0
    weighted = 0.0
    for key, (score, applicable) in components.items():
        if not applicable:
            continue
        total_weight += MATCH_WEIGHTS[key]
        weighted += MATCH_WEIGHTS[key] * score
    score = round(weighted / max(total_weight, 1e-9), 1)

    weak_skills = _weak_skills(resume_data, jd, required + preferred)

    explanation = {
        "requiredSkills": {"matched": matched_required, "missing": missing_required, "score": required_score},
        "preferredSkills": {"matched": matched_preferred, "missing": missing_preferred, "score": preferred_score},
        "semanticSimilarity": semantic,
        "projectRelevance": project_relevance,
        "experienceMatch": experience_match,
        "educationMatch": education_match,
    }

    return {
        "score": min(score, 100),
        "weights": dict(MATCH_WEIGHTS),
        "explanation": explanation,
        "matchedSkills": list(dict.fromkeys(matched_required + matched_preferred)),
        "missingSkills": list(dict.fromkeys(missing_required + missing_preferred)),
        "weakSkills": weak_skills,
        "jobDescription": jd,
    }


async def _semantic_similarity(resume_data: Dict, jd_text: str) -> float:
    resume_text = " ".join([
        resume_data.get("summary", ""),
        " ".join(resume_data.get("skills", [])),
        " ".join(p.get("title", "") + " " + p.get("description", "") for p in resume_data.get("projects", [])),
        " ".join(e.get("role", "") + " " + e.get("description", "") for e in resume_data.get("experience", [])),
        " ".join(p.get("description", "") for p in resume_data.get("projects", [])),
    ])
    if not resume_text.strip():
        return 0.0
    try:
        model = _get_embedding_model()
        import torch
        emb1 = model.encode(resume_text, convert_to_tensor=True)
        emb2 = model.encode(jd_text, convert_to_tensor=True)
        similarity = torch.nn.functional.cosine_similarity(emb1.unsqueeze(0), emb2.unsqueeze(0)).item()
        return round(max(similarity, 0.0) * 100, 1)
    except Exception:
        return _token_overlap_fallback(resume_text, jd_text)


def _token_overlap_fallback(text_a: str, text_b: str) -> float:
    tokens_a = {t for t in re.findall(r"[a-z][a-z0-9#+.\-]{1,}", text_a.lower()) if len(t) > 2}
    tokens_b = {t for t in re.findall(r"[a-z][a-z0-9#+.\-]{1,}", text_b.lower()) if len(t) > 2}
    if not tokens_a or not tokens_b:
        return 0.0
    jaccard = len(tokens_a & tokens_b) / len(tokens_a | tokens_b)
    return round(min(jaccard * 100, 100), 1)


def _project_relevance(resume_data: Dict, jd_skills: List[str]) -> float:
    if not jd_skills:
        return 100.0
    jd_lower = {s.lower() for s in jd_skills}
    projects = resume_data.get("projects", [])
    if not projects:
        return 0.0
    relevant = 0
    for p in projects:
        stack = {s.lower() for s in (p.get("techStack") or [])}
        stack.update(match_skills_in_text(p.get("description", "")))
        if stack & jd_lower:
            relevant += 1
    return round(relevant / len(projects) * 100, 1)


def _experience_match(resume_data: Dict, jd_exp: Dict) -> float:
    min_years = (jd_exp or {}).get("minYears")
    if not min_years:
        return 100.0
    resume_years = estimate_experience_years(resume_data)
    if resume_years >= min_years:
        return 100.0
    return round(max(resume_years / min_years * 100, 0), 1)


def _education_match(resume_data: Dict, jd_education: List[str]) -> float:
    if not jd_education:
        return 100.0
    edu_text = " ".join(
        f"{e.get('degree', '')} {e.get('institute', '')} {e.get('branch', '')}"
        for e in resume_data.get("education", [])
    ).lower()
    matched = 0
    for req in jd_education:
        req_lower = req.lower()
        if any(kw in edu_text for kw in _edu_equivalents(req_lower)):
            matched += 1
    return round(matched / len(jd_education) * 100, 1)


def _edu_equivalents(req: str) -> List[str]:
    if "b.tech" in req or "b.e." in req:
        return ["b.tech", "b.e", "bachelor of technology", "bachelor of engineering", "engineering"]
    if "m.tech" in req or "m.sc" in req or "master" in req:
        return ["m.tech", "m.sc", "master"]
    if "bachelor" in req:
        return ["b.tech", "b.e", "b.sc", "bca", "bachelor"]
    if "bca" in req:
        return ["bca", "b.sc"]
    if "degree" in req or "diploma" in req:
        return ["degree", "diploma"]
    if "mba" in req:
        return ["mba"]
    return [req]


def _weak_skills(resume_data: Dict, jd: Dict, jd_skills: List[str]) -> List[str]:
    """Skills that appear in the resume text but only weakly (underrepresented)."""
    raw_text = resume_data.get("rawText", "")
    if not raw_text:
        return []
    listed = {s.lower() for s in (resume_data.get("skills") or [])}
    text_skills = match_skills_in_text(raw_text)
    weak = []
    for skill in jd_skills:
        if skill.lower() not in text_skills:
            continue
        if skill.lower() in listed:
            continue
        # mentioned but underrepresented (few occurrences)
        from app.services.resume_skills import skill_occurrence_count
        count = skill_occurrence_count(raw_text, skill)
        if count <= 1:
            weak.append(skill)
    return weak
