import { Card, CardHeader } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { History, FileText, Target } from 'lucide-react'
import { formatDate } from '../../utils/helpers'

export default function HistoryPanel({ resumes = [], activeId, onSelect, onDelete }) {
  if (resumes.length === 0) {
    return (
      <Card>
        <CardHeader title="Analysis History" subtitle="Your previous resume analyses" />
        <p className="text-sm text-gray-400">Upload a resume to create your first analysis.</p>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title="Analysis History" subtitle="Previous versions and results — saved for your account" />
      <div className="space-y-3">
        {resumes.map((r) => {
          const active = r.id === activeId
          return (
            <div
              key={r.id}
              className={`flex flex-wrap items-center gap-3 rounded-xl border p-4 transition-colors ${
                active
                  ? 'border-primary-400 bg-primary-50/50 dark:border-primary-500/50 dark:bg-primary-500/10'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/40'
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400 dark:bg-gray-800">
                <FileText size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{r.originalFile || 'Resume'}</p>
                <p className="text-[11px] text-gray-400">{formatDate(r.createdAt)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {r.resumeScore != null && (
                  <Badge tone={r.resumeScore >= 75 ? 'success' : r.resumeScore >= 50 ? 'warning' : 'danger'}>
                    Resume {Math.round(r.resumeScore)}
                  </Badge>
                )}
                {r.atsScore != null && (
                  <Badge tone={r.atsScore >= 75 ? 'success' : r.atsScore >= 50 ? 'warning' : 'danger'}>
                    ATS {Math.round(r.atsScore)}
                  </Badge>
                )}
                {r.jdMatchScore != null && (
                  <Badge tone="brand">
                    <Target size={10} />
                    Match {Math.round(r.jdMatchScore)}
                  </Badge>
                )}
                <Button size="sm" variant={active ? 'primary' : 'secondary'} onClick={() => onSelect(r.id)}>
                  {active ? 'Viewing' : 'Open'}
                </Button>
                {onDelete && (
                  <Button size="sm" variant="ghost" onClick={() => onDelete(r.id)} aria-label={`Delete ${r.originalFile}`}>
                    Delete
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {resumes.length >= 20 && (
        <p className="mt-3 flex items-center gap-1 text-xs text-gray-400">
          <History size={12} />
          Showing latest 20 resumes
        </p>
      )}
    </Card>
  )
}