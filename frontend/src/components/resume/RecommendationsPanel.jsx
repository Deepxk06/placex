import { Card, CardHeader } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { AlertTriangle, Info, ArrowUpRight, Sparkles } from 'lucide-react'

const PRIORITY_META = {
  high: { label: 'High Priority', tone: 'danger', icon: AlertTriangle },
  medium: { label: 'Medium Priority', tone: 'warning', icon: ArrowUpRight },
  low: { label: 'Low Priority', tone: 'info', icon: Info },
}

export default function RecommendationsPanel({ analysis }) {
  const recommendations = analysis?.recommendations || []
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader title="Recommendations" subtitle="Improvement suggestions based on your analysis" />
        <p className="text-sm text-gray-400">Run the analysis first to see recommendations.</p>
      </Card>
    )
  }

  const groups = {
    high: recommendations.filter((r) => r.priority === 'high'),
    medium: recommendations.filter((r) => r.priority === 'medium'),
    low: recommendations.filter((r) => r.priority === 'low'),
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="AI Recommendations"
          subtitle="Prioritized, actionable improvements — grounded only in what was detected in your resume"
          action={
            recommendations.some((r) => r.source === 'ai') ? (
              <Badge tone="brand"><Sparkles size={11} /> AI enhanced</Badge>
            ) : null
          }
        />
        <div className="space-y-6">
          {['high', 'medium', 'low'].map((priority) => {
            const meta = PRIORITY_META[priority]
            const Icon = meta.icon
            const items = groups[priority]
            if (items.length === 0) return null
            return (
              <div key={priority}>
                <div className="mb-2 flex items-center gap-2">
                  <Badge tone={meta.tone}>
                    <Icon size={11} />
                    {meta.label}
                  </Badge>
                  <span className="text-xs text-gray-400">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((rec, i) => (
                    <div key={i} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{rec.issue}</span>
                        <Badge tone="neutral">{rec.category}</Badge>
                      </div>
                      {rec.why && <p className="text-xs text-gray-500 dark:text-gray-400">Why: {rec.why}</p>}
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">→ {rec.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}