import { motion } from 'framer-motion'
import {
  History, User, Camera, FileText, FolderGit2, BadgeCheck, Code2, Trophy,
  Briefcase, Link2, ShieldCheck, Target,
} from 'lucide-react'
import SectionCard, { EmptyState } from './SectionCard'
import { useProfileStore } from '../../store/profileStore'
import { cn } from '../../utils/helpers'

const ICON_META = {
  profile_updated: { icon: User, color: 'bg-blue-500/10 text-blue-500' },
  photo_updated: { icon: Camera, color: 'bg-purple-500/10 text-purple-500' },
  photo_removed: { icon: Camera, color: 'bg-rose-500/10 text-rose-500' },
  document_uploaded: { icon: ShieldCheck, color: 'bg-green-500/10 text-green-500' },
  document_removed: { icon: ShieldCheck, color: 'bg-rose-500/10 text-rose-500' },
  admin_updated: { icon: ShieldCheck, color: 'bg-amber-500/10 text-amber-500' },
  skills: { icon: Code2, color: 'bg-primary-500/10 text-primary-500' },
  projects: { icon: FolderGit2, color: 'bg-violet-500/10 text-violet-500' },
  certifications: { icon: BadgeCheck, color: 'bg-emerald-500/10 text-emerald-500' },
  experience: { icon: Briefcase, color: 'bg-teal-500/10 text-teal-500' },
  achievements: { icon: Trophy, color: 'bg-amber-500/10 text-amber-500' },
  socialLinks: { icon: Link2, color: 'bg-sky-500/10 text-sky-500' },
  careerPrefs: { icon: Target, color: 'bg-indigo-500/10 text-indigo-500' },
  passport: { icon: ShieldCheck, color: 'bg-green-500/10 text-green-500' },
}

const ACTION_LABEL = {
  added: 'added',
  updated: 'updated',
  removed: 'removed',
  reordered: 'updated',
}

export default function RecentActivityTimeline() {
  const { profile, ext } = useProfileStore()
  if (!profile || !ext) return null

  const server = (profile.recentActivity || []).map((a) => ({
    ...a,
    ms: a.time ? new Date(a.time).getTime() : 0,
    meta: ICON_META[a.action] || { icon: User, color: 'bg-gray-100 text-gray-400' },
  }))

  const local = (ext.activity || []).map((a) => ({
    ...a,
    ms: a.time ? new Date(a.time).getTime() : 0,
    meta: ICON_META[a.section] || { icon: User, color: 'bg-gray-100 text-gray-400' },
  }))

  const items = [...server, ...local].sort((a, b) => b.ms - a.ms).slice(0, 12)

  return (
    <SectionCard id="sec-activity" icon={History} title="Recent Activity" subtitle="Latest updates on your profile" delay={0.1}>
      {items.length === 0 ? (
        <EmptyState icon={History} title="No activity yet" hint="Updates to your profile will appear here." />
      ) : (
        <div className="relative space-y-0">
          <div className="absolute bottom-2 left-[15px] top-2 w-px bg-gray-200 dark:bg-gray-800" />
          {items.map((item, i) => {
            const Icon = item.meta.icon
            return (
              <motion.div
                key={`${item.ms}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="relative flex items-start gap-3 pl-1 pb-3"
              >
                <span className={cn('z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white dark:ring-gray-900', item.meta.color)}>
                  <Icon size={14} />
                </span>
                <div className="min-w-0 pt-0.5">
                  {item.section ? (
                    <p className="text-xs text-gray-700 dark:text-gray-200">
                      <span className="font-bold capitalize">{item.section}</span>{' '}
                      <span className="text-gray-500 dark:text-gray-400">{ACTION_LABEL[item.activity] || 'updated'}</span>
                      {item.detail ? ` — ${item.detail}` : ''}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-700 dark:text-gray-200">{item.detail || item.action}</p>
                  )}
                  <p className="text-[11px] text-gray-400">
                    {item.ms
                      ? new Date(item.ms).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}