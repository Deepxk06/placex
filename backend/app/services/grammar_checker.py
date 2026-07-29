from app.schemas.resume import ATSResult


async def check_grammar(text: str) -> dict:
    try:
        import language_tool_python
        tool = language_tool_python.LanguageTool('en-US')
        matches = tool.check(text)
        errors = [
            {
                "message": m.message,
                "context": text[max(0, m.offset-20):m.offset+len(m.errorLength)+20],
                "suggestions": m.replacements[:3],
                "category": m.category,
            }
            for m in matches[:20]
        ]
        score = max(0, 100 - len(errors) * 5)
        return {"score": score, "errors": errors, "errorCount": len(errors)}
    except ImportError:
        return await check_grammar_basic(text)
    except Exception as e:
        return {"score": 50, "errors": [], "errorCount": 0, "note": f"Grammar check unavailable: {str(e)}"}


async def check_grammar_basic(text: str) -> dict:
    errors = []
    sentences = text.replace("!", ".").replace("?", ".").split(".")
    for s in sentences:
        s = s.strip()
        if not s:
            continue
        if s[0].islower():
            errors.append({"message": "Sentence should start with capital letter", "context": s[:50]})
    common_errors = {
        "its": "it's",
        "your": "you're",
        "their": "there",
        "affect": "effect",
    }
    words = text.lower().split()
    for wrong, correct in common_errors.items():
        if wrong in words:
            errors.append({"message": f"Possible typo: '{wrong}' should be '{correct}'"})
    score = max(0, 100 - len(errors) * 10)
    return {"score": score, "errors": errors[:10], "errorCount": len(errors[:10])}
