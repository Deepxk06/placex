import { Card, CardHeader } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { FolderGit2, Lightbulb } from 'lucide-react'

const CHECK_LABELS = [
  { key: 'hasAction', label: 'Action verbs' },
  { key: 'hasTechnology', label: 'Technologies' },
  { key: 'hasProblem', label: 'Problem stated' },
  { key: 'hasResult', label: 'Outcome' },
  { key: 'hasMetric', label: 'Metrics' },
]

const STRENGTH_TONE = {
  strong: 'success',
  moderate: 'info',
  weak: 'warning',
  minimal: 'danger',
}

export default function ProjectsPanel({ analysis, parsedData }) {
  const projectAnalysis = analysis?.projectAnalysis || []
  const educationAnalysis = analysis?.educationAnalysis || {}
  const experienceAnalysis = analysis?.experienceAnalysis || []
  const projects = parsedData?.projects || []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Project Analysis"
          subtitle="Projects are the strongest evidence of practical skills for students"
        />
        {projectAnalysis.length === 0 ? (
          <p className="text-sm text-gray-400">
            No projects detected in your resume. Add any academic or personal projects you have built.
          </p>
        ) : (
          <div className="space-y-4">
            {projectAnalysis.map((p) => {
              const project = projects.find((x) => x.title === p.title) || {}
              return (
                <div key={p.title} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FolderGit2 size={16} className="text-primary-500" />
                      <span className="font-semibold">{p.title || '(untitled)'}</span>
                    </div>
                    <Badge tone={STRENGTH_TONE[p.strength] || 'neutral'}>{p.strength}</Badge>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {CHECK_LABELS.map(({ key, label }) => (
                      <Badge key={key} tone={p[key] ? 'success' : 'neutral'}>
                        {p[key] ? '✓ ' : '○ '}
                        {label}
                      </Badge>
                    ))}
                  </div>
                  {(project.techStack || []).length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {project.techStack.map((t) => (
                        <Badge key={t} tone="brand">{t}</Badge>
                      ))}
                    </div>
                  )}
                  <p className="flex items-start gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                    <Lightbulb size={14} className="mt-0.5 shrink-0 text-yellow-500" />
                    {p.recommendation}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {experienceAnalysis.length > 0 && (
        <Card>
          <CardHeader title="Experience Analysis" subtitle="How well each role is documented" />
          <div className="space-y-3">
            {experienceAnalysis.map((e, i) => (
              <div key={`${e.role}-${i}`} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold">{e.role || 'Role'}</span>
                    {e.company && <span className="text-sm text-gray-400"> — {e.company}</span>}
                  </div>
                  <Badge tone={STRENGTH_TONE[e.strength] || 'neutral'}>{e.strength}</Badge>
                </div>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {[
                    { key: 'hasAction', label: 'Action verbs' },
                    { key: 'hasTechnology', label: 'Technologies' },
                    { key: 'hasResult', label: 'Outcome' },
                    { key: 'hasMetric', label: 'Metrics' },
                  ].map(({ key, label }) => (
                    <Badge key={key} tone={e[key] ? 'success' : 'neutral'}>
                      {e[key] ? '✓ ' : '○ '}
                      {label}
                    </Badge>
                  ))}
                </div>
                <p className="flex items-start gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                  <Lightbulb size={14} className="mt-0.5 shrink-0 text-yellow-500" />
                  {e.recommendation}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Education Analysis"
          subtitle={educationAnalysis.detected ? `Completeness: ${educationAnalysis.completeness ?? 0}%` : 'No education section detected'}
        />
        {!educationAnalysis.detected ? (
          <p className="text-sm text-gray-400">Add your degree, institution and graduation year.</p>
        ) : (
          <div className="space-y-3">
            {(educationAnalysis.entries || []).map((e, i) => (
              <div key={i} className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{e.degree || 'Degree'}</span>
                  <span className="text-sm text-gray-400">{e.institute}{e.year ? ` · ${e.year}` : ''}</span>
                </div>
                {e.gpa && <p className="text-xs text-gray-400">CGPA/GPA: {e.gpa}</p>}
                {e.missing && e.missing.length > 0 && (
                  <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                    Missing: {e.missing.join(', ')}
                  </p>
                )}
              </div>
            ))}
            {educationAnalysis.missing && educationAnalysis.missing.length > 0 && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Add: {educationAnalysis.missing.join(', ')}
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}