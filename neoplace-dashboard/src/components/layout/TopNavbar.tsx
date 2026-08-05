import { AnimatePresence, motion } from 'framer-motion'
import {
  Search,
  Bell,
  Sparkles,
  Sun,
  Moon,
  Menu,
  Settings,
  User,
  LogOut,
  HelpCircle,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'
import { Dropdown } from '../ui/Dropdown'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { notifications } from '../../data/mockData'
import { useTheme } from '../../hooks/useTheme'

export function TopNavbar({
  onOpenSidebar,
  onOpenAssistant,
}: {
  onOpenSidebar: () => void
  onOpenAssistant: () => void
}) {
  const { theme, toggle } = useTheme()
  const [query, setQuery] = useState('')

  return (
    <header className="sticky top-0 z-30 glass border-b border-slate-200/70 dark:border-slate-800/70">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Logo (mobile) */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-violet-600 text-white">
            <Sparkles size={15} />
          </div>
          <span className="font-extrabold text-sm">NeoPlace</span>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md ml-2 hidden sm:block">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills, companies, jobs…"
            className="w-full rounded-xl border border-transparent bg-slate-100 dark:bg-slate-800/70 pl-10 pr-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:bg-white dark:focus:bg-slate-900 transition"
          />
        </div>

        <div className="flex-1 sm:hidden" />

        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          {/* AI Assistant */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onOpenAssistant}
            className="relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-3 sm:px-4 py-2.5 text-sm font-semibold text-white shadow-glass"
          >
            <Sparkles size={16} className="animate-pulse" />
            <span className="hidden md:inline">AI Assistant</span>
          </motion.button>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="block"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </motion.span>
            </AnimatePresence>
          </button>

          {/* Notifications */}
          <Dropdown
            trigger={
              <span className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              </span>
            }
            width="w-80"
          >
            <div className="px-3 py-2 flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800/70">
              <p className="text-sm font-bold text-slate-800 dark:text-white">Notifications</p>
              <Badge tone="brand">{notifications.length} new</Badge>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${n.color}`}>
                    <n.icon size={14} />
                  </span>
                  <div>
                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-snug">{n.text}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Dropdown>

          {/* Profile + settings dropdown */}
          <Dropdown
            trigger={
              <span className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Avatar initials="DK" />
                <span className="hidden md:flex flex-col items-start leading-tight">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Deepak</span>
                  <span className="text-[10px] text-slate-400">Software Engineer</span>
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </span>
            }
            width="w-56"
          >
            {[
              { label: 'My Profile', icon: User },
              { label: 'Settings', icon: Settings },
              { label: 'Help & Support', icon: HelpCircle },
            ].map((item) => (
              <button
                key={item.label}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <item.icon size={15} className="text-slate-400" />
                {item.label}
              </button>
            ))}
            <div className="my-1.5 h-px bg-slate-200/70 dark:bg-slate-800" />
            <button className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
              <LogOut size={15} />
              Sign out
            </button>
          </Dropdown>
        </div>
      </div>
    </header>
  )
}
