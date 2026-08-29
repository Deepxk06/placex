from typing import Dict, List


def build_recommendations(parsed_data: Dict, analysis: Dict, job_match: Dict = None) -> List[Dict]:
    """Build structured recommendations from the deterministic analysis.

    Every recommendation has: priority, category, issue, why, action.
    The system never invents skills, projects or achievements for the student.
    """
    recommendations: List[Dict] = []

    sections = set(parsed_data.get("detectedSections", []))
    skills = parsed_data.get("skills", [])
    projects = parsed_data.get("projects", [])
    experience = parsed_data.get("experience", [])
    education = parsed_data.get("education", [])
    resume_breakdown = analysis.get("resumeBreakdown", {})
    ats_warnings = analysis.get("atsWarnings", [])

    _add(recommendations, analysis, job_match, parsed_data, sections, skills, projects, experience, education, resume_breakdown, ats_warnings)

    # Deduplicate by issue, cap at 10
    seen = set()
    final = []
    for rec in recommendations:
        key = (rec["priority"], rec["category"], rec["issue"].lower())
        if key in seen:
            continue
        seen.add(key)
        final.append(rec)
        if len(final) >= 10:
            break
    return final


def _add(recommendations, analysis, job_match, parsed_data, sections, skills, projects, experience, education, breakdown, warnings):
    warning_types = {w.get("type") for w in warnings}

    # --- Skills ---
    if len(skills) < 5:
        recommendations.append({
            "priority": "high", "category": "Skills",
            "issue": "Only a few skills detected.",
            "why": "Recruiters and ATS filters look for a clear set of technical and soft skills.",
            "action": "List 7-10 skills you actually know in a dedicated skills section, grouped by category.",
        })
    else:
        from app.services.resume_skills import categorize_skills
        categories = categorize_skills(skills)
        if "Data Science & AI" not in categories and "Programming Languages" not in categories:
            recommendations.append({
                "priority": "medium", "category": "Skills",
                "issue": "No core technical skill category detected.",
                "why": "Roles in this portal emphasize programming or data skills.",
                "action": "Add your strongest technical skills explicitly (e.g. Python, SQL) if you have them.",
            })

    # --- Skill gap from job match ---
    if job_match:
        missing = job_match.get("missingSkills", [])
        if missing:
            recommendations.append({
                "priority": "high", "category": "Job Match",
                "issue": f"Missing skills for the target role: {', '.join(missing[:6])}.",
                "why": "These skills appear in the job description but not in your resume.",
                "action": "Add them to your skills section only if you genuinely have experience with them, or learn them before applying.",
            })
        weak = job_match.get("weakSkills", [])
        if weak:
            recommendations.append({
                "priority": "medium", "category": "Job Match",
                "issue": f"Underrepresented skills: {', '.join(weak[:6])}.",
                "why": "These skills appear in your resume text but not in the skills section, so ATS may not count them.",
                "action": "Move them into your skills section and reference them in projects/experience where real.",
            })

    # --- Projects ---
    project_analysis = analysis.get("projectAnalysis", [])
    if not projects:
        recommendations.append({
            "priority": "high", "category": "Projects",
            "issue": "No projects detected.",
            "why": "Projects are the strongest evidence of practical skills for placement roles.",
            "action": "Add 2-3 real projects you have built (academic or personal) with technologies used.",
        })
    weak_projects = [p for p in project_analysis if p.get("strength") in ("weak", "minimal")]
    if weak_projects:
        recommendations.append({
            "priority": "medium", "category": "Projects",
            "issue": f"{len(weak_projects)} project description(s) lack detail.",
            "why": "Short descriptions without problem, technologies and outcome are less convincing.",
            "action": "For each project describe the problem, technologies used, what you implemented, and a real outcome.",
        })

    # --- Experience ---
    if not experience and "experience" not in sections and "internships" not in sections:
        recommendations.append({
            "priority": "medium", "category": "Experience",
            "issue": "No work experience or internship section detected.",
            "why": "Experience demonstrates real-world application of skills.",
            "action": "Add any internships, training or part-time work if you have them; otherwise emphasize projects.",
        })
    weak_experience = [e for e in analysis.get("experienceAnalysis", []) if e.get("strength") in ("weak", "minimal")]
    if weak_experience:
        recommendations.append({
            "priority": "medium", "category": "Experience",
            "issue": f"{len(weak_experience)} experience entr(y/ies) need stronger descriptions.",
            "why": "Action verbs and quantifiable results make experience entries stand out.",
            "action": "Rewrite each entry starting with action verbs and add real measurable achievements.",
        })

    # --- Education ---
    edu_analysis = analysis.get("educationAnalysis", {})
    if not edu_analysis.get("detected"):
        recommendations.append({
            "priority": "medium", "category": "Education",
            "issue": "Education details not detected.",
            "why": "Placement roles usually require your degree and institution.",
            "action": "Add degree, institution, graduation year and CGPA/percentage.",
        })
    elif edu_analysis.get("missing"):
        recommendations.append({
            "priority": "low", "category": "Education",
            "issue": "Some education fields are incomplete.",
            "why": "Incomplete education details may reduce parsing confidence.",
            "action": "Fill in the missing fields: " + ", ".join(edu_analysis["missing"][:4]) + ".",
        })

    # --- Summary ---
    if not parsed_data.get("summary"):
        recommendations.append({
            "priority": "medium", "category": "Summary",
            "issue": "No professional summary or objective detected.",
            "why": "A summary helps recruiters quickly understand your profile and target role.",
            "action": "Write 2-3 sentences covering your education, key skills and target role.",
        })

    # --- Contact ---
    for field, label in [("email", "email"), ("phone", "phone number"), ("linkedin", "LinkedIn profile")]:
        if not parsed_data.get(field):
            recommendations.append({
                "priority": "high" if field != "linkedin" else "medium", "category": "ATS",
                "issue": f"Missing {label}.",
                "why": "Recruiters cannot contact you without it.",
                "action": f"Add your {label} to the top of the resume.",
            })

    # --- ATS warnings ---
    if "formatting" in warning_types:
        recommendations.append({
            "priority": "low", "category": "Formatting",
            "issue": "Potential formatting issues detected.",
            "why": "Complex formatting may not parse correctly in ATS systems.",
            "action": "Use simple single-column layouts with standard headings.",
        })
    if "length" in warning_types:
        recommendations.append({
            "priority": "low", "category": "Formatting",
            "issue": "Resume length may be outside the ideal 1-2 page range.",
            "why": "Extremely long or short resumes are often skimmed or dropped.",
            "action": "Trim or expand content to 400-800 words.",
        })

    # --- Content quality ---
    quantified = any(True for p in analysis.get("projectAnalysis", []) if p.get("hasMetric")) or any(
        True for e in analysis.get("experienceAnalysis", []) if e.get("hasMetric")
    )
    if not quantified and (projects or experience):
        recommendations.append({
            "priority": "low", "category": "Career Development",
            "issue": "No quantifiable achievements detected.",
            "why": "Numbers make achievements concrete and credible.",
            "action": "Add real metrics (e.g. 'reduced load time by 30%') wherever you can honestly.",
        })

    if not recommendations:
        recommendations.append({
            "priority": "low", "category": "Career Development",
            "issue": "Your resume looks well structured.",
            "why": "Small, targeted improvements can still raise your match with specific roles.",
            "action": "Tailor the summary and skills for each job you apply to, using the job match panel.",
        })
