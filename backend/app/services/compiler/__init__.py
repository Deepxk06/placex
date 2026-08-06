"""PlaceX Code Compiler module.

Run untrusted user code in a sandboxed subprocess with hard resource limits:

- One process per submission (no interpreters kept warm).
- Per-language compile + run stage.
- Hard wall-clock timeout that kills the entire process group.
- Output truncation so a chatty program cannot exhaust memory.
- Configurable memory cap (POSIX) and code-size limit.
- Global concurrency semaphore to avoid CPU/memory exhaustion.
"""
from app.services.compiler.languages import LANGUAGES, get_language, list_languages
from app.services.compiler.judge import judge_submission

__all__ = ["LANGUAGES", "get_language", "list_languages", "judge_submission"]