import json
import os
import hashlib
import hmac
import base64
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Request, HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import get_settings

security = HTTPBearer()
firebase_app = None
firebase_auth = None


def init_firebase():
    global firebase_app, firebase_auth
    if firebase_app is not None:
        return
    try:
        import firebase_admin
        from firebase_admin import credentials, auth as _firebase_auth
        cred_path = get_settings().FIREBASE_CREDENTIALS_PATH
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_app = firebase_admin.initialize_app(cred)
            firebase_auth = _firebase_auth
            print("Firebase initialized")
    except Exception as e:
        print(f"Firebase not available: {e}. Using dev auth mode.")


# ============================================================
# DEV MODE: Simple JWT-like tokens for development
# ============================================================
SECRET_KEY = get_settings().JWT_SECRET


def create_dev_token(uid: str, email: str = "") -> str:
    payload = {
        "uid": uid,
        "email": email,
        "exp": (datetime.utcnow() + timedelta(days=30)).isoformat(),
    }
    data = json.dumps(payload, separators=(",", ":"))
    sig = hmac.new(SECRET_KEY.encode(), data.encode(), hashlib.sha256).hexdigest()
    token = base64.urlsafe_b64encode(f"{data}.{sig}".encode()).decode()
    return token


def verify_dev_token(token: str) -> Optional[dict]:
    try:
        decoded = base64.urlsafe_b64decode(token.encode()).decode()
        data, sig = decoded.rsplit(".", 1)
        expected = hmac.new(SECRET_KEY.encode(), data.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        payload = json.loads(data)
        if payload.get("exp") and payload["exp"] < datetime.utcnow().isoformat():
            return None
        return payload
    except Exception:
        return None


# ============================================================
# Unified auth verification (Firebase first, then dev fallback)
# ============================================================

async def verify_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> str:
    token = credentials.credentials

    # Try Firebase first
    if firebase_app and firebase_auth:
        try:
            decoded = firebase_auth.verify_id_token(token)
            return decoded["uid"]
        except Exception:
            pass  # Fall through to dev mode

    # Try dev mode
    payload = verify_dev_token(token)
    if payload:
        return payload["uid"]

    raise HTTPException(status_code=401, detail="Invalid or expired token")


async def get_current_user(request: Request) -> str:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing auth token")
    return await verify_token(HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials=auth_header.replace("Bearer ", "")
    ))
