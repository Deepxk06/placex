from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class JobResponse(BaseModel):
    _id: str
    title: str
    company: str
    location: str
    description: str
    requiredSkills: List[str]
    type: str
    salaryRange: dict
    applyUrl: str
    role: str
    matchScore: Optional[float] = None


class JobSearchParams(BaseModel):
    query: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    skills: Optional[List[str]] = None
    source: Optional[str] = None
    minSalary: Optional[float] = None
    maxSalary: Optional[float] = None
