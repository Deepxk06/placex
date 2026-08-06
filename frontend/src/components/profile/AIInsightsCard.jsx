import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, FileText, Link2, Award } from 'lucide-react'
import SectionCard from './SectionCard'
import { Progress } from '../ui/Progress'
import { Button } from '../ui/Button'
import { useProfileStore } from '../../store/profileStore'
import api from '../../services/api'
import { cn } from '../../utils/helpers'

const ROLE_SKILLS = {
  'Data Scientist': ['python', 'sql', 'machine learning', 'statistics', 'pandas', 'deep learning'],
  'Software Engineer': ['python', 'java', 'sql', 'data structures', 'react', 'node.js', 'git', 'aws'],
  'ML Engineer': ['python', 'machine learning', 'deep learning', 'tensorflow', 'sql', 'aws'],
  'Full Stack Developer': ['react', 'node.js', 'git', 'sql', 'javascript', 'html'],
  'DevOps Engineer': ['aws', 'docker', 'linux', 'git', 'ci/cd', 'kubernetes'],
  'Cloud Engineer': ['aws', 'azure', 'gcp', 'linux', 'networking'],
}

const REC_CERTS = {
  'Data Scientist': ['AWS Machine Learning', 'TensorFlow Developer', 'Google Data Analytics'],
  'Software Engineer': ['AWS Solutions Architect', 'Oracle Java (OCA)', 'GitHub Certified'],
  'ML Engineer': ['AWS Machine Learning', 'TensorFlow Developer', 'Azure AI Engineer'],
  'Full Stack Developer': ['AWS Cloud Practitioner', 'MongoDB Developer', 'React (Meta)'],
  'DevOps Engineer': ['CKA Kubernetes', 'AWS DevOps', 'HashiCorp Terraform'],
  'Cloud Engineer': ['AWS Solutions Architect', 'Azure Fundamentals', 'Google Cloud Engineer'],
}

function scoreTone(v) {
  if (v >= 80) return 'bg-emerald-500'
  if (v >= 50) return 'bg-amber-500'
  return 'bg-rose-500'
}

export default function AIInsightsCard() {  const { profile, hasResume, ext } = useProfileStore()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    api.get('/dashboard/student')
      .then((res) => mounted && setDashboard(res.data || null))
      .catch(() => mounted && setDashboard(null))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  const insights = useMemo(() => {
    if (!profile || !ext) return null
    const skills = ext.skills.map((s) => s.name.toLowerCase())
    const skillText = skills.join(' ') + ' ' + ext.projects.map((p) => p.description).join(' ').toLowerCase()

    let role = dashboard?.recommendation?.role || dashboard?.recommended || 'Software Engineer'
    if (!ROLE_SKILLS[role]) role = 'Software Engineer'
    const keywords = ROLE_SKILLS[role]

    const matched = keywords.filter((k) => skillText.includes(k.split(' ')[0]))
    const skillMatch = Math.round((matched.length / keywords.length) * 100)
    const missingSkills = keywords.filter((k) => !skillText.includes(k.split(' ')[0])).slice(0, 3)

    const completion = profile.completionPct || 0
    const profileScore = Math.min(100, Math.round(completion * 0.55 + Math.min(ext.skills.length, 10) * 4.5))

    const resumeScoreRaw = dashboard?.resumeScore
    const resumeScore = typeof resumeScoreRaw === 'number' ? resumeScoreRaw : Math.min(100, Math.round(profileScore * 0.7 + 10))

    const atsKeywords = ['project management', 'problem solving', 'teamwork', 'communication', 'leadership']
      .filter((k) => !skillText.includes(k))
      .slice(0, 3)

    const suggestions = []
    if (!hasResume) suggestions.push({ icon: FileText, text: 'Upload a resume to unlock ATS analysis', cta: 'Upload' })
    if (!ext.socialLinks.linkedin) suggestions.push({ icon: Link2, text: 'Add your LinkedIn to boost recruiter visibility', cta: 'Add' })
    if (missingSkills.length > 0) suggestions.push({ icon: Sparkles, text: `Learn ${missingSkills[0]} to match "${role}" roles`, cta: 'View roadmap' })

    return { skillMatch, missingSkills, profileScore, resumeScore, role, atsKeywords, suggestions, recommendedCerts: REC_CERTS[role] || [] }
  }, [profile, ext, dashboard, hasResume])

  if (!insights) return null

  const { skillMatch, missingSkills, profileScore, resumeScore, role, atsKeywords, suggestions, recommendedCerts } = insights

  return (
    <SectionCard
      id="sec-ai"
      icon={Sparkles}
      title="AI Insights"
      subtitle="AI-powered profile analysis"
      delay={0.05}
      className="overflow-hidden border border-primary-200/60 dark:border-primary-500/20"
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-500/10 blur-2xl" />

      {/* Recommended role */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-sky-500 p-4 text-white shadow-glass">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Recommended role</p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className="text-lg font-extrabold leading-tight">{role}</p>
          <p className="text-xs font-bold opacity-90">{skillMatch}% match</p>
        </div>
      </div>

      {/* Scores */}
      <div className="mt-4 space-y-3">
        <ScoreRow label="Resume score" value={resumeScore} loading={loading} />
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-600 dark:text-gray-300">Skill match</span>
          <span className="font-bold text-primary-600">{skillMatch}%</span>
        </div>
        <Progress value={skillMatch} color={scoreTone(skillMatch)} className="mt-1 h-1.5" />
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-600 dark:text-gray-300">Profile score</span>
          <span className="font-bold text-primary-600">{profileScore}%</span>
        </div>
        <Progress value={profileScore} color={scoreTone(profileScore)} className="mt-1 h-1.5" />
      </div>

      {/* Missing skills */}
      {missingSkills.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-bold text-gray-700 dark:text-gray-200">Missing skills for "{role}"</p>
          <div className="flex flex-wrap gap-1.5">
            {missingSkills.map((s) => (
              <span key={s} className="rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                + {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ATS keywords */}
      {atsKeywords.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">Missing ATS keywords</p>
          <div className="flex flex-wrap gap-1.5">
            {atsKeywords.map((k) => (
              <span key={k} className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">{k}</span>
            ))}
          </div>
        </div>
      )}

      {/* Recommended certs */}
      <div className="mt-3">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">Recommended certifications</p>
        <div className="flex flex-wrap gap-1.5">
          {recommendedCerts.map((c) => (
            <span key={c} className="rounded-lg border border-primary-200 px-2.5 py-1 text-[11px] font-medium text-primary-700 dark:border-primary-500/30 dark:text-primary-400">🎓 {c}</span>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 dark:border-gray-800">
          {suggestions.map((s) => (
            <div key={s.text} className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-300">
              <s.icon size={15} className="shrink-0 text-primary-500" />
              <span className="flex-1">{s.text}</span>
              <button className="rounded-lg bg-primary-600/10 px-2 py-1 text-[11px] font-bold text-primary-600 dark:bg-primary-500/15 dark:text-primary-400">{s.cta}</button>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  )
}

function ScoreRow({ label, value, loading }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-gray-600 dark:text-gray-300">{label}</span>
        <span className={cn('font-bold', loading ? 'text-gray-400' : 'text-primary-600')}>{loading ? '…' : `${value}%`}</span>
      </div>
      <Progress value={loading ? 0 : value} color={scoreTone(value)} className="h-1.5" />
    </div>
  )
}