from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ResumeUpload(BaseModel):
    fileUrl: str


class ResumeSection(BaseModel):
    name: str
    data: dict


class ResumeBuilderCreate(BaseModel):
    templateId: str
    sections: List[ResumeSection]


class ResumeBuilderUpdate(BaseModel):
    sections: List[ResumeSection]


class ATSResult(BaseModel):
    overall: float
    keywordScore: float
    formatScore: float
    lengthScore: float
    verbScore: float
    sectionScore: float
    suggestions: List[str]


class JDMatchResult(BaseModel):
    matchScore: float
    matchingSkills: List[str]
    missingSkills: List[str]
    suggestions: List[str]


class ResumeResponse(BaseModel):
    _id: str
    userId: str
    atsScore: Optional[ATSResult] = None
    jdMatchScore: Optional[JDMatchResult] = None
    createdAt: datetime
