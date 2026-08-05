import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../store/authStore'
import {
  LayoutDashboard, FileText, Code2, Mic, TrendingUp, Briefcase,
  Map, MessageCircle, Building2, Users, LogOut, Menu, X, UserRound,
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/profile', label: 'Profile', icon: UserRound },
  { path: '/resume', label: 'Resume', icon: FileText },
  { path: '/resume-builder', label: 'Resume Builder', icon: FileText },
  { path: '/skill-assessment', label: 'Skill Assessment', icon: Code2 },
  { path: '/mock-interview', label: 'Mock Interview', icon: Mic },
  { path: '/placement-prediction', label: 'Placement Prediction', icon: TrendingUp },
  { path: '/jobs', label: 'Jobs', icon: Briefcase },
  { path: '/career-roadmap', label: 'Career Roadmap', icon: Map },
  { path: '/career-counsellor', label: 'AI Counsellor', icon: MessageCircle },
  { path: '/company-insights', label: 'Company Insights', icon: Building2 },
  { path: '/alumni', label: 'Alumni Network', icon: Users },
]

export default function Sidebar({ collapsed, onToggle, onNavigate }) {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-white border-r border-gray-200 transition-all duration-200 flex flex-col h-full`}>
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        {!collapsed && <span className="text-xl font-bold text-primary-600">PlaceX</span>}
        <button onClick={onToggle} className="p-1 rounded hover:bg-gray-100" aria-label="Toggle menu">
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.slice(0, collapsed ? 4 : navItems.length).map((item) => {
          const Icon = item.icon
          const active = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-gray-100">
        {!collapsed && user && (
          <div className="text-xs text-gray-500 mb-2 truncate">{user.email}</div>
        )}
        <button
          onClick={() => { logout(); onNavigate && onNavigate() }}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
