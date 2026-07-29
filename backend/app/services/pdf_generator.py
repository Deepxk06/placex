from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate
import io
from typing import List


async def generate_ats_pdf(sections: list) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=0.75*inch, rightMargin=0.75*inch,
                            topMargin=0.75*inch, bottomMargin=0.75*inch)
    styles = getSampleStyleSheet()
    story = []
    for section in sections:
        if isinstance(section, dict):
            name = section.get("name", "")
            data = section.get("data", {})
            if name == "summary":
                story.append(Paragraph(f"<b>SUMMARY</b>", styles["Heading2"]))
                if isinstance(data, dict):
                    story.append(Paragraph(data.get("text", ""), styles["Normal"]))
            elif name == "education":
                story.append(Paragraph("<b>EDUCATION</b>", styles["Heading2"]))
                entries = data if isinstance(data, list) else data.get("entries", [])
                for e in entries:
                    if isinstance(e, dict):
                        line = f"{e.get('degree', '')} - {e.get('institute', '')}"
                        story.append(Paragraph(line, styles["Normal"]))
            elif name == "experience":
                story.append(Paragraph("<b>EXPERIENCE</b>", styles["Heading2"]))
                entries = data if isinstance(data, list) else data.get("entries", [])
                for e in entries:
                    if isinstance(e, dict):
                        line = f"{e.get('company', '')} | {e.get('role', '')}"
                        story.append(Paragraph(line, styles["Normal"]))
                        if e.get("description"):
                            story.append(Paragraph(f"- {e['description']}", styles["Normal"]))
            elif name == "projects":
                story.append(Paragraph("<b>PROJECTS</b>", styles["Heading2"]))
                entries = data if isinstance(data, list) else data.get("entries", [])
                for p in entries:
                    if isinstance(p, dict):
                        story.append(Paragraph(f"{p.get('title', '')}", styles["Normal"]))
                        if p.get("description"):
                            story.append(Paragraph(f"- {p['description']}", styles["Normal"]))
            elif name == "skills":
                story.append(Paragraph("<b>SKILLS</b>", styles["Heading2"]))
                skills_list = data if isinstance(data, list) else data.get("items", [])
                story.append(Paragraph(", ".join(skills_list), styles["Normal"]))
            elif name == "certifications":
                story.append(Paragraph("<b>CERTIFICATIONS</b>", styles["Heading2"]))
                entries = data if isinstance(data, list) else data.get("entries", [])
                for c in entries:
                    if isinstance(c, dict):
                        story.append(Paragraph(f"{c.get('name', '')} - {c.get('issuer', '')}", styles["Normal"]))
            story.append(Paragraph("<br/>", styles["Normal"]))
    doc.build(story)
    buf.seek(0)
    return buf.getvalue()
