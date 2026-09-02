import { useState } from 'react'
import { Copy, Check, Clock, Cpu, ChevronRight } from 'lucide-react'

export default function TestcasePanel({ testCases, selectedTestCase, onSelectTestCase, runResult }) {
  const [copiedField, setCopiedField] = useState(null)

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  if (!testCases || testCases.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        No test cases available
      </div>
    )
  }

  const currentTC = testCases[selectedTestCase] || testCases[0]

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 overflow-x-auto flex-shrink-0">
        {testCases.map((tc, i) => {
          const result = runResult?.testResults?.[i]
          const passed = result?.passed
          return (
            <button
              key={i}
              onClick={() => onSelectTestCase(i)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                selectedTestCase === i
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {result && (
                <span className={`w-1.5 h-1.5 rounded-full ${passed ? 'bg-emerald-500' : 'bg-red-500'}`} />
              )}
              Case {i + 1}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Input</span>
              <button
                onClick={() => handleCopy(currentTC.input || '', 'input')}
                className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {copiedField === 'input' ? (
                  <Check size={10} className="text-emerald-500" />
                ) : (
                  <Copy size={10} className="text-gray-400" />
                )}
              </button>
            </div>
            <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded-lg font-mono text-gray-700 dark:text-gray-300 overflow-x-auto border border-gray-100 dark:border-gray-800">
              {currentTC.input || '(empty)'}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Expected Output</span>
              <button
                onClick={() => handleCopy(currentTC.expected || '', 'expected')}
                className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {copiedField === 'expected' ? (
                  <Check size={10} className="text-emerald-500" />
                ) : (
                  <Copy size={10} className="text-gray-400" />
                )}
              </button>
            </div>
            <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded-lg font-mono text-gray-700 dark:text-gray-300 overflow-x-auto border border-gray-100 dark:border-gray-800">
              {currentTC.expected || '(empty)'}
            </pre>
          </div>

          {runResult && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Your Output</span>
                {runResult.runtimeMs > 0 && (
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span className="flex items-center gap-0.5">
                      <Clock size={9} /> {runResult.runtimeMs}ms
                    </span>
                  </div>
                )}
              </div>
              <pre className={`text-xs p-3 rounded-lg font-mono overflow-x-auto border ${
                runResult.status === 'ok'
                  ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-300'
              }`}>
                {runResult.stdout || runResult.stderr || runResult.error || '(no output)'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
