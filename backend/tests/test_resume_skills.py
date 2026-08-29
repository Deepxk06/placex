import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.resume_skills import (
    normalize_skill,
    normalize_skill_list,
    match_skills_in_text,
    categorize_skills,
    extract_skills_from_section,
)


class TestSkillNormalization:
    def test_canonical_aliases(self):
        assert normalize_skill("ML") == "Machine Learning"
        assert normalize_skill("machine-learning") == "Machine Learning"
        assert normalize_skill("Postgres") == "PostgreSQL"
        assert normalize_skill("Postgres DB") == "PostgreSQL"
        assert normalize_skill("JS") == "JavaScript"
        assert normalize_skill("Javascript") == "JavaScript"
        assert normalize_skill("Java Script") == "JavaScript"
        assert normalize_skill("sklearn") == "Scikit-learn"
        assert normalize_skill("k8s") == "Kubernetes"

    def test_known_values_unchanged(self):
        assert normalize_skill("C++") == "C++"
        assert normalize_skill("Python") == "Python"
        assert normalize_skill("SQL") == "SQL"

    def test_unknown_value_title_cased(self):
        assert normalize_skill("elixir") == "Elixir"

    def test_list_deduplication(self):
        result = normalize_skill_list(["Python", "python", "JS", "JavaScript"])
        assert result == ["Python", "JavaScript"]


class TestSkillExtraction:
    def test_match_in_text(self):
        skills = match_skills_in_text("Built an ML model with Python and Postgres.")
        assert "Python" in skills
        assert "Machine Learning" in skills
        assert "PostgreSQL" in skills

    def test_no_java_false_positive_from_javascript(self):
        skills = match_skills_in_text("Developed with JavaScript")
        assert "Java" not in skills
        assert "JavaScript" in skills

    def test_no_git_false_positive_from_digital(self):
        skills = match_skills_in_text("Worked on digital marketing campaigns")
        assert "Git" not in skills

    def test_no_oop_false_positive_from_loop(self):
        skills = match_skills_in_text("Implemented a feedback loop")
        assert "OOP" not in skills

    def test_section_extraction(self):
        skills = extract_skills_from_section("Python, SQL, Docker | Git, React")
        assert skills == ["Python", "SQL", "Docker", "Git", "React"]

    def test_categorization(self):
        categories = categorize_skills(["Python", "Docker", "SQL", "Communication"])
        assert categories["Programming Languages"] == ["Python"]
        assert categories["DevOps & Tools"] == ["Docker"]
        assert categories["Databases"] == ["SQL"]
        assert categories["Soft Skills"] == ["Communication"]