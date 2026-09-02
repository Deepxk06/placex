import { useState } from 'react'
import {
  Lightbulb, ChevronDown, ChevronUp, Building2, Tag, Copy, Check,
  Code, Info, List, FileText
} from 'lucide-react'

export default function ProblemDescription({ problem, showHints, onToggleHints }) {
  const [copiedExample, setCopiedExample] = useState(null)
  const [expandedExamples, setExpandedExamples] = useState({})

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedExample(index)
    setTimeout(() => setCopiedExample(null), 2000)
  }

  const toggleExample = (index) => {
    setExpandedExamples(prev => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <div className="h-full overflow-auto p-5 space-y-6 bg-white dark:bg-gray-900">
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {problem.title}
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
            problem.difficulty === 'easy' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
            problem.difficulty === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}>
            {problem.difficulty}
          </span>
          {(problem.topics || []).map(t => (
            <span key={t} className="text-[11px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded capitalize">
              {t.replace(/-/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          {problem.description}
        </div>
      </div>

      {(problem.examples || []).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <FileText size={14} className="text-primary-500" />
            Examples
          </h3>
          {problem.examples.map((example, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
              <div
                className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/50 cursor-pointer"
                onClick={() => toggleExample(i)}
              >
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Example {i + 1}
                </span>
                {expandedExamples[i] !== false && (
                  <ChevronUp size={14} className="text-gray-400" />
                )}
              </div>
              {expandedExamples[i] !== false && (
                <div className="p-3 space-y-2">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Input</span>
                    <div className="mt-1 relative group">
                      <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded font-mono text-gray-700 dark:text-gray-300 overflow-x-auto">
                        {example.input}
                      </pre>
                      <button
                        onClick={() => handleCopy(example.input, `input-${i}`)}
                        className="absolute top-1 right-1 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                      >
                        {copiedExample === `input-${i}` ? (
                          <Check size={10} className="text-emerald-500" />
                        ) : (
                          <Copy size={10} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Output</span>
                    <div className="mt-1 relative group">
                      <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded font-mono text-gray-700 dark:text-gray-300 overflow-x-auto">
                        {example.output}
                      </pre>
                      <button
                        onClick={() => handleCopy(example.output, `output-${i}`)}
                        className="absolute top-1 right-1 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                      >
                        {copiedExample === `output-${i}` ? (
                          <Check size={10} className="text-emerald-500" />
                        ) : (
                          <Copy size={10} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  {example.explanation && (
                    <div>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Explanation</span>
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{example.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {problem.constraints && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-2">
            <Info size={14} className="text-primary-500" />
            Constraints
          </h3>
          <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg font-mono whitespace-pre-wrap">
            {problem.constraints}
          </div>
        </div>
      )}

      {(problem.companies || []).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-2">
            <Building2 size={14} className="text-primary-500" />
            Asked at
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {problem.companies.map(c => (
              <span key={c} className="text-[11px] px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {(problem.hints || []).length > 0 && (
        <div>
          <button
            onClick={onToggleHints}
            className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-primary-600 transition-colors"
          >
            <Lightbulb size={14} className="text-amber-500" />
            Hints
            {showHints ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showHints && (
            <div className="mt-2 space-y-2">
              {problem.hints.map((hint, i) => (
                <div key={i} className="text-xs text-gray-600 dark:text-gray-400 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 p-3 rounded-lg">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Hint {i + 1}:</span>{' '}
                  {hint}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {problem.timeLimit && (
        <div className="text-[11px] text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-3">
          Time Limit: {problem.timeLimit}ms &nbsp;|&nbsp; Memory Limit: {problem.memoryLimit || 256}MB
        </div>
      )}
    </div>
  )
}
