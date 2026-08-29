import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  PenSquare,
  Briefcase,
  Code2,
  Brain,
  Mic,
  Award,
  TrendingUp,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  TerminalSquare,
  MessageSquare,
  Building2,
  BookOpen,
  ClipboardList,
} from 'lucide-react'
import SidebarItem from './SidebarItem'
import SidebarFooter from './SidebarFooter'
import { cn } from '../../utils/helpers'

const NAV_GROUPS = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { label: 'Build Resume', to: '/resume-builder', icon: PenSquare },
      { label: 'Resume Analysis', to: '/resume', icon: FileText },
      { label: 'Jobs', to: '/jobs', icon: Briefcase },
      { label: 'Applications', to: '/applications', icon: ClipboardList },
    ],
  },
  {
    group: 'Practice',
    items: [
      { label: 'Coding', to: '/skill-assessment', query: 'tab=coding', icon: Code2 },
      { label: 'Code Playground', to: '/code-playground', icon: TerminalSquare },
      { label: 'Aptitude', to: '/skill-assessment', query: 'tab=aptitude', icon: Brain },
      { label: 'Mock Interview', to: '/mock-interview', icon: Mic },
      { label: 'GD Topics', to: '/gd-preparation', icon: MessageSquare },
      { label: 'Company Questions', to: '/company-questions', icon: Building2 },
    ],
  },
  {
    group: 'Growth',
    items: [
      { label: 'Learning', to: '/learning', icon: BookOpen },
      { label: 'Certificates', to: '/certificates', icon: Award },
      { label: 'Analytics', to: '/placement-prediction', icon: TrendingUp },
      { label: 'Settings', to: '/settings', icon: Settings },
    ],
  },
]

export default function Sidebar({ collapsed = false, onToggle, onNavigate }) {
  const location = useLocation()

  const isActive = (item) => {
    if (item.query) return location.pathname === item.to && location.search === `?${item.query}`
    return location.pathname === item.to
  }

  return (
    <aside
      className={cn(
        'flex h-full flex-col glass border-r border-gray-200/70 dark:border-gray-800/70',
        'transition-[width] duration-300 ease-in-out'
      )}
      style={{ width: collapsed ? 72 : 260 }}
    >
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center border-b border-gray-200/70 px-3 dark:border-gray-800/70">
        {collapsed ? (
          <button
            onClick={onToggle}
            className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        ) : (
          <>
            <Link to="/dashboard" className="flex items-center gap-2.5 pl-1">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-sky-500 text-white shadow-glass">
                <FileText size={16} className="rotate-[-8deg]" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-extrabold tracking-tight text-gray-900 dark:text-white">
                  PlaceX
                </span>
                <span className="block text-[10px] text-gray-400">Placement Portal</span>
              </span>
            </Link>
            <button
              onClick={onToggle}
              className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-5 overflow-x-hidden overflow-y-auto px-2.5 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.group}>
            {collapsed ? (
              <div className="mx-auto mb-2 h-px w-8 bg-gray-200 dark:bg-gray-800" />
            ) : (
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {group.group}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <SidebarItem
                  key={`${item.to}/${item.query || ''}`}
                  to={item.query ? `${item.to}?${item.query}` : item.to}
                  icon={item.icon}
                  label={item.label}
                  active={isActive(item)}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <SidebarFooter collapsed={collapsed} onNavigate={onNavigate} />
    </aside>
  )
}