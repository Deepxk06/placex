import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest

from app.services.resume_parser import extract_resume_data, extract_email, extract_phone, extract_links
from app.services.resume_analyzer import analyze_resume, estimate_experience_years
from app.services.jd_analyzer import analyze_job_description
from app.services.job_match import compute_job_match, MATCH_WEIGHTS
from app.services.resume_recommendations import build_recommendations

RICH_RESUME = """John Doe
Software Developer
john@example.com | +91 9876543210 | linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Final year Computer Science student seeking Software Engineer role. Experienced in full stack development and machine learning.

EDUCATION
B.Tech Computer Science, XYZ University, 2022, CGPA 8.5

TECHNICAL SKILLS
Python, Java, JavaScript, React, Node.js, SQL, PostgreSQL, Docker, Git, Machine Learning, TensorFlow

EXPERIENCE
ABC Corp
Software Engineer Intern
Jun 2023 - Dec 2023
Developed REST APIs using Python and Django. Reduced API response time by 30%.

PROJECTS
ML Chatbot
Built an NLP chatbot using Python, TensorFlow and Redis. Improved response accuracy by 20%.

ACHIEVEMENTS
Won 1st prize in college hackathon
"""

EMPTY_RESUME = "Random text with no identifiable structure"


@pytest.mark.asyncio
async def test_rich_resume_scores_well():
    parsed = extract_resume_data(RICH_RESUME)
    analysis = await analyze_resume(parsed)
    assert analysis["resumeScore"] > 70
    assert analysis["atsScore"] >= 60
    assert analysis["atsWarnings"]


@pytest.mark.asyncio
async def test_poor_resume_scores_low():
    parsed = extract_resume_data(EMPTY_RESUME)
    analysis = await analyze_resume(parsed)
    assert analysis["resumeScore"] < 40
    assert len(analysis["atsWarnings"]) >= 3


@pytest.mark.asyncio
async def test_contact_extraction():
    text = "Jane Doe\njane@test.com | +91 9000000000\nlinkedin.com/in/jane github.com/jane"
    assert extract_email(text) == "jane@test.com"
    assert extract_phone(text)
    linkedin, github, _ = extract_links(text)
    assert "linkedin.com" in linkedin
    assert "github.com" in github


@pytest.mark.asyncio
async def test_project_analysis_no_fabrication():
    parsed = extract_resume_data("""John
PROJECTS
Basic App
Created an ML project using Python.
""")
    analysis = await analyze_resume(parsed)
    project = analysis["projectAnalysis"][0]
    assert project["strength"] == "weak"
    assert project["hasMetric"] is False
    assert "measurable" in project["recommendation"].lower()


@pytest.mark.asyncio
async def test_ats_warnings_for_missing_contact():
    parsed = extract_resume_data("""Developer
SKILLS
Python, SQL
""")
    analysis = await analyze_resume(parsed)
    messages = [w["message"].lower() for w in analysis["atsWarnings"]]
    assert any("email" in m for m in messages)
    assert any("phone" in m for m in messages)


@pytest.mark.asyncio
async def test_experience_years_estimate():
    parsed = {
        "experience": [{"duration": "Jan 2021 - Dec 2022"}],
        "internships": [],
    }
    assert estimate_experience_years(parsed) >= 2.0


JD = """Data Scientist
We need a Data Scientist with strong Python, Machine Learning, SQL and Statistics.
Requirements:
- 1+ years of experience
- Python, Scikit-learn, Pandas required
- Experience with AWS preferred
Preferred qualifications:
- NLP
- Power BI
"""


@pytest.mark.asyncio
async def test_jd_analysis_classification():
    jd = await analyze_job_description(JD)
    assert "Machine Learning" in jd["skills"]["required"]
    assert "AWS" in jd["skills"]["required"]
    assert "NLP" in jd["skills"]["preferred"]
    assert jd["experience"]["minYears"] == 1


@pytest.mark.asyncio
async def test_job_match_components():
    parsed = extract_resume_data(RICH_RESUME)
    jd_analysis = await analyze_job_description(JD)
    match = await compute_job_match(parsed, JD, jd_analysis)
    assert 0 <= match["score"] <= 100
    assert "Python" in match["matchedSkills"]
    assert "Power BI" in match["missingSkills"]
    assert set(match["explanation"].keys()) == {
        "requiredSkills", "preferredSkills", "semanticSimilarity",
        "projectRelevance", "experienceMatch", "educationMatch",
    }
    assert sum(MATCH_WEIGHTS.values()) == 1.0


@pytest.mark.asyncio
async def test_missing_skill_not_classified_when_equivalent_present():
    parsed = extract_resume_data("""John
SKILLS
Python, PostgreSQL
""")
    jd = "Requirements: Postgres experience required"
    jd_analysis = await analyze_job_description(jd)
    match = await compute_job_match(parsed, jd, jd_analysis)
    assert "PostgreSQL" in match["matchedSkills"]
    assert "PostgreSQL" not in match["missingSkills"]


@pytest.mark.asyncio
async def test_recommendations_structure():
    parsed = extract_resume_data(RICH_RESUME)
    analysis = await analyze_resume(parsed)
    recs = build_recommendations(parsed, analysis)
    assert len(recs) >= 1
    for rec in recs:
        assert rec["priority"] in ("high", "medium", "low")
        assert rec["category"]
        assert rec["issue"] and rec["why"] and rec["action"]