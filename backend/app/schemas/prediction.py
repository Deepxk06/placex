from pydantic import BaseModel
from typing import List, Optional


class PredictionResponse(BaseModel):
    placementProbability: float
    expectedSalary: float
    predictedRole: str
    skillRecommendations: List[str]
    featuresUsed: dict
