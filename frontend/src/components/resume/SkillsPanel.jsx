import { Card, CardHeader } from '../ui/Card'
import { Progress } from '../ui/Progress'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/helpers'

const LEVEL_META = {
  strong: { label: 'Strong', tone: 'success' },
  mentioned: { label: 'Mentioned', tone: 'info' },
  weak: { label: 'Weak', tone: 'warning' },
}

const TONE_MAP = {
  success: 'bg-green-500',
  info: 'bg-sky-500',
  warning: 'bg-yellow-500',
}

export function SkillLevelBadge({ level }) {
  const meta = LEVEL_META[level] || LEVEL_META.weak
  return <Badge tone={meta.tone}>{meta.label}</Badge>
}

export default function SkillsPanel({ analysis, parsedData, jobMatch }) {
  const skillLevels = analysis?.skillLevels || {}
  const categories = skillLevels.categories || {}
  const matched = jobMatch?.matchedSkills || []
  const missing = jobMatch?.missingSkills || []
  const weak = jobMatch?.weakSkills || analysis?.skillLevels?.weak || []
  const hasJobMatch = Boolean(jobMatch)

  return (
    <div className="space-y-6">
      {hasJobMatch && (matched.length > 0 || missing.length > 0 || weak.length > 0) && (
        <Card>
          <CardHeader title="Skill Gap vs. Target Job" subtitle="Compared against the job description you provided" />
          <div className="grid gap-6 md:grid-cols-3">
            {matched.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                  Matched Skills ({matched.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {matched.map((s) => (
                    <Badge key={s} tone="success">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            {missing.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Missing Skills ({missing.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {missing.map((s) => (
                    <Badge key={s} tone="danger">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            {weak.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-400">
                  Weak / Underrepresented ({weak.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {weak.map((s) => (
                    <Badge key={s} tone="warning">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Skills by Level" subtitle="Skills you listed in your skills section are 'strong'; skills only mentioned elsewhere are 'weak'" />
        <div className="mb-5 flex flex-wrap gap-2">
          {(skillLevels.strong || []).map((s) => (
            <span key={s} className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
              {s}
            </span>
          ))}
          {(skillLevels.mentioned || []).map((s) => (
            <span key={s} className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold text-sky-700 dark:bg-sky-500/15 dark:text-sky-400">
              {s}
            </span>
          ))}
          {(skillLevels.weak || []).map((s) => (
            <span key={s} className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-[11px] font-semibold text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400">
              {s}
            </span>
          ))}
          {(!skillLevels.strong || skillLevels.strong.length === 0) && (
            <p className="text-sm text-gray-400">No skills detected yet.</p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(categories).map(([category, skills]) => (
            <div key={category} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{category}</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <Badge key={s} tone="neutral">{s}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export function ATSBreakdownBar({ label, value }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-300">{label}</span>
        <span className="font-semibold">{Math.round(value)}%</span>
      </div>
      <Progress
        value={value}
        color={cn(value >= 80 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-500' : 'bg-red-500')}
      />
    </div>
  )
}

export function ATSWarning({ warning }) {
  const tone = warning.severity === 'high' ? 'danger' : warning.severity === 'medium' ? 'warning' : 'info'
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
      <Badge tone={tone}>{warning.severity}</Badge>
      <p className="text-sm text-gray-600 dark:text-gray-300">{warning.message}</p>
    </div>
  )
}

export function toneOfLevel(level) {
  return TONE_MAP[level] || TONE_MAP.warning
}