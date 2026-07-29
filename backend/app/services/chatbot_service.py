from app.config import get_settings
import httpx
import json

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODEL = "llama-3.1-70b-versatile"


async def chat_with_groq(user_message: str, context: dict = None) -> str:
    settings = get_settings()
    api_key = settings.GROQ_API_KEY
    if not api_key:
        return fallback_response(user_message, context)
    
    system_prompt = build_system_prompt(context)
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                GROQ_API_URL,
                json={
                    "model": DEFAULT_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message},
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1024,
                },
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
            )
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
            else:
                return f"I apologize, but I'm having trouble connecting. Please try again. (Error: {response.status_code})"
    except Exception as e:
        return fallback_response(user_message, context)


def build_system_prompt(context: dict = None) -> str:
    base = """You are PlaceX AI, a helpful career counsellor for college students. 
You provide guidance on resumes, skill development, interview preparation, career paths, 
and placement preparation. Be encouraging, specific, and actionable in your advice."""
    
    if context:
        student_info = f"""
Current student context:
- Name: {context.get('name', 'Student')}
- College: {context.get('college', 'Not specified')}
- Branch: {context.get('branch', 'Not specified')}
- CGPA: {context.get('cgpa', 'N/A')}
- Skills: {', '.join(context.get('skills', [])) if context.get('skills') else 'Not specified'}
- Target Role: {context.get('targetRole', 'Not specified')}
"""
        return base + student_info + "\nProvide personalized advice based on this profile."
    return base


def fallback_response(user_message: str, context: dict = None) -> str:
    message_lower = user_message.lower()
    
    if "interview" in message_lower:
        return ("Here are some interview tips:\n"
                "1. Research the company thoroughly before the interview\n"
                "2. Practice common HR questions with the PlaceX mock interview module\n"
                "3. Use the STAR method for behavioral questions\n"
                "4. Prepare 2-3 questions to ask the interviewer\n"
                "5. Dress professionally and be on time")
    
    if "resume" in message_lower:
        return ("For a strong resume:\n"
                "1. Use the PlaceX ATS Resume Builder for an optimized template\n"
                "2. Include relevant keywords from job descriptions\n"
                "3. Quantify your achievements with numbers\n"
                "4. Keep it to 1-2 pages\n"
                "5. Use action verbs like 'developed', 'implemented', 'optimized'")
    
    if "skill" in message_lower or "learn" in message_lower:
        return ("To improve your skills:\n"
                "1. Focus on your target role's required skills\n"
                "2. Use the PlaceX Skill Assessment to identify gaps\n"
                "3. Practice coding daily on our platform\n"
                "4. Build projects to apply what you learn\n"
                "5. Get certifications from Coursera/Udemy")
    
    if "placement" in message_lower or "job" in message_lower:
        return ("For placement preparation:\n"
                "1. Check your Placement Probability Score on the dashboard\n"
                "2. Apply to recommended jobs from our Job Board\n"
                "3. Practice mock interviews daily\n"
                "4. Improve your resume ATS score\n"
                "5. Connect with alumni for referrals")
    
    return ("I'm here to help with your career journey! I can assist with:\n"
            "• Resume building and ATS optimization\n"
            "• Interview preparation and tips\n"
            "• Skill development recommendations\n"
            "• Career path guidance\n"
            "• Placement preparation strategies\n\n"
            "What would you like to know more about?")
