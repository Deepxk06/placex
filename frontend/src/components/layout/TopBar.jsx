import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, ChevronDown, UserRound, LogOut } from 'lucide-react'
import { useAuth } from '../../store/authStore'
import api from '../../services/api'
import { cn } from '../../utils/helpers'

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const [photo, setPhoto] = useState(localStorage.getItem('placex_photo') || '')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    api.get('/profile')
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
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = (user?.name || 'U')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <span className="text-lg font-bold text-primary-600">PlaceX</span>
      </div>

      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Profile menu"
        >
          {photo ? (
            <img src={photo} alt={user?.name || 'Profile'} className="w-8 h-8 rounded-full object-cover border-2 border-primary-200 dark:border-primary-800" />
          ) : (
            <span className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
              {initials}
            </span>
          )}
          <ChevronDown size={15} className={cn('text-gray-500 transition-transform', open && 'rotate-180')} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="text-sm font-semibold text-gray-800 dark:text-white truncate">{user?.name || 'User'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || ''}</div>
              </div>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <UserRound size={15} /> My Profile
              </Link>
              <button
                onClick={() => { setOpen(false); logout() }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 border-t border-gray-100 dark:border-gray-800"
              >
                <LogOut size={15} /> Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}