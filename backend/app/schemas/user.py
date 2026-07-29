from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserCreate(BaseModel):
    uid: str
    email: str
    name: str
    role: str = "student"


class UserProfile(BaseModel):
    name: str
    college: Optional[str] = ""
    branch: Optional[str] = ""
    cgpa: Optional[float] = 0.0
    gradYear: Optional[int] = None
    skills: Optional[List[str]] = []
    targetRole: Optional[str] = ""
    targetIndustry: Optional[str] = ""
    preferredLocation: Optional[str] = ""
    desiredSkills: Optional[List[str]] = []


class UserResponse(BaseModel):
    _id: str
    email: str
    name: str
    role: str
    college: str
    branch: str
    cgpa: float
    gradYear: int
    skills: List[str]
    targetRole: str
    createdAt: datetime
    updatedAt: datetime


class UserUpdate(BaseModel):
    name: Optional[str] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    cgpa: Optional[float] = None
    gradYear: Optional[int] = None
    skills: Optional[List[str]] = None
    targetRole: Optional[str] = None
    targetIndustry: Optional[str] = None
    preferredLocation: Optional[str] = None
