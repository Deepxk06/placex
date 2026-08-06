"""Supported languages for the PlaceX compiler module."""

from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class LanguageSpec:
    key: str
    label: str
    file_name: str
    compile_cmd: Optional[str] = None
    run_cmd: str = ""
    timeout_ms: int = 6000
    memory_mb: int = 256
    template: str = ""


LANGUAGES: dict[str, LanguageSpec] = {
    "python": LanguageSpec(
        key="python",
        label="Python 3",
        file_name="solution.py",
        run_cmd="python3 {file}",
        timeout_ms=6000,
        memory_mb=512,
        template='import sys\n\ndef solve():\n    data = sys.stdin.read().strip()\n    if not data:\n        return\n    lines = data.splitlines()\n    # write your solution here\n    print(data)\n\nif __name__ == "__main__":\n    solve()\n',
    ),
    "javascript": LanguageSpec(
        key="javascript",
        label="JavaScript (Node.js)",
        file_name="solution.js",
        run_cmd="node {file}",
        timeout_ms=6000,
        memory_mb=512,
        template="const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nconst lines = [];\nrl.on('line', (line) => lines.push(line.trim()));\nrl.on('close', () => {\n  // write your solution here\n  console.log(lines.join(' '));\n});\n",
    ),
    "typescript": LanguageSpec(
        key="typescript",
        label="TypeScript",
        file_name="solution.ts",
        compile_cmd="tsc {file} --outDir {dir} --module commonjs --target es2020 --skipLibCheck",
        run_cmd="node {dir}/solution.js",
        timeout_ms=9000,
        memory_mb=512,
        template="const lines: string[] = [];\n// write your solution here\nconsole.log(lines.join(' '));\n",
    ),
    "c": LanguageSpec(
        key="c",
        label="C (GCC)",
        file_name="solution.c",
        compile_cmd="gcc -O2 -std=c11 -o {bin} {file}",
        run_cmd="{bin}",
        timeout_ms=6000,
        memory_mb=256,
        template='#include <stdio.h>\n\nint main() {\n    // write your solution here\n    printf("hello\\n");\n    return 0;\n}\n',
    ),
    "cpp": LanguageSpec(
        key="cpp",
        label="C++ (G++)",
        file_name="solution.cpp",
        compile_cmd="g++ -O2 -std=c++17 -o {bin} {file} -pthread",
        run_cmd="{bin}",
        timeout_ms=6000,
        memory_mb=256,
        template='#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    // write your solution here\n    cout << "hello" << endl;\n    return 0;\n}\n',
    ),
    "java": LanguageSpec(
        key="java",
        label="Java",
        file_name="Main.java",
        compile_cmd="javac {file}",
        run_cmd="java -Xmx{memory}m -cp {dir} Main",
        timeout_ms=7000,
        memory_mb=512,
        template='import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // write your solution here\n        System.out.println("hello");\n    }\n}\n',
    ),
    "csharp": LanguageSpec(
        key="csharp",
        label="C# (Mono)",
        file_name="solution.cs",
        compile_cmd="mcs -out:{bin}.exe {file}",
        run_cmd="mono {bin}.exe",
        timeout_ms=12000,
        memory_mb=512,
        template='using System;\n\nclass Program {\n    static void Main() {\n        // write your solution here\n        Console.WriteLine("hello");\n    }\n}\n',
    ),
    "go": LanguageSpec(
        key="go",
        label="Go",
        file_name="main.go",
        compile_cmd="go build -o {bin} {file}",
        run_cmd="{bin}",
        timeout_ms=10000,
        memory_mb=256,
        template='package main\n\nimport "fmt"\n\nfunc main() {\n\t// write your solution here\n\tfmt.Println("hello")\n}\n',
    ),
    "rust": LanguageSpec(
        key="rust",
        label="Rust",
        file_name="main.rs",
        compile_cmd="rustc -O -o {bin} {file}",
        run_cmd="{bin}",
        timeout_ms=15000,
        memory_mb=256,
        template='fn main() {\n    // write your solution here\n    println!("hello");\n}\n',
    ),
    "ruby": LanguageSpec(
        key="ruby",
        label="Ruby",
        file_name="solution.rb",
        run_cmd="ruby {file}",
        timeout_ms=6000,
        memory_mb=256,
        template='# write your solution here\nputs "hello"\n',
    ),
    "php": LanguageSpec(
        key="php",
        label="PHP",
        file_name="solution.php",
        run_cmd="php {file}",
        timeout_ms=6000,
        memory_mb=256,
        template='<?php\n// write your solution here\necho "hello\\n";\n',
    ),
    "kotlin": LanguageSpec(
        key="kotlin",
        label="Kotlin",
        file_name="Main.kt",
        compile_cmd="kotlinc {file} -include-runtime -d {bin}.jar",
        run_cmd="java -Xmx{memory}m -jar {bin}.jar",
        timeout_ms=15000,
        memory_mb=512,
        template='fun main() {\n    // write your solution here\n    println("hello")\n}\n',
    ),
    "swift": LanguageSpec(
        key="swift",
        label="Swift",
        file_name="main.swift",
        run_cmd="swift {file}",
        timeout_ms=12000,
        memory_mb=256,
        template='print("hello")',
    ),
    "scala": LanguageSpec(
        key="scala",
        label="Scala",
        file_name="Main.scala",
        compile_cmd="scalac -d {dir} {file}",
        run_cmd="scala -cp {dir} Main",
        timeout_ms=15000,
        memory_mb=512,
        template='object Main {\n  def main(args: Array[String]): Unit = {\n    // write your solution here\n    println("hello")\n  }\n}\n',
    ),
    "perl": LanguageSpec(
        key="perl",
        label="Perl",
        file_name="solution.pl",
        run_cmd="perl {file}",
        timeout_ms=6000,
        memory_mb=256,
        template='use strict;\nuse warnings;\n# write your solution here\nprint "hello\\n";\n',
    ),
    "lua": LanguageSpec(
        key="lua",
        label="Lua",
        file_name="solution.lua",
        run_cmd="lua {file}",
        timeout_ms=6000,
        memory_mb=256,
        template='-- write your solution here\nprint("hello")\n',
    ),
    "r": LanguageSpec(
        key="r",
        label="R",
        file_name="solution.R",
        run_cmd="Rscript {file}",
        timeout_ms=10000,
        memory_mb=256,
        template='# write your solution here\ncat("hello\\n")\n',
    ),
    "bash": LanguageSpec(
        key="bash",
        label="Bash",
        file_name="solution.sh",
        run_cmd="bash {file}",
        timeout_ms=6000,
        memory_mb=256,
        template='#!/usr/bin/env bash\n# write your solution here\necho "hello"\n',
    ),
}


def get_language(key: str) -> LanguageSpec | None:
    return LANGUAGES.get(key)


def list_languages() -> list[dict]:
    return [{"key": spec.key, "label": spec.label} for spec in LANGUAGES.values()]


def command_for(spec: LanguageSpec, template: str) -> str:
    """Return an OS-aware command template for a language.

    The Microsoft Store Windows "python3" stub is a trap — swap it for the
    real interpreter when we are on Windows. Linux/production uses python3.
    """
    if template and template.startswith("python3 ") and _is_windows():
        return "python " + template[len("python3 "):]
    return template


def _is_windows() -> bool:
    import os

    return os.name == "nt"