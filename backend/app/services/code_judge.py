"""Backwards-compatible judge wrapper.

New submissions should use :func:`app.services.compiler.judge.judge_submission`.
This module keeps the old import path working for existing callers.
"""

from app.services.compiler.judge import judge_submission  # noqa: F401
from app.services.compiler.runner import run_code  # noqa: F401