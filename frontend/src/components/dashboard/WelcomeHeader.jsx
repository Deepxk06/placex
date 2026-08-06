import { motion } from 'framer-motion'
import { GraduationCap, Target } from 'lucide-react'
import { FadeIn } from '../ui/AnimatedNumber'
import { Badge } from '../ui/Badge'
import { ReadinessRing } from '../ui/ReadinessRing'
import { dashboardMock as mock, student } from '../../data/dashboardMock'

export default function WelcomeHeader({ name = student.name, readiness = mock.readinessScore }) {
  return (
    <FadeIn>
      <section id="welcome" className="relative overflow-hidden rounded-2xl glass shadow-soft p-6 sm:p-8">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-primary-500/20 to-sky-500/20 blur-2xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Welcome back, {name}
              </h1>
              <Badge tone="success">Ready for placements</Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track your placement journey and improve your readiness.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <GraduationCap size={14} /> {student.college}
              </span>
              <span className="flex items-center gap-1.5">
                <Target size={14} /> Target: {student.targetRole}
              </span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-4 self-start lg:self-center rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white/60 dark:bg-gray-900/60 p-4 lg:min-w-[260px]"
          >
            <ReadinessRing value={readiness} size={104} strokeWidth={9} />
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