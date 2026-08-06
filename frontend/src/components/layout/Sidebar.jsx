import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../store/authStore'
import {
  LayoutDashboard,
  User,
  FileText,
  PencilLine,
  Mic,
  TrendingUp,
  Briefcase,
  Map,
  MessageCircle,
  Building2,
  Users,
  LogOut,
  Code2,
} from 'lucide-react'

const navGroups = [
  {
    group: 'Overview',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/profile', label: 'My Profile', icon: User },
    ],
  },
  {
    group: 'Resume',
    items: [
      { path: '/resume', label: 'Resume', icon: FileText },
      { path: '/resume-builder', label: 'Resume Builder', icon: PencilLine },
    ],
  },
  {
    group: 'Prepare',
    items: [
      { path: '/skill-assessment', label: 'Skill Assessment', icon: Code2 },
      { path: '/mock-interview', label: 'Mock Interview', icon: Mic },
      { path: '/placement-prediction', label: 'Analytics', icon: TrendingUp },
    ],
  },
  {
    group: 'Career',
    items: [
      { path: '/jobs', label: 'Jobs', icon: Briefcase },
      { path: '/career-roadmap', label: 'Career Roadmap', icon: Map },
      { path: '/career-counsellor', label: 'AI Counsellor', icon: MessageCircle },
      { path: '/company-insights', label: 'Company Insights', icon: Building2 },
      { path: '/alumni', label: 'Alumni Network', icon: Users },
    ],
  },
]

export default function Sidebar({ onNavigate }) {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <aside className="flex h-full w-64 flex-col glass border-r border-gray-200/70 dark:border-gray-800/70">
      <div className="flex items-center justify-between px-5 h-16 border-b border-gray-200/70 dark:border-gray-800/70">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-sky-500 text-white shadow-glass">
            <FileText size={16} className="rotate-[-8deg]" />
          </div>
          <div>
            <p className="text-sm font-extrabold tracking-tight text-gray-900 dark:text-white">PlaceX</p>
            <p className="text-[10px] text-gray-400">Placement Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.group}>
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <SidebarItem
                  key={item.path}
                  item={item}
                  active={location.pathname === item.path}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-200/70 dark:border-gray-800/70 space-y-2">
        {user && <p className="truncate px-3 text-xs text-gray-500 dark:text-gray-400">{user.email}</p>}
        <button
          onClick={() => {
            logout()
            onNavigate && onNavigate()
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  )
}

function SidebarItem({ item, active, onNavigate }) {
  const Icon = item.icon
  return (
    <Link
      to={item.path}
      onClick={onNavigate}
      className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? 'text-primary-600 dark:text-primary-400'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      {active && (
        <motion.span
          layoutId="active-nav"
          className="absolute inset-0 rounded-xl bg-primary-500/10 dark:bg-primary-500/15"
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        />
      )}
      <Icon size={17} className="relative" />
      <span className="relative">{item.label}</span>
    </Link>
  )
}
