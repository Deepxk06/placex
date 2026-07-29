from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.auth import verify_token, create_dev_token
from app.models import User
from app.schemas.user import UserCreate, UserUpdate
from sqlalchemy import select, update as sa_update
from datetime import datetime, timezone

router = APIRouter()


class DevLoginRequest:
    def __init__(self, email: str, password: str = ""):
        self.email = email
        self.password = password


from pydantic import BaseModel


class DevLoginReq(BaseModel):
    email: str
    password: str = ""


@router.post("/register")
async def register(user: UserCreate):
    async with get_db()() as session:
        existing = await session.get(User, user.uid)
        if existing:
            raise HTTPException(400, "User already exists")
        now = datetime.now(timezone.utc)
        doc = User(
            uid=user.uid, email=user.email, name=user.name, role=user.role or "student",
            created_at=now, updated_at=now,
        )
        session.add(doc)
        await session.commit()
    return {"message": "User registered", "uid": user.uid}


@router.post("/dev-login")
async def dev_login(req: DevLoginReq):
    async with get_db()() as session:
        stmt = select(User).where(User.email == req.email)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        if not user:
            uid = req.email.replace("@", "_").replace(".", "_")
            now = datetime.now(timezone.utc)
            user = User(uid=uid, email=req.email, name=req.email.split("@")[0], role="student", created_at=now, updated_at=now)
            session.add(user)
            await session.commit()
            uid = user.uid
        else:
            uid = user.uid
    token = create_dev_token(uid, req.email)
    return {
        "token": token,
        "uid": uid,
        "email": req.email,
        "name": user.name,
    }


@router.get("/me")
async def get_me(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        user = await session.get(User, uid)
        if not user:
            raise HTTPException(404, "User not found")
        return {c.name: getattr(user, c.name) for c in User.__table__.columns}


@router.put("/profile")
async def update_profile(profile: UserUpdate, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        user = await session.get(User, uid)
        if not user:
            raise HTTPException(404, "User not found")
        update_data = {k: v for k, v in profile.dict().items() if v is not None}
        if update_data:
            update_data["updated_at"] = datetime.now(timezone.utc)
            for key, val in update_data.items():
                setattr(user, key, val)
            await session.commit()
    return {"message": "Profile updated"}


@router.get("/profile")
async def get_profile(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        user = await session.get(User, uid)
        if not user:
            raise HTTPException(404, "User not found")
        return {c.name: getattr(user, c.name) for c in User.__table__.columns}
