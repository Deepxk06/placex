import base64
import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from app.database import get_db
from app.auth import verify_token
from app.models import User, UserProfile
from app.schemas.profile import ProfileUpdate

router = APIRouter()

ALLOWED_IMAGE_EXTS = {"jpg", "jpeg", "png", "webp"}
ALLOWED_DOC_EXTS = {"jpg", "jpeg", "png", "webp", "pdf"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB

MIME_MAP = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
    "pdf": "application/pdf",
}

DOC_COLUMNS = {
    "student_id": "student_id_doc",
    "aadhaar": "aadhaar_doc",
    "driving_license": "driving_license_doc",
}

SECTION_COLUMNS = {
    "personal": ["date_of_birth", "gender", "blood_group", "aadhaar_number", "nationality", "bio"],
    "contact": ["phone", "alternate_phone", "personal_email", "website"],
    "address": [
        "address_line1", "address_line2", "city", "district", "state", "country",
        "pin_code", "landmark", "address_type", "latitude", "longitude",
    ],
    "college": [
        "college_name", "college_location", "degree", "branch", "cgpa",
        "start_year", "end_year", "roll_number", "admission_number",
    ],
    "settings": [
        "language", "theme", "email_notifications", "sms_notifications",
        "push_notifications", "profile_visibility", "two_factor_enabled",
    ],
}


async def get_or_create_profile(session, uid: str) -> UserProfile:
    profile = await session.get(UserProfile, uid)
    if not profile:
        profile = UserProfile(user_id=uid)
        session.add(profile)
        await session.commit()
        await session.refresh(profile)
    return profile


def log_activity(profile: UserProfile, action: str, detail: str = ""):
    items = list(profile.activity or [])
    items.append({"action": action, "detail": detail, "time": datetime.now(timezone.utc).isoformat()})
    profile.activity = items[-20:]


def serialize_profile(profile: UserProfile, user: User = None) -> dict:
    return {
        "personal": {c: getattr(profile, c) for c in SECTION_COLUMNS["personal"]},
        "contact": {c: getattr(profile, c) for c in SECTION_COLUMNS["contact"]},
        "address": {c: getattr(profile, c) for c in SECTION_COLUMNS["address"]},
        "college": {c: getattr(profile, c) for c in SECTION_COLUMNS["college"]},
        "settings": {c: getattr(profile, c) for c in SECTION_COLUMNS["settings"]},
        "photo": profile.photo or "",
        "documents": {
            "student_id": profile.student_id_doc or {},
            "aadhaar": profile.aadhaar_doc or {},
            "driving_license": profile.driving_license_doc or {},
        },
        "isVerified": bool(profile.is_verified),
        "completionPct": profile.completion_pct(),
        "lastUpdated": (profile.updated_at.isoformat() if profile.updated_at else None),
        "recentActivity": profile.activity or [],
        "user": {
            "name": user.name if user else "",
            "email": user.email if user else "",
            "role": user.role if user else "student",
        } if user else None,
    }


def apply_profile_update(profile: UserProfile, payload: ProfileUpdate, user: User = None) -> bool:
    changed = False
    data = payload.model_dump(exclude_unset=True)
    for section, fields in SECTION_COLUMNS.items():
        if section not in data or not data[section]:
            continue
        for key, value in data[section].items():
            if value is None:
                continue
            if key not in fields:
                raise HTTPException(422, f"Unknown field '{section}.{key}'")
            setattr(profile, key, value)
            changed = True
    return changed


def sync_user_fields(profile: UserProfile, user: User):
    if profile.college_name:
        user.college = profile.college_name
    if profile.branch:
        user.branch = profile.branch
    if profile.cgpa:
        try:
            user.cgpa = float(profile.cgpa)
        except ValueError:
            pass
    if profile.end_year:
        try:
            user.grad_year = int(profile.end_year)
        except ValueError:
            pass


async def _validate_file(file: UploadFile, allowed: set) -> tuple[bytes, str]:
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in allowed:
        raise HTTPException(400, f"Invalid file type '{ext}'. Allowed: {', '.join(sorted(allowed))}")
    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "File too large. Maximum size is 5 MB")
    if not _valid_magic(content, ext):
        raise HTTPException(400, "File content does not match its extension")
    return content, ext


def _valid_magic(content: bytes, ext: str) -> bool:
    if ext in ("jpg", "jpeg"):
        return content.startswith(b"\xff\xd8\xff")
    if ext == "png":
        return content.startswith(b"\x89PNG\r\n\x1a\n")
    if ext == "webp":
        return content[:4] == b"RIFF" and content[8:12] == b"WEBP"
    if ext == "pdf":
        return content.startswith(b"%PDF")
    return False


def _to_data_url(content: bytes, ext: str) -> str:
    mime = MIME_MAP.get(ext, "application/octet-stream")
    return f"data:{mime};base64,{base64.b64encode(content).decode()}"


@router.get("")
async def get_profile(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        profile = await get_or_create_profile(session, uid)
        user = await session.get(User, uid)
        return serialize_profile(profile, user)


@router.put("")
async def update_profile(payload: ProfileUpdate, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        profile = await get_or_create_profile(session, uid)
        user = await session.get(User, uid)
        changed = apply_profile_update(profile, payload, user)
        if user is not None and (payload.college or payload.contact):
            sync_user_fields(profile, user)
        if changed:
            profile.updated_at = datetime.now(timezone.utc)
            log_activity(profile, "profile_updated", "Profile details updated")
        await session.commit()
        return serialize_profile(profile, user)


@router.post("/photo")
async def upload_photo(file: UploadFile = File(...), uid: str = Depends(verify_token)):
    content, ext = await _validate_file(file, ALLOWED_IMAGE_EXTS)
    async with get_db()() as session:
        profile = await get_or_create_profile(session, uid)
        profile.photo = _to_data_url(content, ext)
        profile.updated_at = datetime.now(timezone.utc)
        log_activity(profile, "photo_updated", "Profile photo updated")
        await session.commit()
        return serialize_profile(profile, await session.get(User, uid))


@router.delete("/photo")
async def delete_photo(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        profile = await get_or_create_profile(session, uid)
        profile.photo = ""
        profile.updated_at = datetime.now(timezone.utc)
        log_activity(profile, "photo_removed", "Profile photo removed")
        await session.commit()
        return serialize_profile(profile, await session.get(User, uid))


@router.post("/documents/{doc_type}")
async def upload_document(doc_type: str, file: UploadFile = File(...), uid: str = Depends(verify_token)):
    column = DOC_COLUMNS.get(doc_type)
    if not column:
        raise HTTPException(400, "doc_type must be one of: student_id, aadhaar, driving_license")
    content, ext = await _validate_file(file, ALLOWED_DOC_EXTS)
    doc = {
        "name": file.filename,
        "size": len(content),
        "type": MIME_MAP.get(ext, "application/octet-stream"),
        "dataUrl": _to_data_url(content, ext),
        "uploadedAt": datetime.now(timezone.utc).isoformat(),
    }
    async with get_db()() as session:
        profile = await get_or_create_profile(session, uid)
        setattr(profile, column, doc)
        profile.updated_at = datetime.now(timezone.utc)
        log_activity(profile, "document_uploaded", f"{doc_type.replace('_', ' ').title()} uploaded")
        await session.commit()
        return serialize_profile(profile, await session.get(User, uid))


@router.delete("/documents/{doc_type}")
async def delete_document(doc_type: str, uid: str = Depends(verify_token)):
    column = DOC_COLUMNS.get(doc_type)
    if not column:
        raise HTTPException(400, "doc_type must be one of: student_id, aadhaar, driving_license")
    async with get_db()() as session:
        profile = await get_or_create_profile(session, uid)
        setattr(profile, column, {})
        profile.updated_at = datetime.now(timezone.utc)
        log_activity(profile, "document_removed", f"{doc_type.replace('_', ' ').title()} removed")
        await session.commit()
        return serialize_profile(profile, await session.get(User, uid))
