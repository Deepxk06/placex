import subprocess
import tempfile
import os
import sys
import asyncio

SUPPORTED_LANGUAGES = {
    "python": {"file": "solution.py", "cmd": [sys.executable, "solution.py"]},
    "javascript": {"file": "solution.js", "cmd": ["node", "solution.js"]},
}


async def judge_submission(problem: dict, code: str, language: str) -> dict:
    if language not in SUPPORTED_LANGUAGES:
        return {"status": "error", "message": f"Unsupported language: {language}"}

    test_cases = problem.get("testCases", []) + problem.get("hiddenTestCases", [])
    passed = 0
    results = []

    for tc in test_cases:
        output = await run_code(code, language, tc.get("input", ""), problem.get("timeLimit", 1000))
        expected = tc.get("expected", "").strip()
        is_pass = output.strip() == expected
        if is_pass:
            passed += 1
        results.append({
            "input": tc.get("input", ""),
            "expected": expected,
            "got": output.strip(),
            "passed": is_pass,
        })

    all_passed = passed == len(test_cases)
    return {
        "passedTestCases": passed,
        "totalTestCases": len(test_cases),
        "status": "accepted" if all_passed else "wrong_answer",
        "results": results,
        "runtime": 0,
    }


async def run_code(code: str, language: str, stdin_input: str, time_limit: int) -> str:
    config = SUPPORTED_LANGUAGES[language]
    with tempfile.TemporaryDirectory() as tmpdir:
        filepath = os.path.join(tmpdir, config["file"])
        with open(filepath, "w") as f:
            f.write(code)

        try:
            proc = await asyncio.create_subprocess_exec(
                *config["cmd"],
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=tmpdir,
            )
            try:
                stdout, stderr = await asyncio.wait_for(
                    proc.communicate(input=stdin_input.encode()),
                    timeout=max(1, time_limit // 1000 + 2),
                )
                if stderr:
                    return stderr.decode().strip()
                return stdout.decode().strip()
            except asyncio.TimeoutError:
                proc.kill()
                await proc.wait()
                return "TIME_LIMIT_EXCEEDED"
        except FileNotFoundError:
            return f"Error: {language} runtime not available on this system"
        except Exception as e:
            return f"Error: {str(e)[:100]}"
