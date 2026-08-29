from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, HRFlowable
from reportlab.lib.styles import ParagraphStyle
import io

TEMPLATE_STYLES = {
    "classic": {"accent": HexColor("#1F2937"), "heading": "#1F2937", "name_size": 22, "body_size": 9.5},
    "modern": {"accent": HexColor("#1D4ED8"), "heading": "#1D4ED8", "name_size": 24, "body_size": 9.5},
    "minimal": {"accent": HexColor("#374151"), "heading": "#4B5563", "name_size": 20, "body_size": 9},
    "technical": {"accent": HexColor("#0F766E"), "heading": "#0F766E", "name_size": 22, "body_size": 9.5},
}


def _style(name, **kw):
    return ParagraphStyle(name, **kw)


def _basic_styles(theme: dict):
    accent = theme["accent"]
    return {
        "name": _style("name", fontName="Helvetica-Bold", fontSize=theme["name_size"], textColor=accent, alignment=TA_CENTER, spaceAfter=2),
        "role": _style("role", fontName="Helvetica", fontSize=11, textColor=HexColor("#374151"), alignment=TA_CENTER, spaceAfter=2),
        "contact": _style("contact", fontName="Helvetica", fontSize=8.5, textColor=HexColor("#4B5563"), alignment=TA_CENTER, spaceAfter=4),
        "heading": _style("heading", fontName="Helvetica-Bold", fontSize=10.5, textColor=accent, spaceBefore=7, spaceAfter=3, leading=13),
        "normal": _style("normal", fontName="Helvetica", fontSize=theme["body_size"], leading=13, textColor=HexColor("#111827")),
        "bullet": _style("bullet", fontName="Helvetica", fontSize=theme["body_size"], leading=12.5, leftIndent=10, textColor=HexColor("#111827")),
        "subtitle": _style("subtitle", fontName="Helvetica-Bold", fontSize=theme["body_size"], leading=12.5, textColor=HexColor("#111827")),
        "meta": _style("meta", fontName="Helvetica", fontSize=8, textColor=HexColor("#6B7280")),
    }


def _escape(text: str) -> str:
    if not text:
        return ""
    return str(text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


async def generate_ats_pdf(sections: list, template_id: str = "classic") -> bytes:
    theme = TEMPLATE_STYLES.get(template_id or "classic", TEMPLATE_STYLES["classic"])
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=0.7 * inch, rightMargin=0.7 * inch,
        topMargin=0.6 * inch, bottomMargin=0.6 * inch,
        title="Resume",
    )
    s = _basic_styles(theme)
    story = []
    data = {sec.get("name"): sec.get("data", {}) for sec in sections if isinstance(sec, dict)}

    personal = data.get("personalInfo", {})
    name = personal.get("fullName", "") or ""
    if name:
        story.append(Paragraph(_escape(name), s["name"]))
    role = personal.get("targetRole", "") or ""
    if role:
        story.append(Paragraph(_escape(role), s["role"]))
    contact_parts = [p for p in [
        personal.get("email", ""), personal.get("phone", ""), personal.get("location", ""),
        personal.get("linkedIn", ""), personal.get("github", ""), personal.get("portfolio", ""),
    ] if p]
    if contact_parts:
        story.append(Paragraph("&nbsp;|&nbsp;".join(_escape(p) for p in contact_parts), s["contact"]))
    story.append(HRFlowable(width="100%", thickness=1, color=theme["accent"], spaceBefore=2, spaceAfter=4))

    summary_text = data.get("summary", {}).get("text", "") or personal.get("summary", "")
    if summary_text:
        story.append(Paragraph("SUMMARY", s["heading"]))
        story.append(Paragraph(_escape(summary_text), s["normal"]))

    def add_entries(title, section_key):
        entries = []
        raw = data.get(section_key, {})
        if isinstance(raw, list):
            entries = raw
        else:
            entries = raw.get("entries", [])
        if not entries:
            return
        story.append(Paragraph(title, s["heading"]))
        for e in entries:
            if not isinstance(e, dict):
                continue
            if section_key == "education":
                first = " | ".join(x for x in [e.get("degree", ""), e.get("branch", "")] if x)
                if first:
                    story.append(Paragraph(_escape(first), s["subtitle"]))
                second = " | ".join(x for x in [e.get("institute", ""), e.get("location", "")] if x)
                meta = ", ".join(x for x in [e.get("year", ""), (f"CGPA: {e.get('gpa')}" if e.get("gpa") else "")] if x)
                if second:
                    story.append(Paragraph(_escape(second), s["normal"]))
                if meta:
                    story.append(Paragraph(_escape(meta), s["meta"]))
            elif section_key in ("experience", "internships"):
                head = e.get("role", "")
                if head:
                    story.append(Paragraph(_escape(head), s["subtitle"]))
                company_line = " | ".join(x for x in [e.get("company", ""), e.get("location", "")] if x)
                if company_line:
                    story.append(Paragraph(_escape(company_line), s["normal"]))
                if e.get("duration"):
                    story.append(Paragraph(_escape(e.get("duration", "")), s["meta"]))
                desc = e.get("description", "")
                if desc:
                    for line in [l.strip() for l in desc.split("\n") if l.strip()]:
                        story.append(Paragraph("&#8226;&nbsp;" + _escape(line), s["bullet"]))
                techs = e.get("technologies", [])
                if techs:
                    story.append(Paragraph(_escape("Technologies: " + ", ".join(techs)), s["meta"]))
            elif section_key == "projects":
                story.append(Paragraph(_escape(e.get("title", "")), s["subtitle"]))
                desc = e.get("description", "")
                if desc:
                    for line in [l.strip() for l in desc.split("\n") if l.strip()]:
                        story.append(Paragraph("&#8226;&nbsp;" + _escape(line), s["bullet"]))
                techs = e.get("techStack", [])
                link = e.get("link", "")
                meta_bits = [("," .join(techs)) if techs else ""]
                if link:
                    meta_bits.append(link)
                meta_line = " | ".join(b for b in meta_bits if b)
                if meta_line:
                    story.append(Paragraph(_escape(meta_line), s["meta"]))
            elif section_key == "certifications":
                line = " | ".join(x for x in [e.get("name", ""), e.get("issuer", ""), e.get("date", "")] if x)
                if line:
                    story.append(Paragraph("&#8226;&nbsp;" + _escape(line), s["bullet"]))
            else:
                line = " | ".join(str(v) for v in e.values() if v)
                if line:
                    story.append(Paragraph("&#8226;&nbsp;" + _escape(line), s["bullet"]))

    def add_flat_items(title, section_key):
        raw = data.get(section_key, {})
        items = raw.get("items", []) if isinstance(raw, dict) else raw
        if not items:
            return
        story.append(Paragraph(title, s["heading"]))
        if section_key == "skills":
            story.append(Paragraph(_escape(", ".join(items)), s["normal"]))
        else:
            for it in items:
                if isinstance(it, dict):
                    story.append(Paragraph("&#8226;&nbsp;" + _escape(it.get("text", "") or it.get("language", "")), s["bullet"]))
                else:
                    story.append(Paragraph("&#8226;&nbsp;" + _escape(it), s["bullet"]))

    add_flat_items("SKILLS", "skills")
    add_entries("PROJECTS", "projects")
    add_entries("EXPERIENCE", "experience")
    add_entries("INTERNSHIPS", "internships")
    add_entries("EDUCATION", "education")
    add_entries("CERTIFICATIONS", "certifications")
    add_flat_items("ACHIEVEMENTS", "achievements")
    add_flat_items("LANGUAGES", "languages")

    doc.build(story)
    buf.seek(0)
    return buf.getvalue()