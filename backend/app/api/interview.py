from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.auth import verify_token
from app.models import Interview
from app.services.interview_analyzer import analyze_audio
from sqlalchemy import select
from datetime import datetime, timezone
import uuid

router = APIRouter()

HR_QUESTIONS = [
    "Tell me about yourself.",
    "What are your greatest strengths and weaknesses?",
    "Why do you want to work at our company?",
    "Where do you see yourself in 5 years?",
    "Tell me about a time you faced a challenge and how you handled it.",
    "Describe a situation where you worked in a team.",
    "Why should we hire you?",
    "Tell me about a time you showed leadership.",
    "How do you handle pressure or stressful situations?",
    "What is your greatest professional achievement?",
]

TECHNICAL_QUESTIONS = [
    "Explain the difference between REST and GraphQL.",
    "What is the time complexity of binary search?",
    "Explain OOP concepts with examples.",
    "What is the difference between SQL and NoSQL databases?",
    "Explain how a hash map works internally.",
    "What is version control and why is it important?",
    "Explain the MVC architecture.",
    "What is a deadlock and how do you prevent it?",
    "What are microservices and their advantages?",
    "Explain how you would design a URL shortener.",
]


@router.post("/start")
async def start_interview(interview_type: str = "technical", uid: str = Depends(verify_token)):
    async with get_db()() as session:
        questions = HR_QUESTIONS if interview_type == "hr" else TECHNICAL_QUESTIONS
        qs = [{"question": q, "category": interview_type, "audioUrl": "", "transcript": ""} for q in questions[:5]]
        doc = Interview(id=uuid.uuid4(), user_id=uid, type=interview_type, status="in_progress", questions=qs,
                        created_at=datetime.now(timezone.utc))
        session.add(doc)
        await session.commit()
    return {"id": str(doc.id), "questions": qs, "totalQuestions": len(qs)}


@router.post("/submit-audio")
async def submit_interview_audio(interview_id: str, question_index: int, audio_data: str,
                                 uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(Interview).where(Interview.id == uuid.UUID(interview_id), Interview.user_id == uid)
        interview = (await session.execute(stmt)).scalar_one_or_none()
        if not interview:
            raise HTTPException(404, "Interview not found")
        analysis = await analyze_audio(audio_data)
        questions = interview.questions or []
        if 0 <= question_index < len(questions):
            questions[question_index]["transcript"] = analysis.get("transcript", "")
            questions[question_index]["analysis"] = analysis
        interview.questions = questions
        await session.commit()
    return {"questionIndex": question_index, "analysis": analysis}


@router.get("/{interview_id}/report")
async def get_interview_report(interview_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(Interview).where(Interview.id == uuid.UUID(interview_id), Interview.user_id == uid)
        interview = (await session.execute(stmt)).scalar_one_or_none()
        if not interview:
            raise HTTPException(404, "Interview not found")
        questions = interview.questions or []
        confidences = [q.get("analysis", {}).get("confidence", 0) for q in questions if q.get("analysis")]
        fluencies = [q.get("analysis", {}).get("fluency", 0) for q in questions if q.get("analysis")]
        sentiments = [q.get("analysis", {}).get("sentiment", 0) for q in questions if q.get("analysis")]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        avg_fluency = sum(fluencies) / len(fluencies) if fluencies else 0
        avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0
        overall_score = (avg_confidence * 0.4 + avg_fluency * 0.3 + (avg_sentiment + 1) * 50 * 0.3)
        analysis = {
            "confidenceScore": round(avg_confidence, 2),
            "fluencyScore": round(avg_fluency, 2),
            "sentimentScore": round(avg_sentiment, 2),
            "overallScore": round(overall_score, 2),
            "feedback": generate_feedback(avg_confidence, avg_fluency, avg_sentiment),
        }
        interview.analysis = analysis
        interview.overall_score = analysis["overallScore"]
        interview.status = "completed"
        interview.completed_at = datetime.now(timezone.utc)
        await session.commit()
        return {c.name: str(getattr(interview, c.name)) if isinstance(getattr(interview, c.name), uuid.UUID) else getattr(interview, c.name) for c in Interview.__table__.columns}


@router.get("/")
async def get_interview_history(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(Interview).where(Interview.user_id == uid).order_by(Interview.created_at.desc()).limit(20)
        result = await session.execute(stmt)
        interviews = result.scalars().all()
        return [{c.name: str(getattr(i, c.name)) if isinstance(getattr(i, c.name), uuid.UUID) else getattr(i, c.name) for c in Interview.__table__.columns} for i in interviews]


def generate_feedback(confidence, fluency, sentiment):
    feedback = []
    if confidence < 0.4:
        feedback.append("Your confidence level is low. Practice speaking more assertively and maintain eye contact.")
    elif confidence < 0.7:
        feedback.append("Your confidence is moderate. Work on reducing hesitations and fillers.")
    else:
        feedback.append("Great confidence! Keep maintaining this level.")
    if fluency < 0.4:
        feedback.append("Work on your fluency. Try to speak in complete sentences without long pauses.")
    elif fluency < 0.7:
        feedback.append("Your fluency is decent. Practice with timed responses to improve.")
    else:
        feedback.append("Excellent fluency! Your speech is smooth and well-paced.")
    if sentiment < -0.3:
        feedback.append("Your responses seem negative. Try to frame challenges as learning experiences.")
    elif sentiment < 0.3:
        feedback.append("Try to be more positive and enthusiastic in your responses.")
    else:
        feedback.append("Great positive attitude! This will make a good impression.")
    return feedback
