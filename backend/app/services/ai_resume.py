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
