from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class InterviewQuestion(BaseModel):
    question: str
    category: str


class AudioSubmission(BaseModel):
    interviewId: str
    questionIndex: int
    audioData: str


class InterviewAnalysis(BaseModel):
    confidenceScore: float
    fluencyScore: float
    sentimentScore: float
    speechRate: float
    fillerWordCount: int
    feedback: List[str]
    overallScore: float


class InterviewResponse(BaseModel):
    _id: str
    type: str
    status: str
    questions: List[dict]
    analysis: Optional[InterviewAnalysis] = None
    overallScore: Optional[float] = None
    completedAt: Optional[datetime] = None
    createdAt: datetime
