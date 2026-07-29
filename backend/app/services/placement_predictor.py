import joblib
import numpy as np
import os

MODEL_PATH = "ai/models/placement_model.pkl"
SCALER_PATH = "ai/models/scaler.pkl"


async def predict_placement(features: dict) -> dict:
    model = None
    scaler = None

    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            scaler = joblib.load(SCALER_PATH)
        except Exception:
            pass

    if model is None:
        return fallback_predict(features)

    X = np.array([[
        features.get("cgpa", 0),
        features.get("skillsCount", 0),
        features.get("projectCount", 0),
        features.get("resumeScore", 0),
        features.get("aptitudeScore", 0),
        features.get("interviewScore", 0),
    ]])
    X_scaled = scaler.transform(X)
    prob = model.predict_proba(X_scaled)[0][1]
    salary = predict_salary(model, X_scaled, scaler, features)
    role = predict_role(features)
    recommendations = get_skill_recommendations(features, role)

    return {
        "placementProbability": round(float(prob), 2),
        "expectedSalary": round(float(salary), 2),
        "predictedRole": role,
        "skillRecommendations": recommendations,
    }


def fallback_predict(features: dict) -> dict:
    cgpa = features.get("cgpa", 0)
    skills_count = features.get("skillsCount", 0)
    projects = features.get("projectCount", 0)
    resume_score = features.get("resumeScore", 0)
    aptitude_score = features.get("aptitudeScore", 0)
    interview_score = features.get("interviewScore", 0)

    prob = (
        0.30 * min(cgpa / 10, 1) +
        0.20 * min(skills_count / 10, 1) +
        0.10 * min(projects / 5, 1) +
        0.15 * min(resume_score / 100, 1) +
        0.10 * min(aptitude_score / 100, 1) +
        0.15 * min(interview_score / 100, 1)
    )
    prob = min(prob * 1.2, 0.95)

    base_salary = 300000 + (cgpa * 100000) + (skills_count * 50000) + (projects * 100000)
    salary = base_salary * (0.8 + prob * 0.4)

    role = predict_role(features)
    recommendations = get_skill_recommendations(features, role)

    return {
        "placementProbability": round(prob, 2),
        "expectedSalary": round(salary, 2),
        "predictedRole": role,
        "skillRecommendations": recommendations,
    }


def predict_salary(model, X_scaled, scaler, features):
    try:
        if hasattr(model, 'estimators_'):
            salary_model = joblib.load("ai/models/salary_model.pkl")
            return salary_model.predict(X_scaled)[0]
    except Exception:
        pass
    base = 300000 + features.get("cgpa", 0) * 100000
    return base * (0.8 + features.get("placementProbability", 0.5) * 0.4)


def predict_role(features: dict) -> str:
    skills_count = features.get("skillsCount", 0)
    resume_score = features.get("resumeScore", 0)
    if skills_count >= 8 and resume_score >= 70:
        return "Software Engineer"
    elif skills_count >= 5:
        return "Software Developer"
    elif features.get("cgpa", 0) >= 8.0:
        return "Data Analyst"
    else:
        return "Junior Developer"


def get_skill_recommendations(features: dict, role: str) -> list:
    recommendations = []
    if features.get("skillsCount", 0) < 5:
        recommendations.append("Learn in-demand programming languages (Python, Java, JavaScript)")
    if features.get("resumeScore", 0) < 60:
        recommendations.append("Improve your resume ATS score with more keywords and action verbs")
    if features.get("aptitudeScore", 0) < 60:
        recommendations.append("Practice aptitude and logical reasoning questions")
    if features.get("interviewScore", 0) < 50:
        recommendations.append("Practice mock interviews to improve confidence and communication")
    if features.get("projectCount", 0) < 2:
        recommendations.append("Build at least 2-3 strong projects to showcase on your resume")
    if features.get("cgpa", 0) < 7.0:
        recommendations.append("Focus on improving your CGPA to at least 7.0")
    if "Software" in role:
        recommendations.extend(["Master Data Structures & Algorithms", "Learn System Design basics"])
    return recommendations[:6]
