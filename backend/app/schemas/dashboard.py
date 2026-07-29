from pydantic import BaseModel
from typing import List, Optional


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


class DomainRecommendation(BaseModel):
    domain: str
    matchScore: float
    reason: str


class DashboardResponse(BaseModel):
    resumeScore: Optional[float] = None
    codingProgress: dict
    aptitudeProgress: dict
    interviewScore: Optional[float] = None
    interviewPerformance: dict
    placementReadiness: float
    recentActivity: List[dict]


class AdminAnalytics(BaseModel):
    totalStudents: int
    totalResumes: int
    averageCgpa: float
    averageResumeScore: float
    placementRate: float
    topCompanies: List[str]
    topSkills: List[str]
    branchWiseStats: List[dict]
    departmentReports: List[dict]
