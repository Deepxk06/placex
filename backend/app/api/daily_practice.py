from fastapi import APIRouter, Depends, Body
from app.database import get_db
from app.auth import verify_token
from app.models import DailyPractice, UserStreak, CodingProblem, AptitudeQuestion, Assessment
from sqlalchemy import select, func
from datetime import datetime, timezone, timedelta
import random

router = APIRouter()


def today_str():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


@router.get("/daily")
async def get_daily_practice(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        date = today_str()
        stmt = select(DailyPractice).where(DailyPractice.user_id == uid, DailyPractice.date == date)
        result = await session.execute(stmt)
        daily = result.scalar_one_or_none()

        if not daily:
            coding_stmt = select(CodingProblem.id).order_by(func.random()).limit(3)
            coding_ids = [r[0] for r in (await session.execute(coding_stmt)).all()]
            apt_stmt = select(AptitudeQuestion.id).order_by(func.random()).limit(5)
            apt_ids = [r[0] for r in (await session.execute(apt_stmt)).all()]
            mcq_stmt = select(AptitudeQuestion.id).order_by(func.random()).limit(3)
            mcq_ids = [r[0] for r in (await session.execute(mcq_stmt)).all()]

            daily = DailyPractice(
                user_id=uid, date=date,
                coding_ids=coding_ids, aptitude_ids=apt_ids, mcq_ids=mcq_ids,
                created_at=datetime.now(timezone.utc),
            )
            session.add(daily)
            await session.commit()
            await session.refresh(daily)

        coding_done = set(daily.completed_coding or [])
        apt_done = set(daily.completed_aptitude or [])
        mcq_done = set(daily.completed_mcq or [])

        coding_problems = []
        for pid in (daily.coding_ids or []):
            p = await session.get(CodingProblem, pid)
            if p:
                coding_problems.append({
                    "id": p.id, "title": p.title, "difficulty": p.difficulty,
                    "topics": p.topics, "completed": pid in coding_done,
                })

        apt_questions = []
        for qid in (daily.aptitude_ids or []):
            q = await session.get(AptitudeQuestion, qid)
            if q:
                apt_questions.append({
                    "id": q.id, "topic": q.topic, "difficulty": q.difficulty,
                    "completed": qid in apt_done,
                })

        mcq_questions = []
        for qid in (daily.mcq_ids or []):
            q = await session.get(AptitudeQuestion, qid)
            if q:
                mcq_questions.append({
                    "id": q.id, "topic": q.topic, "difficulty": q.difficulty,
                    "completed": qid in mcq_done,
                })

        total = len(coding_problems) + len(apt_questions) + len(mcq_questions)
        done = len(coding_done) + len(apt_done) + len(mcq_done)

        return {
            "date": date,
            "coding": coding_problems,
            "aptitude": apt_questions,
            "mcq": mcq_questions,
            "progress": {"total": total, "completed": done, "pct": round(done / max(total, 1) * 100)},
        }


@router.post("/complete")
async def mark_complete(payload: dict = Body(...), uid: str = Depends(verify_token)):
    async with get_db()() as session:
        date = today_str()
        stmt = select(DailyPractice).where(DailyPractice.user_id == uid, DailyPractice.date == date)
        result = await session.execute(stmt)
        daily = result.scalar_one_or_none()
        if not daily:
            daily = DailyPractice(user_id=uid, date=date, created_at=datetime.now(timezone.utc))
            session.add(daily)
            await session.flush()

        item_type = payload.get("type")
        item_id = payload.get("id")
        if item_type == "coding":
            done = daily.completed_coding or []
            if item_id not in done:
                done.append(item_id)
            daily.completed_coding = done
        elif item_type == "aptitude":
            done = daily.completed_aptitude or []
            if item_id not in done:
                done.append(item_id)
            daily.completed_aptitude = done
        elif item_type == "mcq":
            done = daily.completed_mcq or []
            if item_id not in done:
                done.append(item_id)
            daily.completed_mcq = done

        await session.commit()

        streak_stmt = select(UserStreak).where(UserStreak.user_id == uid)
        streak_result = await session.execute(streak_stmt)
        streak = streak_result.scalar_one_or_none()
        if not streak:
            streak = UserStreak(user_id=uid, created_at=datetime.now(timezone.utc))
            session.add(streak)

        last = streak.last_practice_date
        today = today_str()
        yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
        if last == today:
            pass
        elif last == yesterday:
            streak.current_streak += 1
        else:
            streak.current_streak = 1
        streak.last_practice_date = today
        streak.total_practice_days = max(streak.total_practice_days, 0) + (1 if last != today else 0)
        streak.longest_streak = max(streak.longest_streak, streak.current_streak)
        streak.xp += 10
        streak.level = 1 + streak.xp // 100

        badges = streak.badges or []
        if streak.current_streak >= 7 and "7_day_streak" not in badges:
            badges.append("7_day_streak")
        if streak.current_streak >= 30 and "30_day_streak" not in badges:
            badges.append("30_day_streak")
        if streak.total_practice_days >= 100 and "centurion" not in badges:
            badges.append("centurion")
        streak.badges = badges

        await session.commit()
        return {"message": "Marked complete", "streak": streak.current_streak, "xp": streak.xp}


@router.get("/streak")
async def get_streak(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(UserStreak).where(UserStreak.user_id == uid)
        result = await session.execute(stmt)
        streak = result.scalar_one_or_none()
        if not streak:
            return {
                "current_streak": 0, "longest_streak": 0, "total_practice_days": 0,
                "last_practice_date": "", "xp": 0, "level": 1, "badges": [],
            }
        last = streak.last_practice_date
        today = today_str()
        yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
        if last and last != today and last != yesterday:
            streak.current_streak = 0
            await session.commit()
        return {
            "current_streak": streak.current_streak, "longest_streak": streak.longest_streak,
            "total_practice_days": streak.total_practice_days,
            "last_practice_date": streak.last_practice_date,
            "xp": streak.xp, "level": streak.level, "badges": streak.badges or [],
        }


@router.get("/calendar")
async def get_calendar(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(DailyPractice.date).where(DailyPractice.user_id == uid)
        result = await session.execute(stmt)
        dates = [r[0] for r in result.all()]
        return {"practice_dates": dates}
