import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, ChevronDown, UserRound, LogOut, Search, Bell, Sun, Moon, Settings, HelpCircle } from 'lucide-react'
import { useAuth } from '../../store/authStore'
import api from '../../services/api'
import { useTheme } from '../../hooks/useTheme'
import { cn } from '../../utils/helpers'
import { dashboardMock } from '../../data/dashboardMock'
import { Badge } from '../ui/Badge'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const [photo, setPhoto] = useState(localStorage.getItem('placex_photo') || '')
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [query, setQuery] = useState('')
  const profileRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    api
      .get('/profile')
      .then((res) => {
        if (res.data?.photo) {
          setPhoto(res.data.photo)
          localStorage.setItem('placex_photo', res.data.photo)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const name = user?.name || user?.email?.split('@')[0] || 'User'
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 glass border-b border-gray-200/70 dark:border-gray-800/70">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Logo (mobile only) */}
        <Link to="/dashboard" className="md:hidden flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-sky-500 text-white">
            <LogoIcon />
          </span>
          <span className="font-extrabold text-sm text-gray-900 dark:text-white">PlaceX</span>
        </Link>

        {/* Search */}
        <div className="relative flex-1 max-w-md ml-2 hidden sm:block">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs, skills, companies…"
            className="w-full rounded-xl border border-transparent bg-gray-100 dark:bg-gray-800/70 pl-10 pr-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:bg-white dark:focus:bg-gray-900 transition"
          />
        </div>

        <div className="flex-1 sm:hidden" />

        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="relative p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-gray-900" />
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-full mt-2 w-80 glass rounded-2xl shadow-soft-lg p-2 z-50"
                >
                  <div className="px-3 py-2 flex items-center justify-between border-b border-gray-200/70 dark:border-gray-800/70">
                    <p className="text-sm font-bold text-gray-800 dark:text-white">Notifications</p>
                    <Badge tone="brand">{dashboardMock.notifications.length} new</Badge>
                  </div>
                  <div className="max-h-80 overflow-y-auto mt-1">
                    {dashboardMock.notifications.map((n) => (
                      <div
                        key={n.id}
                        className="flex gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors cursor-pointer"
                      >
                        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${n.color}`}>
                          <n.icon size={14} />
                        </span>
                        <div>
                          <p className="text-xs text-gray-700 dark:text-gray-200 leading-snug">{n.text}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Profile menu"
            >
              {photo ? (
                <img
                  src={photo}
                  alt={name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-primary-200 dark:ring-primary-800"
                />
              ) : (
                <span className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-600 to-sky-500 text-white flex items-center justify-center text-xs font-bold">
                  {initials}
                </span>
              )}
              <span className="hidden md:block text-xs font-bold text-gray-800 dark:text-white max-w-[120px] truncate">
                {name}
              </span>
              <ChevronDown size={15} className={cn('text-gray-400 transition-transform', profileOpen && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-full mt-2 w-56 glass rounded-2xl shadow-soft-lg p-2 z-50"
                >
                  <div className="px-3 py-2 border-b border-gray-200/70 dark:border-gray-800/70">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || ''}</p>
                  </div>
                  <div className="pt-1">
                    {[
                      { label: 'My Profile', icon: UserRound, to: '/profile' },
                      { label: 'Settings', icon: Settings, to: '/settings' },
                      { label: 'Help & Support', icon: HelpCircle, to: '/' },
                    ].map((item) => (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <item.icon size={15} className="text-gray-400" />
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        setProfileOpen(false)
                        logout()
                      }}
                      className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors border-t border-gray-200/70 dark:border-gray-800/70"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )

  function LogoIcon() {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    )
  }
}