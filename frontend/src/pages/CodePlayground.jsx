import { useEffect, useRef, useState } from 'react'
import { Play, RotateCcw, Terminal, Loader2, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react'
import api from '../services/api'

const STATUS_META = {
  ok: { label: 'Success', color: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 },
  compile_error: { label: 'Compilation Error', color: 'text-rose-600 dark:text-rose-400', icon: XCircle },
  runtime_error: { label: 'Runtime Error', color: 'text-rose-600 dark:text-rose-400', icon: XCircle },
  timeout: { label: 'Time Limit Exceeded', color: 'text-amber-600 dark:text-amber-400', icon: Clock },
  memory: { label: 'Memory Limit Exceeded', color: 'text-amber-600 dark:text-amber-400', icon: AlertTriangle },
  output_limit: { label: 'Output Limit Exceeded', color: 'text-amber-600 dark:text-amber-400', icon: AlertTriangle },
  internal_error: { label: 'Runtime Not Available', color: 'text-rose-600 dark:text-rose-400', icon: XCircle },
}

const DEFAULT_CODE = `import sys

def solve():
    data = sys.stdin.read().strip()
    if not data:
        return
    lines = data.splitlines()
    # write your solution here
    print(data)

if __name__ == "__main__":
    solve()`

export default function CodePlayground() {
  const [languages, setLanguages] = useState([])
  const [language, setLanguage] = useState('python')
  const [code, setCode] = useState(DEFAULT_CODE)
  const [stdin, setStdin] = useState('')
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const codeRef = useRef(null)
  const templatedLang = useRef('python')

  useEffect(() => {
    api
      .get('/compiler/languages')
      .then((r) => {
        const langs = Array.isArray(r.data) ? r.data : []
        setLanguages(langs)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!languages.length) return
    const current = languages.find((l) => l.key === language)
    if (!current) return
    if (templatedLang.current !== language) {
      setCode(renderTemplate(language))
      templatedLang.current = language
    }
  }, [language, languages])

  const run = async () => {
    if (!code.trim()) {
      setError('Write some code first')
      return
    }
    setError('')
    setRunning(true)
    setResult(null)
    try {
      const res = await api.post('/compiler/run', { language, code, stdin })
      setResult(res.data)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to run code. Try again.')
    } finally {
      setRunning(false)
    }
  }

  const reset = () => {
    setCode(renderTemplate(language))
    setStdin('')
    setResult(null)
    setError('')
  }

  const meta = result ? STATUS_META[result.status] || STATUS_META.internal_error : null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Terminal size={22} className="text-primary-600" /> Code Playground
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Run code in any supported language. Output is sandboxed with a hard time and memory limit.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="input-field !w-auto"
            aria-label="Language"
          >
            {languages.map((l) => (
              <option key={l.key} value={l.key}>{l.label}</option>
            ))}
          </select>
          <button onClick={reset} className="btn-secondary flex items-center gap-2" title="Reset to template">
            <RotateCcw size={15} /> Reset
          </button>
          <button onClick={run} disabled={running} className="btn-primary flex items-center gap-2">
            {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {running ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Code editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card !p-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-4 py-2.5">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Code</span>
              <span className="text-[10px] text-gray-400">{code.length.toLocaleString()} chars</span>
            </div>
            <textarea
              ref={codeRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-[420px] resize-none bg-transparent p-4 font-mono text-[13px] leading-relaxed text-gray-800 dark:text-gray-100 focus:outline-none"
            />
          </div>

          <div className="card">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Standard Input (stdin)</span>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Optional input passed to your program..."
              rows={4}
              className="input-field font-mono text-sm mt-2"
            />
          </div>
        </div>

        {/* Output panel */}
        <div className="space-y-4">
          <div className="card !p-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-4 py-2.5">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Output</span>
              {result && meta && (
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${meta.color}`}>
                  <meta.icon size={14} /> {meta.label}
                </span>
              )}
            </div>
            <pre className="h-[420px] overflow-auto bg-gray-950 p-4 font-mono text-[13px] leading-relaxed text-gray-100 whitespace-pre-wrap">
              {result ? (
                <>
                  {result.stdout || <span className="text-gray-600">(no output)</span>}
                  {result.stderr && (
                    <span className="block mt-3 text-amber-300">{result.stderr}</span>
                  )}
                </>
              ) : (
                <span className="text-gray-600">Run your code to see output here...</span>
              )}
            </pre>
          </div>

          {result && (
            <div className="card text-sm">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                <span>Exit code</span>
                <span className="font-mono font-semibold">{result.exitCode ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between mt-2 text-gray-600 dark:text-gray-300">
                <span>Runtime</span>
                <span className="font-mono font-semibold">{result.runtimeMs} ms</span>
              </div>
              <div className="flex items-center justify-between mt-2 text-gray-600 dark:text-gray-300">
                <span>Message</span>
                <span className="max-w-[60%] text-right text-xs">{result.message || '—'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function renderTemplate(lang) {
  const TEMPLATES = {
    python: `import sys

def solve():
    data = sys.stdin.read().strip()
    if not data:
        return
    lines = data.splitlines()
    # write your solution here
    print(data)

if __name__ == "__main__":
    solve()`,
    javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', (line) => lines.push(line.trim()));
rl.on('close', () => {
  // write your solution here
  console.log(lines.join(' '));
});`,
    typescript: `const lines: string[] = [];
// write your solution here
console.log(lines.join(' '));`,
    c: `#include <stdio.h>

int main() {
    // write your solution here
    printf("hello\\n");
    return 0;
}
`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // write your solution here
    cout << "hello" << endl;
    return 0;
}
`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // write your solution here
        System.out.println("hello");
    }
}
`,
    csharp: `using System;

class Program {
    static void Main() {
        // write your solution here
        Console.WriteLine("hello");
    }
}
`,
    go: `package main

import "fmt"

func main() {
    // write your solution here
    fmt.Println("hello")
}
`,
    rust: `fn main() {
    // write your solution here
    println!("hello");
}
`,
    ruby: `# write your solution here
puts "hello"
`,
    php: `<?php
// write your solution here
echo "hello\\n";
`,
    kotlin: `fun main() {
    // write your solution here
    println("hello")
}
`,
    swift: `print("hello")`,
    scala: `object Main {
  def main(args: Array[String]): Unit = {
    // write your solution here
    println("hello")
  }
}
`,
    perl: `use strict;
use warnings;
# write your solution here
print "hello\\n";
`,
    lua: `-- write your solution here
print("hello")
`,
    r: `# write your solution here
cat("hello\\n")
`,
    bash: `#!/usr/bin/env bash
# write your solution here
echo "hello"
`,
  }
  return TEMPLATES[lang] || DEFAULT_CODE
}
