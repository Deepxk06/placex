from fastapi import APIRouter, HTTPException, Depends, Body
from app.database import get_db
from app.auth import verify_token
from app.models import User, Resume, Assessment, Interview, Prediction, CodingProblem, AptitudeQuestion
from app.services.code_judge import judge_submission
from app.services.adaptive_engine import AdaptiveAptitudeEngine
from app.services.skill_gap_analyzer import analyze_skill_gap
from sqlalchemy import select, func
from datetime import datetime, timezone
import uuid

router = APIRouter()


@router.get("/aptitude")
async def get_aptitude_questions(topic: str = "", difficulty: str = "", uid: str = Depends(verify_token)):
    async with get_db()() as session:
        from app.models import AptitudeQuestion
        stmt = select(AptitudeQuestion)
        if topic:
            stmt = stmt.where(AptitudeQuestion.topic == topic)
        if difficulty:
            stmt = stmt.where(AptitudeQuestion.difficulty == difficulty)
        stmt = stmt.order_by(func.random()).limit(10)
        result = await session.execute(stmt)
        questions = result.scalars().all()
        return [{"_id": str(q.id), "topic": q.topic, "subtopic": q.subtopic, "question": q.question,
                 "options": q.options, "difficulty": q.difficulty} for q in questions]


@router.post("/aptitude/submit")
async def submit_aptitude(answers: list = Body(...), uid: str = Depends(verify_token)):
    async with get_db()() as session:
        from app.models import AptitudeQuestion
        score = 0
        total = len(answers)
        results = []
        for ans in answers:
            q = await session.get(AptitudeQuestion, int(ans["questionId"]))
            if not q:
                continue
            correct = ans["selectedIndex"] == q.correct_index
            if correct:
                score += 1
            results.append({
                "questionId": ans["questionId"],
                "selected": ans["selectedIndex"],
                "correct": correct,
                "correctIndex": q.correct_index,
                "explanation": q.explanation or "",
            })
        now = datetime.now(timezone.utc)
        doc = Assessment(id=str(uuid.uuid4()), user_id=uid, type="aptitude", score=score, total=total,
                         answers=results, completed_at=now, created_at=now)
        session.add(doc)
        await session.commit()
    return {"score": score, "total": total, "percentage": round(score / total * 100, 2) if total else 0, "results": results}


@router.get("/coding")
async def get_coding_problems(difficulty: str = "", topic: str = "", uid: str = Depends(verify_token)):
    async with get_db()() as session:
        from app.models import CodingProblem
        stmt = select(CodingProblem)
        if difficulty:
            stmt = stmt.where(CodingProblem.difficulty == difficulty)
        if topic:
            stmt = stmt.where(CodingProblem.topics.any(topic))
        result = await session.execute(stmt.limit(50))
        problems = result.scalars().all()
        return [{"_id": str(p.id), "title": p.title, "slug": p.slug, "difficulty": p.difficulty,
                 "topics": p.topics, "companies": p.companies, "description": p.description,
                 "examples": p.examples, "constraints": p.constraints, "hints": p.hints} for p in problems]


@router.get("/coding/{problem_id}")
async def get_coding_problem(problem_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        from app.models import CodingProblem
        problem = await session.get(CodingProblem, int(problem_id))
        if not problem:
            raise HTTPException(404, "Problem not found")
        return {"_id": str(problem.id), "title": problem.title, "slug": problem.slug, "difficulty": problem.difficulty,
                "topics": problem.topics, "companies": problem.companies, "description": problem.description,
                "examples": problem.examples, "constraints": problem.constraints, "hints": problem.hints,
                "testCases": problem.test_cases, "timeLimit": problem.time_limit, "memoryLimit": problem.memory_limit}


@router.post("/coding/submit")
async def submit_coding(payload: dict = Body(...), uid: str = Depends(verify_token)):
    problem_id = str(payload.get("problem_id") or "").strip()
    language = str(payload.get("language") or "").strip()
    code = str(payload.get("code") or "")
    if not problem_id or not language or not code:
        raise HTTPException(400, "problem_id, language and code are required")
    if not problem_id.isdigit():
        raise HTTPException(400, "Invalid problem_id")
    async with get_db()() as session:
        from app.models import CodingProblem
        problem = await session.get(CodingProblem, int(problem_id))
        if not problem:
            raise HTTPException(404, "Problem not found")
        result = await judge_submission(
            {"testCases": problem.test_cases, "hiddenTestCases": problem.hidden_test_cases, "timeLimit": problem.time_limit},
            code, language,
        )
        now = datetime.now(timezone.utc)
        doc = Assessment(id=str(uuid.uuid4()), user_id=uid, type="coding",
                         score=result["passedTestCases"], total=result["totalTestCases"],
                         answers=[{"problemId": problem_id, "language": language, "status": result["status"]}],
                         completed_at=now, created_at=now)
        session.add(doc)
        problem.total_submissions = (problem.total_submissions or 0) + 1
        if result["status"] == "accepted":
            problem.total_accepted = (problem.total_accepted or 0) + 1
        await session.commit()
    return result


@router.get("/coding/stats")
async def get_coding_stats(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        from app.models import CodingProblem, Assessment
        total_stmt = select(func.count(CodingProblem.id))
        total = (await session.execute(total_stmt)).scalar() or 0

        solved_stmt = (
            select(func.count(func.distinct(Assessment.answers["problemId"])))
            .where(Assessment.user_id == uid)
            .where(Assessment.type == "coding")
            .where(Assessment.score == Assessment.total)
        )
        solved = (await session.execute(solved_stmt)).scalar() or 0

        attempted_stmt = (
            select(func.count(Assessment.id))
            .where(Assessment.user_id == uid)
            .where(Assessment.type == "coding")
        )
        attempted = (await session.execute(attempted_stmt)).scalar() or 0

        easy_stmt = select(func.count(CodingProblem.id)).where(CodingProblem.difficulty == "easy")
        easy_total = (await session.execute(easy_stmt)).scalar() or 0
        medium_stmt = select(func.count(CodingProblem.id)).where(CodingProblem.difficulty == "medium")
        medium_total = (await session.execute(medium_stmt)).scalar() or 0
        hard_stmt = select(func.count(CodingProblem.id)).where(CodingProblem.difficulty == "hard")
        hard_total = (await session.execute(hard_stmt)).scalar() or 0

        return {
            "total": total,
            "solved": solved,
            "attempted": attempted,
            "accuracy": round(solved / attempted * 100, 1) if attempted else 0,
            "easyTotal": easy_total,
            "mediumTotal": medium_total,
            "hardTotal": hard_total,
        }


@router.get("/coding/topics")
async def get_coding_topics(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        from app.models import CodingProblem
        stmt = select(CodingProblem)
        result = await session.execute(stmt)
        problems = result.scalars().all()

        topic_counts = {}
        for p in problems:
            for t in (p.topics or []):
                topic_counts[t] = topic_counts.get(t, 0) + 1

        topics = [{"name": k, "count": v} for k, v in sorted(topic_counts.items(), key=lambda x: -x[1])]
        return topics


@router.get("/coding/recent-activity")
async def get_coding_recent_activity(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        from app.models import Assessment, CodingProblem
        stmt = (
            select(Assessment)
            .where(Assessment.user_id == uid)
            .where(Assessment.type == "coding")
            .order_by(Assessment.created_at.desc())
            .limit(10)
        )
        result = await session.execute(stmt)
        assessments = result.scalars().all()

        activities = []
        for a in assessments:
            problem_id = None
            lang = ""
            if a.answers and len(a.answers) > 0:
                ans = a.answers[0]
                problem_id = ans.get("problemId")
                lang = ans.get("language", "")

            problem_title = ""
            difficulty = ""
            if problem_id:
                problem = await session.get(CodingProblem, int(problem_id))
                if problem:
                    problem_title = problem.title
                    difficulty = problem.difficulty

            activities.append({
                "id": str(a.id),
                "problemId": problem_id,
                "problemTitle": problem_title,
                "difficulty": difficulty,
                "language": lang,
                "score": a.score,
                "total": a.total,
                "status": "accepted" if a.score == a.total else "wrong",
                "completedAt": a.completed_at.isoformat() if a.completed_at else "",
            })

        return activities


@router.get("/aptitude/stats")
async def get_aptitude_stats(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        total_stmt = select(func.count(AptitudeQuestion.id))
        total = (await session.execute(total_stmt)).scalar() or 0

        solved_stmt = (
            select(func.count(Assessment.id))
            .where(Assessment.user_id == uid)
            .where(Assessment.type == "aptitude")
            .where(Assessment.score == Assessment.total)
        )
        solved = (await session.execute(solved_stmt)).scalar() or 0

        attempted_stmt = (
            select(func.count(Assessment.id))
            .where(Assessment.user_id == uid)
            .where(Assessment.type == "aptitude")
        )
        attempted = (await session.execute(attempted_stmt)).scalar() or 0

        easy_stmt = select(func.count(AptitudeQuestion.id)).where(AptitudeQuestion.difficulty == "easy")
        easy_total = (await session.execute(easy_stmt)).scalar() or 0
        medium_stmt = select(func.count(AptitudeQuestion.id)).where(AptitudeQuestion.difficulty == "medium")
        medium_total = (await session.execute(medium_stmt)).scalar() or 0
        hard_stmt = select(func.count(AptitudeQuestion.id)).where(AptitudeQuestion.difficulty == "hard")
        hard_total = (await session.execute(hard_stmt)).scalar() or 0

        return {
            "total": total,
            "solved": solved,
            "attempted": attempted,
            "accuracy": round(solved / attempted * 100, 1) if attempted else 0,
            "easyTotal": easy_total,
            "mediumTotal": medium_total,
            "hardTotal": hard_total,
        }


@router.get("/aptitude/topics")
async def get_aptitude_topics(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(AptitudeQuestion)
        result = await session.execute(stmt)
        questions = result.scalars().all()

        topic_counts = {}
        for q in questions:
            t = q.topic or "General"
            topic_counts[t] = topic_counts.get(t, 0) + 1

        topics = [{"name": k, "count": v} for k, v in sorted(topic_counts.items(), key=lambda x: -x[1])]
        return topics


@router.get("/aptitude/recent-activity")
async def get_aptitude_recent_activity(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = (
            select(Assessment)
            .where(Assessment.user_id == uid)
            .where(Assessment.type == "aptitude")
            .order_by(Assessment.created_at.desc())
            .limit(10)
        )
        result = await session.execute(stmt)
        assessments = result.scalars().all()

        activities = []
        for a in assessments:
            percentage = round(a.score / a.total * 100, 1) if a.total else 0
            activities.append({
                "id": str(a.id),
                "score": a.score,
                "total": a.total,
                "percentage": percentage,
                "status": "passed" if percentage >= 60 else "failed",
                "completedAt": a.completed_at.isoformat() if a.completed_at else "",
            })
        return activities


@router.get("/mcq/stats")
async def get_mcq_stats(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        total_stmt = select(func.count(AptitudeQuestion.id))
        total = (await session.execute(total_stmt)).scalar() or 0

        solved_stmt = (
            select(func.count(Assessment.id))
            .where(Assessment.user_id == uid)
            .where(Assessment.type == "mcq")
            .where(Assessment.score == Assessment.total)
        )
        solved = (await session.execute(solved_stmt)).scalar() or 0

        attempted_stmt = (
            select(func.count(Assessment.id))
            .where(Assessment.user_id == uid)
            .where(Assessment.type == "mcq")
        )
        attempted = (await session.execute(attempted_stmt)).scalar() or 0

        easy_stmt = select(func.count(AptitudeQuestion.id)).where(AptitudeQuestion.difficulty == "easy")
        easy_total = (await session.execute(easy_stmt)).scalar() or 0
        medium_stmt = select(func.count(AptitudeQuestion.id)).where(AptitudeQuestion.difficulty == "medium")
        medium_total = (await session.execute(medium_stmt)).scalar() or 0
        hard_stmt = select(func.count(AptitudeQuestion.id)).where(AptitudeQuestion.difficulty == "hard")
        hard_total = (await session.execute(hard_stmt)).scalar() or 0

        return {
            "total": total,
            "solved": solved,
            "attempted": attempted,
            "accuracy": round(solved / attempted * 100, 1) if attempted else 0,
            "easyTotal": easy_total,
            "mediumTotal": medium_total,
            "hardTotal": hard_total,
        }


@router.get("/mcq/topics")
async def get_mcq_topics(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(AptitudeQuestion)
        result = await session.execute(stmt)
        questions = result.scalars().all()

        topic_counts = {}
        for q in questions:
            t = q.topic or "General"
            topic_counts[t] = topic_counts.get(t, 0) + 1

        topics = [{"name": k, "count": v} for k, v in sorted(topic_counts.items(), key=lambda x: -x[1])]
        return topics


@router.get("/mcq/recent-activity")
async def get_mcq_recent_activity(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = (
            select(Assessment)
            .where(Assessment.user_id == uid)
            .where(Assessment.type == "mcq")
            .order_by(Assessment.created_at.desc())
            .limit(10)
        )
        result = await session.execute(stmt)
        assessments = result.scalars().all()

        activities = []
        for a in assessments:
            percentage = round(a.score / a.total * 100, 1) if a.total else 0
            activities.append({
                "id": str(a.id),
                "score": a.score,
                "total": a.total,
                "percentage": percentage,
                "status": "passed" if percentage >= 60 else "failed",
                "completedAt": a.completed_at.isoformat() if a.completed_at else "",
            })
        return activities


@router.get("/mcq")
async def get_mcq_questions(topic: str = "", uid: str = Depends(verify_token)):
    async with get_db()() as session:
        from app.models import AptitudeQuestion
        stmt = select(AptitudeQuestion)
        if topic:
            stmt = stmt.where(AptitudeQuestion.topic == topic)
        stmt = stmt.order_by(func.random()).limit(15)
        result = await session.execute(stmt)
        questions = result.scalars().all()
        return [{"_id": str(q.id), "topic": q.topic, "subtopic": q.subtopic, "question": q.question,
                 "options": q.options, "difficulty": q.difficulty} for q in questions]


@router.post("/mcq/submit")
async def submit_mcq(answers: list = Body(...), uid: str = Depends(verify_token)):
    return await submit_aptitude(answers, uid)


@router.get("/skill-gap")
async def get_skill_gap(target_role: str = "", uid: str = Depends(verify_token)):
    async with get_db()() as session:
        user = await session.get(User, uid)
        if not user:
            raise HTTPException(404, "User not found")
        result = await analyze_skill_gap(user.skills or [], target_role or user.target_role or "")
    return result


@router.get("/history")
async def get_assessment_history(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(Assessment).where(Assessment.user_id == uid).order_by(Assessment.created_at.desc()).limit(50)
        result = await session.execute(stmt)
        assessments = result.scalars().all()
        return [{c.name: str(getattr(a, c.name)) if isinstance(getattr(a, c.name), uuid.UUID) else getattr(a, c.name) for c in Assessment.__table__.columns} for a in assessments]
