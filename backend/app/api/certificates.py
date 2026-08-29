from datetime import datetime, timezone
import uuid

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import select

from app.auth import verify_token
from app.database import get_db
from app.models import Certificate

router = APIRouter()


class CertificateCreate(BaseModel):
    name: str
    issuing_org: str = ""
    issue_date: str = ""
    expiry_date: str = ""
    credential_id: str = ""
    verification_url: str = ""
    file_data: str = ""
    file_type: str = ""


class CertificateUpdate(BaseModel):
    name: str = None
    issuing_org: str = None
    issue_date: str = None
    expiry_date: str = None
    credential_id: str = None
    verification_url: str = None
    file_data: str = None
    file_type: str = None


def serialize_certificate(cert: Certificate) -> dict:
    return {
        "id": str(cert.id),
        "userId": cert.user_id,
        "name": cert.name,
        "issuingOrg": cert.issuing_org,
        "issueDate": cert.issue_date,
        "expiryDate": cert.expiry_date,
        "credentialId": cert.credential_id,
        "verificationUrl": cert.verification_url,
        "fileData": cert.file_data,
        "fileType": cert.file_type,
        "createdAt": cert.created_at.isoformat() if cert.created_at else None,
        "updatedAt": cert.updated_at.isoformat() if cert.updated_at else None,
    }


async def get_owned_certificate(session, cert_id: str, uid: str) -> Certificate:
    try:
        cert_uuid = str(uuid.UUID(cert_id))
    except (ValueError, AttributeError):
        raise HTTPException(404, "Certificate not found")
    cert = await session.get(Certificate, cert_uuid)
    if not cert:
        raise HTTPException(404, "Certificate not found")
    if cert.user_id != uid:
        raise HTTPException(403, "You do not have access to this certificate")
    return cert


@router.get("/")
async def list_certificates(uid: str = Depends(verify_token)):
    async with get_db()() as session:
        stmt = select(Certificate).where(Certificate.user_id == uid).order_by(Certificate.created_at.desc()).limit(50)
        result = await session.execute(stmt)
        certs = result.scalars().all()
        return [serialize_certificate(c) for c in certs]


@router.post("/")
async def add_certificate(body: CertificateCreate, uid: str = Depends(verify_token)):
    cert = Certificate(
        id=str(uuid.uuid4()),
        user_id=uid,
        name=body.name,
        issuing_org=body.issuing_org,
        issue_date=body.issue_date,
        expiry_date=body.expiry_date,
        credential_id=body.credential_id,
        verification_url=body.verification_url,
        file_data=body.file_data,
        file_type=body.file_type,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    async with get_db()() as session:
        session.add(cert)
        await session.commit()
        await session.refresh(cert)
    return serialize_certificate(cert)


@router.put("/{cert_id}")
async def update_certificate(cert_id: str, body: CertificateUpdate, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        cert = await get_owned_certificate(session, cert_id, uid)
        update_data = body.model_dump(exclude_unset=True)
        field_map = {
            "name": "name",
            "issuing_org": "issuing_org",
            "issue_date": "issue_date",
            "expiry_date": "expiry_date",
            "credential_id": "credential_id",
            "verification_url": "verification_url",
            "file_data": "file_data",
            "file_type": "file_type",
        }
        for api_field, db_field in field_map.items():
            if api_field in update_data:
                setattr(cert, db_field, update_data[api_field])
        cert.updated_at = datetime.now(timezone.utc)
        await session.commit()
        await session.refresh(cert)
    return serialize_certificate(cert)


@router.delete("/{cert_id}")
async def delete_certificate(cert_id: str, uid: str = Depends(verify_token)):
    async with get_db()() as session:
        cert = await get_owned_certificate(session, cert_id, uid)
        await session.delete(cert)
        await session.commit()
    return {"message": "Certificate deleted"}
