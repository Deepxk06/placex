import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../services/api'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function fetchNotifications() {
    try {
      const [notifs, count] = await Promise.all([
        api.get('/notifications/'),
        api.get('/notifications/unread-count'),
      ])
      setNotifications(notifs.data)
      setUnreadCount(count.data.count)
    } catch {}
  }

  async function markAllRead() {
    try {
      await api.post('/notifications/read')
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch {}
  }

  async function markSingleRead(id) {
    try {
      await api.post(`/notifications/${id}/read`)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch {}
  }

  const typeColors = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    contest: 'bg-purple-500',
    streak: 'bg-orange-500',
    drive: 'bg-indigo-500',
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-gray-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-full mt-2 w-96 glass rounded-2xl shadow-soft-lg z-50 overflow-hidden"
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200/70 dark:border-gray-800/70">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-800 dark:text-white">Notifications</p>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">
                  <Bell size={32} className="mx-auto mb-2 opacity-30" />
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      markSingleRead(n.id)
                      if (n.link) {
                        setOpen(false)
                        window.location.href = n.link
                      }
                    }}
                    className={`w-full flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors text-left ${
                      !n.is_read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                    }`}
                  >
                    <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${typeColors[n.type] || 'bg-gray-400'}`}>
                      <Bell size={14} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{n.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}</p>
                    </div>
                    {!n.is_read && (
                      <span className="mt-2 h-2 w-2 rounded-full bg-primary-500 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
