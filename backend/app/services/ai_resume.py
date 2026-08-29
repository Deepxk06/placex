import httpx
import json
from app.config import get_settings

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.3-70b-versatile"


async def generate_summary(profile: dict) -> str:
    sections = profile.get("sections", [])
    data = {s.get("name"): s.get("data", {}) for s in sections}

    personal = data.get("personalInfo", {})
    education = data.get("education", {}).get("entries", [])
    skills = data.get("skills", {}).get("items", [])
    experience = data.get("experience", {}).get("entries", [])
    projects = data.get("projects", {}).get("entries", [])
    achievements = data.get("achievements", {}).get("items", [])

    prompt = f"""Generate a professional ATS-friendly resume summary (2-3 sentences) for:
Name: {personal.get('fullName', 'Student')}
Role: {personal.get('targetRole', 'Software Engineer')}
Education: {', '.join(e.get('degree', '') for e in education[:2])}
Skills: {', '.join(skills[:10])}
Experience: {len(experience)} positions
Projects: {len(projects)} projects

Write a concise, impactful summary using action verbs. Focus on skills, experience, and career goals."""

    return await _call_groq(prompt)


async def improve_project_description(description: str) -> str:
    prompt = f"""Convert this simple project description into 2-3 professional resume bullet points using action verbs and quantifiable results. Keep each bullet under 15 words.

Original: {description}

Improved bullet points:"""
    return await _call_groq(prompt)


async def improve_experience_description(description: str) -> str:
    prompt = f"""Rewrite this work experience description into 2-3 professional resume bullet points. Use strong action verbs, include metrics/numbers where possible, and keep each bullet under 20 words.

Original: {description}

Improved:"""
    return await _call_groq(prompt)


REWRITE_ACTIONS = {
    "improve": "Rewrite the summary to be clearer, stronger and more professional.",
    "concise": "Make the summary concise, cutting it down to 2 sentences without losing key facts.",
    "professional": "Rewrite the summary in a polished, professional tone.",
    "ats": "Rewrite the summary to be ATS-friendly: use standard role keywords already present, plain formatting, no emojis or symbols.",
    "target": "Tailor the summary toward the stated target role using only the details already provided.",
}


async def rewrite_summary(text: str, action: str, target_role: str = "") -> str:
    """AI edit of an existing summary. The AI may only rephrase the facts
    already present in the text — it must never invent experience,
    companies, metrics, certifications or technologies."""
    instruction = REWRITE_ACTIONS.get(action, REWRITE_ACTIONS["improve"])
    target_role_line = f"Target role: {target_role}\n" if target_role else ""
    prompt = f"""{instruction}
{target_role_line}Existing summary (the ONLY facts you may use — do not add, invent or imply anything not present):
\"\"\"
{text}
\"\"\"

Rules:
- Use ONLY the facts in the existing summary.
- Never invent companies, job titles, experience, metrics, certifications, achievements or technologies.
- Keep it factual, 2-3 sentences, no emojis or special symbols.

Rewritten summary:"""
    return await _call_groq(prompt)


async def _call_groq(prompt: str) -> str:
    settings = get_settings()
    if not settings.GROQ_API_KEY:
        return "AI features require a Groq API key. Configure GROQ_API_KEY in .env"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                GROQ_API_URL,
                json={
                    "model": MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7,
                    "max_tokens": 500,
                },
                headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}", "Content-Type": "application/json"},
            )
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"]
            return "AI service unavailable. Please try again later."
    except Exception:
        return "AI service unavailable. Please try again later."
