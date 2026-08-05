import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  User,
  FileText,
  ScanText,
  GitCompare,
  Map,
  ClipboardList,
  Mic,
  Code2,
  Briefcase,
  Building2,
  Bell,
  Users,
  Trophy,
  Award,
  Settings,
  X,
  GraduationCap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../utils/cn'

interface NavItem {
  label: string
  icon: LucideIcon
  active?: boolean
  scrollTo?: string
}

const navGroups: { group: string; items: NavItem[] }[] = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, active: true },
      { label: 'Profile', icon: User },
    ],
  },
  {
    group: 'Resume',
    items: [
      { label: 'Resume Builder', icon: FileText },
      { label: 'Resume Analyzer', icon: ScanText, scrollTo: 'resume-analysis' },
      { label: 'Resume vs JD', icon: GitCompare, scrollTo: 'jd-match' },
    ],
  },
  {
    group: 'Preparation',
    items: [
      { label: 'Career Roadmap', icon: Map, scrollTo: 'roadmap' },
      { label: 'Skill Assessment', icon: ClipboardList, scrollTo: 'skills-radar' },
      { label: 'Mock Interview', icon: Mic, scrollTo: 'interviews' },
      { label: 'Coding Practice', icon: Code2, scrollTo: 'coding' },
    ],
  },
  {
    group: 'Career',
    items: [
      { label: 'Applications', icon: Briefcase, scrollTo: 'applications' },
      { label: 'Companies', icon: Building2, scrollTo: 'companies' },
      { label: 'Job Alerts', icon: Bell, scrollTo: 'drives' },
      { label: 'Alumni Network', icon: Users, scrollTo: 'alumni' },
    ],
  },
  {
    group: 'Achievements',
    items: [
      { label: 'Achievements', icon: Trophy, scrollTo: 'achievements' },
      { label: 'Leaderboard', icon: Award },
    ],
  },
  {
    group: 'General',
    items: [{ label: 'Settings', icon: Settings }],
  },
]

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: open ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className={cn(
          'fixed top-0 left-0 z-50 flex h-full w-64 flex-col glass border-r border-slate-200/70 dark:border-slate-800/70 lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200/70 dark:border-slate-800/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-glass">
              <GraduationCap size={18} />
            </div>
            <div>
              <p className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">NeoPlace</p>
              <p className="text-[10px] text-slate-400">Placement Assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navGroups.map((group) => (
            <div key={group.group}>
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <SidebarItem key={item.label} item={item} onNavigate={onClose} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200/70 dark:border-slate-800/70">
          <div className="rounded-xl bg-gradient-to-br from-brand-600/10 to-violet-600/10 p-3">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Placement Ready 🎯</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">You're eligible for 18 companies</p>
            <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '84%' }}
                transition={{ duration: 1.2, delay: 0.4 }}
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500"
              />
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}

function SidebarItem({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const [hovered, setHovered] = useState(false)
  const Icon = item.icon
  return (
    <button
      onClick={() => {
        if (item.scrollTo) document.getElementById(item.scrollTo)?.scrollIntoView({ behavior: 'smooth' })
        onNavigate()
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
        item.active
          ? 'text-brand-600 dark:text-brand-400'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      )}
    >
      {item.active && (
        <motion.span
          layoutId="active-nav"
          className="absolute inset-0 rounded-xl bg-brand-500/10 dark:bg-brand-500/15"
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        />
      )}
      <motion.span animate={{ scale: hovered ? 1.08 : 1 }} className="relative">
        <Icon size={17} />
      </motion.span>
      <span className="relative">{item.label}</span>
    </button>
  )
}
