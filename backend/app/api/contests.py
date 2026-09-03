from fastapi import APIRouter, Depends, HTTPException, Body
from app.database import get_db
from app.auth import verify_token
from app.models import Contest, ContestRegistration, ContestSubmission, CodingProblem, UserStreak
from sqlalchemy import select, func
from datetime import datetime, timezone

router = APIRouter()


@router.get("/")
async def list_contests(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(Contest).order_by(Contest.start_time.desc())
        result = await session.execute(stmt)
        contests = result.scalars().all()
        now = datetime.now(timezone.utc)
        items = []
        for c in contests:
            reg_stmt = select(func.count(ContestRegistration.id)).where(ContestRegistration.contest_id == c.id)
            reg_count = (await session.execute(reg_stmt)).scalar() or 0
            is_registered = False
            if uid:
                r = await session.execute(
                    select(ContestRegistration).where(
                        ContestRegistration.contest_id == c.id,
                        ContestRegistration.user_id == uid
                    )
                )
                is_registered = r.scalar_one_or_none() is not None
            status = c.status
            if status == "upcoming" and c.start_time and c.start_time <= now:
                status = "live"
            if status == "live" and c.end_time and c.end_time <= now:
                status = "ended"
            items.append({
                "id": c.id, "title": c.title, "description": c.description,
                "problem_ids": c.problem_ids, "duration_minutes": c.duration_minutes,
                "difficulty": c.difficulty, "status": status,
                "max_participants": c.max_participants, "prize": c.prize,
                "start_time": c.start_time.isoformat() if c.start_time else "",
                "end_time": c.end_time.isoformat() if c.end_time else "",
                "participants": reg_count, "is_registered": is_registered,
            })
        return items


@router.post("/register/{contest_id}")
async def register_contest(contest_id: int, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        contest = await session.get(Contest, contest_id)
        if not contest:
            raise HTTPException(404, "Contest not found")
        existing = await session.execute(
            select(ContestRegistration).where(
                ContestRegistration.contest_id == contest_id,
                ContestRegistration.user_id == uid
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(400, "Already registered")
        reg = ContestRegistration(contest_id=contest_id, user_id=uid, registered_at=datetime.now(timezone.utc))
        session.add(reg)
        await session.commit()
    return {"message": "Registered successfully"}


@router.post("/submit")
async def submit_contest(payload: dict = Body(...), uid: str = Depends(verify_token)):
    async with get_db()() as session:
        contest_id = payload["contest_id"]
        problem_id = payload["problem_id"]
        language = payload["language"]
        code = payload["code"]
        contest = await session.get(Contest, contest_id)
        if not contest:
            raise HTTPException(404, "Contest not found")
        problem = await session.get(CodingProblem, problem_id)
        if not problem:
            raise HTTPException(404, "Problem not found")
        from app.services.code_judge import judge_submission
        result = await judge_submission(
            {"testCases": problem.test_cases, "hiddenTestCases": problem.hidden_test_cases, "timeLimit": problem.time_limit},
            code, language,
        )
        score = result["passedTestCases"] / max(result["totalTestCases"], 1) * 100
        sub = ContestSubmission(
            contest_id=contest_id, user_id=uid, problem_id=problem_id,
            language=language, code=code, status=result["status"],
            passed_test_cases=result["passedTestCases"],
            total_test_cases=result["totalTestCases"],
            runtime_ms=result.get("runtimeMs", 0), score=score,
            created_at=datetime.now(timezone.utc),
        )
        session.add(sub)
        await session.commit()
    return {"score": score, "status": result["status"], "passed": result["passedTestCases"], "total": result["totalTestCases"]}


@router.get("/{contest_id}/leaderboard")
async def get_leaderboard(contest_id: int, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = (
            select(
                ContestSubmission.user_id,
                func.sum(ContestSubmission.score).label("total_score"),
                func.count(ContestSubmission.id).label("submissions"),
            )
            .where(ContestSubmission.contest_id == contest_id)
            .group_by(ContestSubmission.user_id)
            .order_by(func.sum(ContestSubmission.score).desc())
            .limit(100)
        )
        result = await session.execute(stmt)
        rows = result.all()
        leaderboard = []
        for i, row in enumerate(rows):
            leaderboard.append({
                "rank": i + 1, "user_id": row.user_id,
                "total_score": round(row.total_score or 0, 1),
                "submissions": row.submissions,
            })
        return leaderboard


@router.get("/leaderboard/global")
async def get_global_leaderboard(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = (
            select(
                ContestSubmission.user_id,
                func.sum(ContestSubmission.score).label("total_score"),
                func.count(ContestSubmission.id).label("total_submissions"),
            )
            .group_by(ContestSubmission.user_id)
            .order_by(func.sum(ContestSubmission.score).desc())
            .limit(50)
        )
        result = await session.execute(stmt)
        rows = result.all()
        return [{
            "rank": i + 1, "user_id": row.user_id,
            "total_score": round(row.total_score or 0, 1),
            "total_submissions": row.total_submissions,
        } for i, row in enumerate(rows)]


@router.get("/my-submissions/{contest_id}")
async def get_my_submissions(contest_id: int, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = (
            select(ContestSubmission)
            .where(ContestSubmission.contest_id == contest_id, ContestSubmission.user_id == uid)
            .order_by(ContestSubmission.created_at.desc())
        )
        result = await session.execute(stmt)
        subs = result.scalars().all()
        return [{
            "id": s.id, "problem_id": s.problem_id, "language": s.language,
            "status": s.status, "score": s.score,
            "passed_test_cases": s.passed_test_cases, "total_test_cases": s.total_test_cases,
            "created_at": s.created_at.isoformat() if s.created_at else "",
        } for s in subs]
