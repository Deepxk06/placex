"""Public compiler endpoints: run arbitrary code in the sandbox (playground)."""

from fastapi import APIRouter, HTTPException, Body, Depends

from app.auth import verify_token
from app.services.compiler.runner import run_code
from app.services.compiler.languages import list_languages

router = APIRouter()


@router.get("/languages")
async def languages(uid: str = Depends(verify_token)):
    return list_languages()


@router.post("/run")
async def run(payload: dict = Body(...), uid: str = Depends(verify_token)):
    language = str(payload.get("language") or "").strip()
    code = str(payload.get("code") or "")
    stdin = str(payload.get("stdin") or "")

    if not language:
        raise HTTPException(400, "language is required")
    if not code.strip():
        raise HTTPException(400, "code is required")

    result = await run_code(code, language, stdin=stdin, timeout_ms=7000)
    if result.get("status") == "unsupported":
        raise HTTPException(400, result.get("message", "Unsupported language"))
    return result