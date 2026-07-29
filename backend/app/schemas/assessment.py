from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CodingSubmission(BaseModel):
    problemId: str
    language: str
    code: str


class CodingSubmissionResponse(BaseModel):
    passedTestCases: int
    totalTestCases: int
    status: str
    runtime: float
    results: List[dict]


class AptitudeAnswer(BaseModel):
    questionId: str
    selectedIndex: int
    timeTaken: int


class AptitudeSubmission(BaseModel):
    answers: List[AptitudeAnswer]


class AssessmentResult(BaseModel):
    score: int
    total: int
    percentage: float
    topicScores: dict
    timeTaken: int


class SkillGapResult(BaseModel):
    currentSkills: List[str]
    targetSkills: List[str]
    missingSkills: List[str]
    recommendations: List[str]
