import { CheckCircle2, XCircle, Clock, X } from 'lucide-react'

const statusColors = {
  accepted: 'text-emerald-500',
  wrong_answer: 'text-red-500',
  compile_error: 'text-amber-500',
  time_limit_exceeded: 'text-orange-500',
  runtime_error: 'text-red-500',
}

export default function SubmissionHistory({ submissions, onClose, isOverlay }) {
  if (isOverlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Submission History</h3>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <X size={16} className="text-gray-400" />
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <SubmissionList submissions={submissions} />
          </div>
        </div>
      </div>
    )
  }

  return <SubmissionList submissions={submissions} />
}

function SubmissionList({ submissions }) {
  if (!submissions || submissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm p-8">
        No submissions yet
      </div>
    )
  }

  return (
    <div className="p-4 space-y-2">
      {submissions.map((sub) => {
        const isAccepted = sub.status === 'accepted'
        return (
          <div
            key={sub.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              isAccepted
                ? 'border-emerald-200 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-900/5'
                : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30'
            }`}
          >
            {isAccepted ? (
              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
            ) : (
              <XCircle size={16} className="text-red-500 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold capitalize ${statusColors[sub.status] || 'text-gray-500'}`}>
                  {sub.status?.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-gray-400 uppercase">{sub.language}</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {sub.passedTestCases}/{sub.totalTestCases} passed
                {sub.runtimeMs > 0 && ` • ${sub.runtimeMs}ms`}
              </p>
            </div>
            <span className="text-[10px] text-gray-400 flex-shrink-0">
              {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}
