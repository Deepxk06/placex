import { CheckCircle2, XCircle, Clock, Cpu, AlertTriangle, Loader2 } from 'lucide-react'

const statusConfig = {
  accepted: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10', label: 'Accepted' },
  wrong_answer: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10', label: 'Wrong Answer' },
  compile_error: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10', label: 'Compilation Error' },
  time_limit_exceeded: { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/10', label: 'Time Limit Exceeded' },
  runtime_error: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10', label: 'Runtime Error' },
  error: { icon: AlertTriangle, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/10', label: 'Error' },
}

export default function SubmissionResult({ result }) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
        <p className="text-sm">Run or submit your code to see results</p>
        <p className="text-[10px] text-gray-300">Ctrl+Enter to run | Ctrl+Shift+Enter to submit</p>
      </div>
    )
  }

  if (result.status === 'loading') {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-primary-500" size={24} />
      </div>
    )
  }

  const config = statusConfig[result.status] || statusConfig.error
  const Icon = config.icon
  const isAccepted = result.status === 'accepted'

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      <div className={`flex items-center gap-3 p-3 rounded-lg ${config.bg}`}>
        <Icon size={20} className={config.color} />
        <div>
          <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
          {result.passedTestCases !== undefined && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {result.passedTestCases}/{result.totalTestCases} test cases passed
            </p>
          )}
        </div>
        {result.runtimeMs > 0 && (
          <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={12} /> {result.runtimeMs}ms
            </span>
          </div>
        )}
      </div>

      {result.results && result.results.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Test Case Results
          </h4>
          {result.results.map((r, i) => (
            <div
              key={i}
              className={`border rounded-lg overflow-hidden ${
                r.passed
                  ? 'border-emerald-200 dark:border-emerald-800/30'
                  : 'border-red-200 dark:border-red-800/30'
              }`}
            >
              <div className={`flex items-center gap-2 px-3 py-1.5 ${
                r.passed ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-red-50 dark:bg-red-900/10'
              }`}>
                {r.passed ? (
                  <CheckCircle2 size={12} className="text-emerald-500" />
                ) : (
                  <XCircle size={12} className="text-red-500" />
                )}
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Test Case {i + 1}
                </span>
                {r.error && (
                  <span className="text-[10px] text-red-500 ml-auto">{r.error}</span>
                )}
              </div>
              {!r.passed && (
                <div className="p-3 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase">Input</span>
                    <pre className="mt-0.5 bg-gray-50 dark:bg-gray-800 p-2 rounded font-mono text-gray-600 dark:text-gray-400 overflow-x-auto">
                      {r.input || '(empty)'}
                    </pre>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase">Expected</span>
                    <pre className="mt-0.5 bg-gray-50 dark:bg-gray-800 p-2 rounded font-mono text-gray-600 dark:text-gray-400 overflow-x-auto">
                      {r.expected || '(empty)'}
                    </pre>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase">Got</span>
                    <pre className="mt-0.5 bg-red-50 dark:bg-red-900/10 p-2 rounded font-mono text-red-600 dark:text-red-400 overflow-x-auto">
                      {r.got || '(no output)'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {result.error && !result.results && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
          <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap overflow-x-auto">
            {result.error}
          </pre>
        </div>
      )}
    </div>
  )
}
