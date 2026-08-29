import { motion } from 'framer-motion'
import { GraduationCap, Target, AlertTriangle } from 'lucide-react'
import { FadeIn } from '../ui/AnimatedNumber'
import { Badge } from '../ui/Badge'
import { ReadinessRing } from '../ui/ReadinessRing'
import { dashboardMock as mock, student } from '../../data/dashboardMock'

function readinessBadge(score) {
  if (score >= 80) return { tone: 'success', label: 'Ready for placements' }
  if (score >= 60) return { tone: 'info', label: 'On the right track' }
  if (score >= 40) return { tone: 'warning', label: 'Needs improvement' }
  return { tone: 'danger', label: 'Not ready yet' }
}

function buildCollegeLabel(profile) {
  const parts = []
  if (profile.branch) parts.push(profile.branch)
  else if (profile.college) parts.push('Student')
  if (profile.gradYear) parts.push(`${profile.gradYear} Year`)
  if (parts.length > 0) return parts.join(' — ')
  return student.college
}

export default function WelcomeHeader({ name = student.name, readiness = mock.readinessScore, statCards = mock.statCards, profile = {} }) {
  const badge = readinessBadge(readiness)
  const weakAreas = statCards
    .filter((s) => s.suffix === '%' && s.value != null && s.value < 80)
    .sort((a, b) => a.value - b.value)
    .slice(0, 3)

  const targetRole = profile.targetRole || student.targetRole
  const collegeLabel = buildCollegeLabel(profile)

  return (
    <FadeIn>
      <section id="welcome" className="relative overflow-hidden rounded-2xl glass shadow-soft p-5 sm:p-6">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-primary-500/20 to-sky-500/20 blur-2xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Welcome back, {name}
              </h1>
              <Badge tone={badge.tone}>{badge.label}</Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track your placement journey and improve your readiness.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-0.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <GraduationCap size={14} /> {collegeLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <Target size={14} /> Target: {targetRole}
              </span>
            </div>
            {weakAreas.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={12} /> Focus on
                </span>
                {weakAreas.map((s) => (
                  <span
                    key={s.id}
                    className="rounded-full border border-amber-500/30 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                  >
                    {s.label}: {s.value}%
                  </span>
                ))}
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-4 self-start lg:self-center rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white/60 dark:bg-gray-900/60 p-3.5 lg:min-w-[240px]"
          >
            <ReadinessRing value={readiness} size={92} strokeWidth={9} />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Readiness Score</p>
              <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug">
                {readiness >= 80 ? `Great — you're on track.` : readiness >= 50 ? 'Good — keep pushing.' : 'Needs attention.'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </FadeIn>
  )
}