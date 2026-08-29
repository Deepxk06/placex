import { Card, CardHeader } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { ATSBreakdownBar, ATSWarning } from './SkillsPanel'

export default function ATSPanel({ analysis }) {
  const breakdown = analysis?.atsBreakdown || {}
  const warnings = analysis?.atsWarnings || []
  const overview = [
    { label: 'Keyword Relevance', value: breakdown.keywordRelevance },
    { label: 'Structure', value: breakdown.structure },
    { label: 'Section Completeness', value: breakdown.sectionCompleteness },
    { label: 'Formatting', value: breakdown.formatting },
    { label: 'Contact Information', value: breakdown.contactInformation },
    { label: 'Readability', value: breakdown.readability },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Estimated ATS Compatibility"
          subtitle="This is an estimate based on standard ATS parsing heuristics — not an exact reproduction of any commercial ATS."
        />
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-sky-500 text-2xl font-extrabold text-white shadow-glass">
            {analysis?.atsScore ?? 0}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-200">{Math.round((analysis?.atsScore ?? 0) / 10)}/10</span> — how likely an ATS can parse and easily surface your resume
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {overview.map((item) => (
            <ATSBreakdownBar key={item.label} label={item.label} value={item.value ?? 0} />
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="ATS Warnings" subtitle="Potential parsing issues found in your resume" />
        {warnings.length > 0 ? (
          <div className="space-y-2">
            {warnings.map((w, i) => (
              <ATSWarning key={i} warning={w} />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 size={16} />
            No significant ATS issues detected.
          </div>
        )}
        {warnings.length === 0 && (
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
            <AlertTriangle size={14} />
            Tip: keep single-column layouts and standard headings for best results.
          </div>
        )}
      </Card>
    </div>
  )
}

export { Badge }