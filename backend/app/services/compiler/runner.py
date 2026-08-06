"""Sandboxed subprocess execution for the PlaceX compiler module.

Design goals:

- No persistent interpreters: every submission gets a fresh temp workdir.
- Hard wall-clock timeout that kills the *entire process group*, so child
  processes spawned by user code cannot outlive the deadline.
- Compiled languages run a separate compile stage (C/C++/Java/Go/Rust/...).
- stdout/stderr are stream-capped so a chatty program cannot exhaust memory.
- Global concurrency semaphore protects the host from parallel storms.
"""

import asyncio
import os
import shlex
import shutil
import signal
import subprocess
import tempfile
import time
from pathlib import Path

from app.services.compiler.languages import command_for, get_language

# ---------------------------------------------------------------------------
# Guardrails
# ---------------------------------------------------------------------------
MAX_CODE_CHARS = 100_000
MAX_INPUT_CHARS = 100_000
MAX_OUTPUT_BYTES = 1_048_576  # 1 MiB per stream
MAX_CONCURRENT_RUNS = 3

_execution_semaphore = asyncio.Semaphore(MAX_CONCURRENT_RUNS)

STATUS_OK = "ok"
STATUS_COMPILE_ERROR = "compile_error"
STATUS_RUNTIME_ERROR = "runtime_error"
STATUS_TIMEOUT = "timeout"
STATUS_OUTPUT_LIMIT = "output_limit"
STATUS_MEMORY = "memory"
STATUS_UNSUPPORTED = "unsupported"
STATUS_INTERNAL = "internal_error"


class OutputLimitExceeded(Exception):
    pass


def _tool_present(cmd: str) -> bool:
    return shutil.which(cmd) is not None


def _shlex(template: str, spec, file: Path, binf: Path, workdir: Path) -> list[str]:
    """Build a command list from a template using names relative to workdir.

    Relative paths keep shlex.split() sane on both POSIX (backslash-free)
    and Windows (no backslash-mangling of absolute Windows paths).
    """
    cmd = (
        template.replace("{file}", file.name)
        .replace("{bin}", binf.name)
        .replace("{dir}", ".")
        .replace("{memory}", str(spec.memory_mb))
    )
    return shlex.split(cmd, posix=(os.name == "posix"))


def _kill_process_tree(proc) -> None:
    if os.name == "nt":
        try:
            subprocess.run(
                ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                capture_output=True,
                timeout=5,
            )
        except Exception:
            pass
    else:
        try:
            os.killpg(proc.pid, signal.SIGKILL)
        except (ProcessLookupError, PermissionError):
            pass
    try:
        proc.kill()
    except Exception:
        pass


def _limit_factory(memory_mb: int):
    """Return a preexec_fn that sets RLIMIT_AS for the child (POSIX only)."""

    def _apply() -> None:
        try:
            import resource

            limit = max(memory_mb, 64) * 1024 * 1024
            resource.setrlimit(resource.RLIMIT_AS, (limit, limit))
            resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
        except Exception:
            pass

    return _apply


async def _pump(stream, out: bytearray) -> None:
    """Copy one pipe into ``out``, raising if the cap is exceeded."""
    while True:
        chunk = await stream.read(64 * 1024)
        if not chunk:
            break
        if len(out) + len(chunk) > MAX_OUTPUT_BYTES:
            raise OutputLimitExceeded()
        out.extend(chunk)


async def _execute(
    cmd: list[str],
    stdin_data: bytes,
    timeout_s: float,
    memory_mb: int,
    workdir: str,
) -> dict:
    """Run one command, capture output, enforce timeout. Never raises for user code."""
    started = time.monotonic()

    kwargs = {
        "stdin": asyncio.subprocess.PIPE,
        "stdout": asyncio.subprocess.PIPE,
        "stderr": asyncio.subprocess.PIPE,
        "cwd": workdir,
    }
    if os.name == "nt":
        kwargs["creationflags"] = getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0)
        kwargs["start_new_session"] = False
    else:
        kwargs["start_new_session"] = True
        kwargs["preexec_fn"] = _limit_factory(memory_mb)

    try:
        proc = await asyncio.create_subprocess_exec(*cmd, **kwargs)
    except (FileNotFoundError, PermissionError):
        return {
            "status": STATUS_INTERNAL,
            "message": f"Runtime '{cmd[0]}' is not installed on this server",
            "exitCode": None,
            "runtimeMs": int((time.monotonic() - started) * 1000),
        }
    except Exception as exc:
        return {
            "status": STATUS_INTERNAL,
            "message": str(exc)[:200],
            "exitCode": None,
            "runtimeMs": int((time.monotonic() - started) * 1000),
        }

    stdout_buf = bytearray()
    stderr_buf = bytearray()
    status = STATUS_OK
    exit_code = None

    async def _write_input() -> None:
        try:
            if stdin_data:
                proc.stdin.write(stdin_data[:MAX_INPUT_CHARS])
                await proc.stdin.drain()
            proc.stdin.close()
        except Exception:
            pass

    tasks = [
        asyncio.create_task(_write_input()),
        asyncio.create_task(_pump(proc.stdout, stdout_buf)),
        asyncio.create_task(_pump(proc.stderr, stderr_buf)),
        asyncio.create_task(proc.wait()),
    ]

    try:
        await asyncio.wait_for(asyncio.gather(*tasks), timeout=timeout_s)
        exit_code = proc.returncode
        if exit_code != 0:
            status = STATUS_RUNTIME_ERROR
    except asyncio.TimeoutError:
        status = STATUS_TIMEOUT
    except OutputLimitExceeded:
        status = STATUS_OUTPUT_LIMIT
    finally:
        if proc.returncode is None:
            _kill_process_tree(proc)
        for t in tasks:
            t.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)

    return {
        "status": status,
        "message": "" if status == STATUS_OK else _status_message(status),
        "stdout": stdout_buf.decode("utf-8", "replace"),
        "stderr": stderr_buf.decode("utf-8", "replace"),
        "exitCode": exit_code,
        "runtimeMs": int((time.monotonic() - started) * 1000),
    }


def _status_message(status: str) -> str:
    return {
        STATUS_TIMEOUT: "Time limit exceeded",
        STATUS_OUTPUT_LIMIT: "Program produced too much output",
        STATUS_RUNTIME_ERROR: "Program exited with a non-zero exit code",
        STATUS_MEMORY: "Memory limit exceeded",
    }.get(status, status)


async def run_code(
    code: str,
    language: str,
    stdin: str = "",
    timeout_ms: int = 5000,
    memory_mb: int = 256,
) -> dict:
    """Execute ``code`` in ``language`` inside a throwaway workdir.

    Returns a dict with keys:
      status, message, stdout, stderr, exitCode, runtimeMs
    """
    async with _execution_semaphore:
        return await _run_code(code, language, stdin, timeout_ms, memory_mb)


async def _run_code(code: str, language: str, stdin: str, timeout_ms: int, memory_mb: int) -> dict:
    spec = get_language(language)
    if not spec:
        return {
            "status": STATUS_UNSUPPORTED,
            "message": f"Unsupported language: {language}",
            "stdout": "",
            "stderr": "",
            "exitCode": None,
            "runtimeMs": 0,
        }

    if not code or not code.strip():
        return {"status": STATUS_UNSUPPORTED, "message": "Code is empty", "stdout": "", "stderr": "", "exitCode": None, "runtimeMs": 0}
    if len(code) > MAX_CODE_CHARS:
        return {"status": STATUS_UNSUPPORTED, "message": f"Code exceeds the {MAX_CODE_CHARS} character limit", "stdout": "", "stderr": "", "exitCode": None, "runtimeMs": 0}

    run_probe = spec.run_cmd.split()[0] if spec.run_cmd else ""
    if run_probe and "{bin}" not in run_probe and not _tool_present(command_for(spec, run_probe)):
        return {
            "status": STATUS_INTERNAL,
            "message": f"Runtime '{run_probe}' is not installed on this server",
            "stdout": "",
            "stderr": "",
            "exitCode": None,
            "runtimeMs": 0,
        }

    stdin = (stdin or "")[:MAX_INPUT_CHARS]

    with tempfile.TemporaryDirectory(prefix="placex-run-") as workdir:
        workdir_p = Path(workdir)
        source = workdir_p / spec.file_name
        binf = workdir_p / "solution"
        source.write_text(code, encoding="utf-8")

        # ----- compile stage -----
        if spec.compile_cmd:
            compile_cmd = _shlex(command_for(spec, spec.compile_cmd), spec, source, binf, workdir_p)
            if not _tool_present(compile_cmd[0]):
                return {
                    "status": STATUS_INTERNAL,
                    "message": f"Compiler '{compile_cmd[0]}' is not installed on this server",
                    "stdout": "",
                    "stderr": "",
                    "exitCode": None,
                    "runtimeMs": 0,
                }
            res = await _execute(compile_cmd, b"", max(3.0, timeout_ms / 1000), max(memory_mb, 2048), workdir)
            if res["status"] == STATUS_TIMEOUT:
                return {"status": STATUS_TIMEOUT, "message": "Compilation timed out", "stdout": "", "stderr": "", "exitCode": None, "runtimeMs": res["runtimeMs"]}
            if res["status"] != STATUS_OK:
                return {
                    "status": STATUS_COMPILE_ERROR,
                    "message": "Compilation failed",
                    "stdout": res.get("stdout", ""),
                    "stderr": res.get("stderr", ""),
                    "exitCode": res.get("exitCode"),
                    "runtimeMs": res.get("runtimeMs", 0),
                }

        # ----- run stage -----
        run_cmd = _shlex(command_for(spec, spec.run_cmd), spec, source, binf, workdir_p)
        res = await _execute(run_cmd, stdin.encode("utf-8"), max(1.0, timeout_ms / 1000), memory_mb, workdir)
        return res