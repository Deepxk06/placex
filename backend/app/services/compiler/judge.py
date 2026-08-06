"""Judge a coding problem submission against test cases using the runner."""

import time

from app.services.compiler.runner import (
    STATUS_COMPILE_ERROR,
    STATUS_INTERNAL,
    STATUS_MEMORY,
    STATUS_TIMEOUT,
    run_code,
)

MAX_VERDICT = "accepted"
GLOBAL_BUDGET_MS = 20_000


def normalize_output(text: str) -> str:
    """Canonical whitespace-insensitive compare (trailing newlines OK)."""
    return "\n".join(line.strip() for line in (text or "").splitlines()).strip()


def _verdict_for(res: dict, expected: str, sample: bool) -> dict:
    status = res.get("status")
    if status == STATUS_TIMEOUT:
        return {"passed": False, "error": "Time limit exceeded"}
    if status == STATUS_MEMORY:
        return {"passed": False, "error": "Memory limit exceeded"}
    if status == STATUS_COMPILE_ERROR:
        return {"passed": False, "error": "Compilation failed", "stderr": res.get("stderr", "")}
    if status == STATUS_INTERNAL:
        return {"passed": False, "error": res.get("message", "Internal runner error"), "stderr": res.get("stderr", "")}
    if status != "ok":
        return {"passed": False, "error": res.get("message", status)}

    got = normalize_output(res.get("stdout", ""))
    want = normalize_output(expected or "")
    passed = got == want
    return {"passed": passed}


async def judge_submission(problem: dict, code: str, language: str) -> dict:
    """Run every visible + hidden test case for ``problem`` and score the code.

    ``problem`` keys: testCases, hiddenTestCases, timeLimit (ms).
    Returns: {passedTestCases, totalTestCases, status, results, runtime}
    """
    test_cases = list(problem.get("testCases") or []) + list(problem.get("hiddenTestCases") or [])
    total = len(test_cases)
    passed = 0
    results = []
    first_error = ""
    runtime_ms = 0
    time_limit = int(problem.get("timeLimit") or 1000)
    budget = max(GLOBAL_BUDGET_MS, time_limit * len(test_cases))
    started = time.monotonic()

    for i, tc in enumerate(test_cases):
        if (time.monotonic() - started) * 1000 > budget:
            for rest in test_cases[i:]:
                results.append({"input": rest.get("input", ""), "expected": rest.get("expected", ""),
                                "got": "", "passed": False, "error": "Global time budget exceeded"})
            break

        res = await run_code(code, language, tc.get("input", ""), timeout_ms=time_limit)
        runtime_ms += res.get("runtimeMs", 0)
        verdict = _verdict_for(res, tc.get("expected", ""), sample=False)

        got = res.get("stdout", "") or ""
        if res.get("status") == STATUS_COMPILE_ERROR:
            got = res.get("stderr", "") or ""
            first_error = first_error or verdict.get("error", "Compilation failed")
        elif res.get("status") == STATUS_TIMEOUT:
            got = res.get("stderr", "") or ""
            first_error = first_error or verdict.get("error", "Time limit exceeded")
        elif not verdict["passed"]:
            first_error = first_error or verdict.get("error", "")

        if verdict["passed"]:
            passed += 1

        results.append({
            "input": tc.get("input", ""),
            "expected": tc.get("expected", ""),
            "got": got.strip(),
            "passed": verdict["passed"],
            "error": verdict.get("error", ""),
            "stderr": verdict.get("stderr", ""),
        })

    all_passed = total > 0 and passed == total
    status = MAX_VERDICT if all_passed else "wrong_answer"
    if first_error:
        status = "compile_error" if "Compilation failed" in first_error else (
            "time_limit_exceeded" if "Time limit" in first_error else status)

    return {
        "passedTestCases": passed,
        "totalTestCases": total,
        "status": status,
        "results": results,
        "runtime": runtime_ms,
        "error": first_error,
    }