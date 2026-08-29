import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.resume_sections import detect_heading, detect_sections, get_section_text


class TestHeadingNormalization:
    def test_common_aliases(self):
        assert detect_heading("EDUCATION") == "education"
        assert detect_heading("Academic Background") == "education"
        assert detect_heading("Educational Qualification") == "education"
        assert detect_heading("Work Experience") == "experience"
        assert detect_heading("Professional Experience") == "experience"
        assert detect_heading("TECHNICAL SKILLS") == "skills"
        assert detect_heading("Core Competencies") == "skills"
        assert detect_heading("PROJECTS") == "projects"
        assert detect_heading("Academic Projects") == "projects"
        assert detect_heading("Certifications") == "certifications"
        assert detect_heading("Achievements") == "achievements"
        assert detect_heading("Internship Experience") == "internships"
        assert detect_heading("Career Objective") == "objective"
        assert detect_heading("Professional Summary") == "summary"

    def test_unknown_text_not_heading(self):
        assert detect_heading("Developed a machine learning model using Python and deployed it to AWS") is None
        assert detect_heading("") is None


class TestSectionDetection:
    SAMPLE = """John Doe
john@example.com

EDUCATION
B.Tech Computer Science, ABC University, 2023

TECHNICAL SKILLS
Python, SQL, Docker

WORK EXPERIENCE
XYZ Corp
Software Engineer
Built APIs.

PROJECTS
Chatbot
Built a chatbot with Python.
"""

    def test_sections_found(self):
        sections = detect_sections(self.SAMPLE)
        names = set(sections.keys())
        assert "education" in names
        assert "skills" in names
        assert "experience" in names
        assert "projects" in names

    def test_section_ordering_and_content(self):
        sections = detect_sections(self.SAMPLE)
        assert "B.Tech" in get_section_text(sections, "education")
        assert "Python, SQL, Docker" in get_section_text(sections, "skills")
        assert "XYZ Corp" in get_section_text(sections, "experience")
        assert "Chatbot" in get_section_text(sections, "projects")

    def test_missing_sections_not_invented(self):
        sections = detect_sections("No headings here at all just text")
        assert sections == {}