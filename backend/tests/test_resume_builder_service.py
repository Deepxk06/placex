import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.resume_builder_service import (
    default_sections,
    sections_to_dict,
    sections_to_parsed_data,
    build_profile_import,
    normalize_imported_skills,
    estimate_page_count,
    serialize_builder,
)


class FakeUser:
    name = "Deepak Kumar"
    email = "deepak@test.com"
    linked_in = "linkedin.com/in/deepak"
    target_role = "Data Scientist"
    skills = ["Python", "sql", "Python", "ML"]
    desired_skills = ["SQL", "Docker"]
    projects = [
        {"title": "MediRoute AI", "description": "Emergency platform", "techStack": ["Python", "FastAPI"], "link": "https://github.com/x"},
        {"title": "Chatbot", "description": "NLP chatbot", "techStack": []},
    ]
    current_company = "TechNova"
    current_role = "Software Engineer"
    experience_years = 2


class FakeProfile:
    phone = "+91 98765"
    website = "deepak.dev"
    city = "Chennai"
    state = "TN"
    country = "India"
    bio = "AI student"
    college_name = "ABC College"
    college_location = "Chennai"
    degree = "B.E. CSE"
    branch = "AI & ML"
    cgpa = "7.5"
    end_year = "2027"


def test_default_sections_shape():
    sections = default_sections()
    names = [s["name"] for s in sections]
    assert names == ["personalInfo", "education", "skills", "experience", "projects"]
    assert sections[0]["data"] == {}


def test_build_profile_import():
    imported = build_profile_import(FakeUser(), FakeProfile())
    personal = imported["personalInfo"]["data"]
    assert personal["fullName"] == "Deepak Kumar"
    assert personal["email"] == "deepak@test.com"
    assert personal["linkedIn"] == "linkedin.com/in/deepak"
    assert personal["phone"] == "+91 98765"
    assert personal["location"] == "Chennai, TN, India"
    assert imported["education"]["available"]
    assert imported["education"]["data"]["entries"][0]["institute"] == "ABC College"
    assert imported["skills"]["data"]["items"] == ["Python", "sql", "ML", "Docker"]
    assert imported["projects"]["data"]["entries"][0]["title"] == "MediRoute AI"
    assert imported["experience"]["available"]
    assert imported["experience"]["data"]["entries"][0]["company"] == "TechNova"
    assert imported["certifications"]["available"] is False


def test_profile_import_no_profile():
    imported = build_profile_import(FakeUser(), None)
    assert imported["personalInfo"]["data"]["phone"] == ""
    assert imported["education"]["available"] is False
    assert imported["skills"]["data"]["items"] == ["Python", "sql", "ML", "Docker"]


def test_normalize_imported_skills_dedup():
    assert normalize_imported_skills(["Python", "python", " PYTHON ", "", "Java"]) == ["Python", "Java"]


def test_sections_to_parsed_data():
    sections = default_sections()
    sections[0]["data"] = {"fullName": "Deepak", "email": "d@t.com", "targetRole": "Data Scientist", "linkedIn": "li", "summary": "AI student"}
    sections[1]["data"] = {"entries": [{"degree": "B.E.", "institute": "ABC", "year": "2027", "gpa": "7.5"}]}
    sections[2]["data"] = {"items": ["Python", "SQL"]}
    sections[3]["data"] = {"entries": [{"company": "TechNova", "role": "SE", "duration": "2 years", "description": "Built APIs"}]}
    sections[4]["data"] = {"entries": [{"title": "Chatbot", "description": "NLP", "techStack": ["Python"]}]}
    parsed = sections_to_parsed_data(sections)
    assert parsed["name"] == "Deepak"
    assert parsed["skills"] == ["Python", "SQL"]
    assert parsed["education"][0]["institute"] == "ABC"
    assert parsed["experience"][0]["company"] == "TechNova"
    assert parsed["projects"][0]["techStack"] == ["Python"]
    assert parsed["targetRole"] == "Data Scientist"


def test_estimate_page_count():
    parsed = {"summary": "x", "education": [], "experience": [], "projects": [],
              "certifications": [], "achievements": [], "skills": ["Python"] * 5}
    assert estimate_page_count(parsed) == 1
    long = {
        "summary": "word " * 200, "education": [{"degree": "B", "branch": "C", "institute": "I", "year": "2020", "gpa": "8"}],
        "experience": [{"company": "c", "role": "r", "description": "desc " * 200, "duration": "2y"}],
        "projects": [{"title": "p", "description": "d " * 200, "techStack": ["a"]}],
        "certifications": [], "achievements": [], "skills": ["s"] * 30,
    }
    assert estimate_page_count(long) == 2


def test_serialize_builder_metadata():
    class FakeBuilder:
        id = "abc"
        user_id = "u"
        name = "DS Resume"
        target_role = "Data Scientist"
        experience_level = "fresher"
        template_id = "modern"
        version = 3
        sections = [{"name": "skills", "data": {"items": ["Python"]}}]
        customizations = {}
        created_at = None
        updated_at = None

    s = serialize_builder(FakeBuilder())
    assert s["name"] == "DS Resume"
    assert s["targetRole"] == "Data Scientist"
    assert s["experienceLevel"] == "fresher"
    assert s["templateId"] == "modern"
    assert s["version"] == 3