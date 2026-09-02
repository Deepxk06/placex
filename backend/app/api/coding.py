"""Coding workspace endpoints: problem list, run, submit, submissions, bookmarks, progress."""

from fastapi import APIRouter, HTTPException, Depends, Body
from app.database import get_db
from app.auth import verify_token
from app.models import CodingProblem, CodingSubmission, CodingBookmark, CodingProgress, User
from app.services.compiler.runner import run_code
from app.services.compiler.judge import judge_submission
from sqlalchemy import select, func
from datetime import datetime, timezone
import uuid

router = APIRouter()


@router.get("/problems")
async def list_problems(
    difficulty: str = "",
    topic: str = "",
    search: str = "",
    page: int = 1,
    limit: int = 50,
    uid: str = Depends(verify_token),
):
    async with get_db()() as session:
        stmt = select(CodingProblem)
        if difficulty:
            stmt = stmt.where(CodingProblem.difficulty == difficulty)
        if topic:
            stmt = stmt.where(CodingProblem.topics.any(topic))
        if search:
            stmt = stmt.where(CodingProblem.title.ilike(f"%{search}%"))
        stmt = stmt.order_by(CodingProblem.id)
        stmt = stmt.offset((page - 1) * limit).limit(limit)
        result = await session.execute(stmt)
        problems = result.scalars().all()

        solved_stmt = (
            select(CodingProgress.problem_id)
            .where(CodingProgress.user_id == uid)
            .where(CodingProgress.status == "solved")
        )
        solved_rows = (await session.execute(solved_stmt)).scalars().all()
        solved_set = set(solved_rows)

        return [
            {
                "_id": str(p.id),
                "id": p.id,
                "title": p.title,
                "slug": p.slug,
                "difficulty": p.difficulty,
                "topics": p.topics or [],
                "companies": p.companies or [],
                "totalSubmissions": p.total_submissions or 0,
                "totalAccepted": p.total_accepted or 0,
                "solved": p.id in solved_set,
            }
            for p in problems
        ]


@router.get("/problems/{problem_id}")
async def get_problem(problem_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        if not problem_id.isdigit():
            problem = (
                await session.execute(
                    select(CodingProblem).where(CodingProblem.slug == problem_id)
                )
            ).scalar_one_or_none()
        else:
            problem = await session.get(CodingProblem, int(problem_id))
        if not problem:
            raise HTTPException(404, "Problem not found")

        progress_stmt = (
            select(CodingProgress)
            .where(CodingProgress.user_id == uid)
            .where(CodingProgress.problem_id == problem.id)
        )
        progress = (await session.execute(progress_stmt)).scalar_one_or_none()

        bookmark_stmt = (
            select(CodingBookmark)
            .where(CodingBookmark.user_id == uid)
            .where(CodingBookmark.problem_id == problem.id)
        )
        bookmark = (await session.execute(bookmark_stmt)).scalar_one_or_none()

        return {
            "_id": str(problem.id),
            "id": problem.id,
            "title": problem.title,
            "slug": problem.slug,
            "difficulty": problem.difficulty,
            "topics": problem.topics or [],
            "companies": problem.companies or [],
            "description": problem.description or "",
            "examples": problem.examples or [],
            "constraints": problem.constraints or "",
            "hints": problem.hints or [],
            "testCases": problem.test_cases or [],
            "timeLimit": problem.time_limit or 1000,
            "memoryLimit": problem.memory_limit or 256,
            "solution": problem.solution or {},
            "bookmarked": bookmark is not None,
            "progress": {
                "status": progress.status if progress else "none",
                "bestStatus": progress.best_status if progress else "",
                "bestRuntime": progress.best_runtime_ms if progress else 0,
                "bestMemory": progress.best_memory_mb if progress else 0,
                "submissionCount": progress.submission_count if progress else 0,
            } if progress else None,
        }


@router.get("/problems/{problem_id}/next")
async def get_next_problem(problem_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        current = await session.get(CodingProblem, int(problem_id))
        if not current:
            raise HTTPException(404, "Problem not found")
        next_stmt = (
            select(CodingProblem)
            .where(CodingProblem.id > current.id)
            .order_by(CodingProblem.id)
            .limit(1)
        )
        next_problem = (await session.execute(next_stmt)).scalar_one_or_none()
        if not next_problem:
            return None
        return {"id": next_problem.id, "slug": next_problem.slug, "title": next_problem.title}


@router.get("/problems/{problem_id}/prev")
async def get_prev_problem(problem_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        current = await session.get(CodingProblem, int(problem_id))
        if not current:
            raise HTTPException(404, "Problem not found")
        prev_stmt = (
            select(CodingProblem)
            .where(CodingProblem.id < current.id)
            .order_by(CodingProblem.id.desc())
            .limit(1)
        )
        prev_problem = (await session.execute(prev_stmt)).scalar_one_or_none()
        if not prev_problem:
            return None
        return {"id": prev_problem.id, "slug": prev_problem.slug, "title": prev_problem.title}


@router.post("/run")
async def run_code_endpoint(payload: dict = Body(...), uid: str = Depends(verify_token)):
    language = str(payload.get("language") or "").strip()
    code = str(payload.get("code") or "")
    problem_id = payload.get("problem_id")
    test_case_index = int(payload.get("test_case_index") or 0)

    if not language or not code:
        raise HTTPException(400, "language and code are required")

    async with get_db()() as session:
        if problem_id:
            problem = await session.get(CodingProblem, int(problem_id))
            if not problem:
                raise HTTPException(404, "Problem not found")
            test_cases = problem.test_cases or []
            if test_case_index < len(test_cases):
                stdin = test_cases[test_case_index].get("input", "")
            else:
                stdin = ""
        else:
            stdin = str(payload.get("stdin") or "")

    result = await run_code(code, language, stdin=stdin, timeout_ms=7000)
    return {
        "status": result.get("status"),
        "stdout": result.get("stdout", ""),
        "stderr": result.get("stderr", ""),
        "runtimeMs": result.get("runtimeMs", 0),
        "exitCode": result.get("exitCode"),
    }


@router.post("/submit")
async def submit_code(payload: dict = Body(...), uid: str = Depends(verify_token)):
    problem_id = payload.get("problem_id")
    language = str(payload.get("language") or "").strip()
    code = str(payload.get("code") or "")

    if not problem_id or not language or not code:
        raise HTTPException(400, "problem_id, language, and code are required")

    async with get_db()() as session:
        problem = await session.get(CodingProblem, int(problem_id))
        if not problem:
            raise HTTPException(404, "Problem not found")

        result = await judge_submission(
            {
                "testCases": problem.test_cases or [],
                "hiddenTestCases": problem.hidden_test_cases or [],
                "timeLimit": problem.time_limit or 1000,
            },
            code,
            language,
        )

        now = datetime.now(timezone.utc)
        submission = CodingSubmission(
            id=str(uuid.uuid4()),
            user_id=uid,
            problem_id=problem.id,
            language=language,
            code=code,
            status=result["status"],
            passed_test_cases=result["passedTestCases"],
            total_test_cases=result["totalTestCases"],
            runtime_ms=int(result.get("runtime", 0)),
            test_results=result.get("results", []),
            error=result.get("error", ""),
            created_at=now,
        )
        session.add(submission)

        progress_stmt = (
            select(CodingProgress)
            .where(CodingProgress.user_id == uid)
            .where(CodingProgress.problem_id == problem.id)
        )
        progress = (await session.execute(progress_stmt)).scalar_one_or_none()

        is_accepted = result["status"] == "accepted"
        if progress:
            progress.submission_count = (progress.submission_count or 0) + 1
            progress.last_attempted_at = now
            if is_accepted and progress.status != "solved":
                progress.status = "solved"
                progress.best_status = "accepted"
                progress.first_solved_at = now
            if is_accepted:
                rt = int(result.get("runtime", 0))
                if progress.best_runtime_ms == 0 or rt < progress.best_runtime_ms:
                    progress.best_runtime_ms = rt
        else:
            progress = CodingProgress(
                user_id=uid,
                problem_id=problem.id,
                status="solved" if is_accepted else "attempted",
                best_status="accepted" if is_accepted else "",
                best_runtime_ms=int(result.get("runtime", 0)) if is_accepted else 0,
                submission_count=1,
                first_solved_at=now if is_accepted else None,
                last_attempted_at=now,
                created_at=now,
            )
            session.add(progress)

        problem.total_submissions = (problem.total_submissions or 0) + 1
        if is_accepted:
            problem.total_accepted = (problem.total_accepted or 0) + 1

        await session.commit()

    return {
        "submissionId": submission.id,
        "status": result["status"],
        "passedTestCases": result["passedTestCases"],
        "totalTestCases": result["totalTestCases"],
        "runtimeMs": int(result.get("runtime", 0)),
        "results": result.get("results", []),
        "error": result.get("error", ""),
    }


@router.get("/submissions/{problem_id}")
async def get_submissions(problem_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = (
            select(CodingSubmission)
            .where(CodingSubmission.user_id == uid)
            .where(CodingSubmission.problem_id == int(problem_id))
            .order_by(CodingSubmission.created_at.desc())
            .limit(20)
        )
        result = await session.execute(stmt)
        submissions = result.scalars().all()
        return [
            {
                "id": s.id,
                "language": s.language,
                "status": s.status,
                "passedTestCases": s.passed_test_cases,
                "totalTestCases": s.total_test_cases,
                "runtimeMs": s.runtime_ms,
                "memoryMb": s.memory_mb,
                "createdAt": s.created_at.isoformat() if s.created_at else "",
            }
            for s in submissions
        ]


@router.post("/bookmark")
async def toggle_bookmark(payload: dict = Body(...), uid: str = Depends(verify_token)):
    problem_id = payload.get("problem_id")
    if not problem_id:
        raise HTTPException(400, "problem_id is required")

    async with get_db()() as session:
        existing_stmt = (
            select(CodingBookmark)
            .where(CodingBookmark.user_id == uid)
            .where(CodingBookmark.problem_id == int(problem_id))
        )
        existing = (await session.execute(existing_stmt)).scalar_one_or_none()

        if existing:
            await session.delete(existing)
            await session.commit()
            return {"bookmarked": False}
        else:
            bookmark = CodingBookmark(user_id=uid, problem_id=int(problem_id))
            session.add(bookmark)
            await session.commit()
            return {"bookmarked": True}


@router.get("/progress")
async def get_progress(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        total_stmt = select(func.count(CodingProblem.id))
        total = (await session.execute(total_stmt)).scalar() or 0

        solved_stmt = (
            select(func.count(CodingProgress.id))
            .where(CodingProgress.user_id == uid)
            .where(CodingProgress.status == "solved")
        )
        solved = (await session.execute(solved_stmt)).scalar() or 0

        attempted_stmt = (
            select(func.count(func.distinct(CodingProgress.problem_id)))
            .where(CodingProgress.user_id == uid)
        )
        attempted = (await session.execute(attempted_stmt)).scalar() or 0

        bookmark_stmt = (
            select(func.count(CodingBookmark.id))
            .where(CodingBookmark.user_id == uid)
        )
        bookmarked = (await session.execute(bookmark_stmt)).scalar() or 0

        easy_stmt = select(func.count(CodingProblem.id)).where(CodingProblem.difficulty == "easy")
        easy_total = (await session.execute(easy_stmt)).scalar() or 0
        medium_stmt = select(func.count(CodingProblem.id)).where(CodingProblem.difficulty == "medium")
        medium_total = (await session.execute(medium_stmt)).scalar() or 0
        hard_stmt = select(func.count(CodingProblem.id)).where(CodingProblem.difficulty == "hard")
        hard_total = (await session.execute(hard_stmt)).scalar() or 0

        easy_solved_stmt = (
            select(func.count(CodingProgress.id))
            .join(CodingProblem, CodingProgress.problem_id == CodingProblem.id)
            .where(CodingProgress.user_id == uid)
            .where(CodingProgress.status == "solved")
            .where(CodingProblem.difficulty == "easy")
        )
        easy_solved = (await session.execute(easy_solved_stmt)).scalar() or 0
        medium_solved_stmt = (
            select(func.count(CodingProgress.id))
            .join(CodingProblem, CodingProgress.problem_id == CodingProblem.id)
            .where(CodingProgress.user_id == uid)
            .where(CodingProgress.status == "solved")
            .where(CodingProblem.difficulty == "medium")
        )
        medium_solved = (await session.execute(medium_solved_stmt)).scalar() or 0
        hard_solved_stmt = (
            select(func.count(CodingProgress.id))
            .join(CodingProblem, CodingProgress.problem_id == CodingProblem.id)
            .where(CodingProgress.user_id == uid)
            .where(CodingProgress.status == "solved")
            .where(CodingProblem.difficulty == "hard")
        )
        hard_solved = (await session.execute(hard_solved_stmt)).scalar() or 0

        return {
            "total": total,
            "solved": solved,
            "attempted": attempted,
            "bookmarked": bookmarked,
            "accuracy": round(solved / attempted * 100, 1) if attempted else 0,
            "easyTotal": easy_total,
            "mediumTotal": medium_total,
            "hardTotal": hard_total,
            "easySolved": easy_solved,
            "mediumSolved": medium_solved,
            "hardSolved": hard_solved,
        }
