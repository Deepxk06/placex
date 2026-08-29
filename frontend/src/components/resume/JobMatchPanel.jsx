import { useState } from 'react'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { ATSBreakdownBar } from './SkillsPanel'
import { Target, Loader2, Briefcase } from 'lucide-react'
import { getScoreColor } from '../../utils/helpers'
import api from '../../services/api'

export default function JobMatchPanel({ resumeId, analysis, onMatchResult }) {
  const [jdText, setJdText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [jobMatch, setJobMatch] = useState(analysis?.jobMatch || null)

  const runMatch = async () => {
    if (!jdText.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await api.post(`/resume/${resumeId}/job-match`, { jdText })
      const data = res.data
      setJobMatch(data.jobMatch)
      onMatchResult?.(data.jobMatch)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to analyze job match')
    } finally {
      setLoading(false)
    }
  }

  const exp = jobMatch?.explanation
  const jd = jobMatch?.jobDescription || {}

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Resume vs. Job Description"
          subtitle="Optional — paste the job description you are targeting"
        />
        <textarea
          className="input-field mb-3 min-h-[140px] w-full"
          placeholder="Paste the job description here..."
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          aria-label="Job description"
        />
        <div className="flex items-center gap-3">
          <Button onClick={runMatch} disabled={!jdText.trim() || loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Target size={16} />}
            {loading ? 'Analyzing...' : 'Analyze Job Match'}
          </Button>
          {jobMatch && (
            <Badge tone={jobMatch.score >= 75 ? 'success' : jobMatch.score >= 50 ? 'warning' : 'danger'}>
              Last match: {jobMatch.score}%
            </Badge>
          )}
        </div>
        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </Card>

      {jobMatch && (
        <>
          <Card>
            <CardHeader title="Job Match Score" subtitle="Why this score?" />
            <div className="mb-5 flex items-center gap-5">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-extrabold shadow-glass ${getScoreColor(jobMatch.score)}`}
              >
                {Math.round(jobMatch.score)}%
              </div>
              <div className="space-y-1 text-sm">
                {jd.title && (
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                    <Briefcase size={14} />
                    <span className="font-medium">{jd.title}</span>
                  </div>
                )}
                {(jobMatch.matchedSkills || []).length > 0 && (
                  <p className="text-green-600 dark:text-green-400">
                    Match: {jobMatch.matchedSkills.slice(0, 6).join(', ')}
                    {jobMatch.matchedSkills.length > 6 ? '…' : ''}
                  </p>
                )}
                {(jobMatch.missingSkills || []).length > 0 && (
                  <p className="text-red-600 dark:text-red-400">
                    Gap: {jobMatch.missingSkills.slice(0, 6).join(', ')}
                    {jobMatch.missingSkills.length > 6 ? '…' : ''}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {exp && (
                <>
                  <ATSBreakdownBar
                    label={`Required Skills (${exp.requiredSkills.matched.length}/${exp.requiredSkills.matched.length + exp.requiredSkills.missing.length} matched)`}
                    value={exp.requiredSkills.score}
                  />
                  <ATSBreakdownBar
                    label={`Preferred Skills (${exp.preferredSkills.matched.length}/${exp.preferredSkills.matched.length + exp.preferredSkills.missing.length} matched)`}
                    value={exp.preferredSkills.score}
                  />
                  <ATSBreakdownBar label="Semantic Similarity" value={exp.semanticSimilarity} />
                  <ATSBreakdownBar label="Project Relevance" value={exp.projectRelevance} />
                  <ATSBreakdownBar label="Experience Match" value={exp.experienceMatch} />
                  <ATSBreakdownBar label="Education Match" value={exp.educationMatch} />
                </>
              )}
            </div>
            {jobMatch.weights && (
              <p className="mt-4 text-[11px] text-gray-400">
                Weights — required {Math.round(jobMatch.weights.required_skills * 100)}% · preferred{' '}
                {Math.round(jobMatch.weights.preferred_skills * 100)}% · semantic{' '}
                {Math.round(jobMatch.weights.semantic_similarity * 100)}% · experience{' '}
                {Math.round(jobMatch.weights.experience_match * 100)}% · projects{' '}
                {Math.round(jobMatch.weights.project_relevance * 100)}% · education{' '}
                {Math.round(jobMatch.weights.education_match * 100)}%
              </p>
            )}
          </Card>

          {(jobMatch.weakSkills || []).length > 0 && (
            <Card>
              <CardHeader title="Weak / Underrepresented Skills" subtitle="Mentioned in your resume but not emphasized enough" />
              <div className="flex flex-wrap gap-2">
                {jobMatch.weakSkills.map((s) => (
                  <Badge key={s} tone="warning">{s}</Badge>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {!jobMatch && (
        <Card>
          <p className="text-sm text-gray-400">
            Add a job description to see matched skills, missing skills, semantic similarity and a weighted job match score.
          </p>
        </Card>
      )}
    </div>
  )
}