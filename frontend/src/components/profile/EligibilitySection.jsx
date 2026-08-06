import { motion } from 'framer-motion'
import { ShieldCheck, CheckCircle2, XCircle, GraduationCap, BookOpen, FileText, ClipboardList, Building2, Lock } from 'lucide-react'
import SectionCard from './SectionCard'
import { useProfileStore } from '../../store/profileStore'
import { cn } from '../../utils/helpers'

export default function EligibilitySection() {
  const { profile, hasResume, ext } = useProfileStore()
  if (!profile || !ext) return null

  const cgpa = Number(parseFloat(profile.college?.cgpa)) || 0
  const cgpaOk = cgpa >= 6 && cgpa <= 10
  const backlogs = Number(ext.careerPrefs?.backlogs || 0)
  const backlogsOk = backlogs === 0
  const resumeOk = hasResume
  const profileOk = (profile.completionPct || 0) >= 70
  const eligible = cgpaOk && backlogsOk && resumeOk && profileOk

  const checks = [
    { label: 'CGPA', value: cgpaOk ? `${cgpa} / 10` : cgpa > 0 ? `${cgpa} — below 6.0` : 'Not added', ok: cgpaOk, icon: GraduationCap },
    { label: 'Backlogs', value: backlogsOk ? 'None' : `${backlogs} active`, ok: backlogsOk, icon: BookOpen },
    { label: 'Resume uploaded', value: resumeOk ? 'Uploaded' : 'Missing', ok: resumeOk, icon: FileText },
    { label: 'Profile completed', value: `${profile.completionPct || 0}% complete`, ok: profileOk, icon: ClipboardList },
  ]

  return (
    <SectionCard
      id="sec-eligibility"
      icon={ShieldCheck}
      title="Placement Eligibility"
      subtitle="Your eligibility for campus placement drives"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'mb-4 flex items-center gap-3 rounded-2xl border px-4 py-3.5',
          eligible
            ? 'border-emerald-300 bg-emerald-500/10 dark:border-emerald-500/30 dark:bg-emerald-500/10'
            : 'border-amber-300 bg-amber-500/10 dark:border-amber-500/30 dark:bg-amber-500/10'
        )}
      >
        {eligible ? (
          <CheckCircle2 size={26} className="shrink-0 text-emerald-500" />
        ) : (
          <Lock size={26} className="shrink-0 text-amber-500" />
        )}
        <div>
          <p className={cn('text-sm font-extrabold', eligible ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400')}>
            {eligible ? 'Placement Eligible' : 'Not yet eligible'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {eligible ? 'You qualify for campus drives and recruiter access.' : 'Complete all criteria below to unlock campus drives.'}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {checks.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 rounded-xl border border-gray-200/80 px-3.5 py-2.5 dark:border-gray-800"
          >
            <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', c.ok ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-100 text-gray-400 dark:bg-gray-800')}>
              <c.icon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{c.label}</p>
              <p className={cn('truncate text-[11px]', c.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400')}>{c.value}</p>
            </div>
            {c.ok ? <CheckCircle2 size={16} className="shrink-0 text-emerald-500" /> : <XCircle size={16} className="shrink-0 text-gray-300 dark:text-gray-600" />}
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/50">
        <span className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
          <Building2 size={14} className="text-primary-600" /> Companies you're eligible for
        </span>
        <span className={cn('text-sm font-extrabold', eligible ? 'text-emerald-600' : 'text-gray-400')}>
          {eligible ? `${12 + Math.min(ext.skills.length, 8)}+` : '—'}
        </span>
      </div>
    </SectionCard>
  )
}