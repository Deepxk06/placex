import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../store/authStore'
import api from '../../services/api'
import { cn } from '../../utils/helpers'

export default function SidebarFooter({ collapsed, onNavigate }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [photo, setPhoto] = useState(localStorage.getItem('placex_photo') || '')

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

  const name = user?.name || user?.email?.split('@')[0] || 'User'
  const email = user?.email || ''
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="shrink-0 border-t border-gray-200/70 p-3 dark:border-gray-800/70">
      <div
        className={cn(
          'group/me flex items-center gap-2.5 rounded-xl p-2 transition-colors',
          collapsed ? 'justify-center p-1.5' : 'hover:bg-gray-100 dark:hover:bg-gray-800/70'
        )}
      >
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-primary-200 dark:ring-primary-800"
          />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-sky-500 text-xs font-bold text-white">
            {initials}
          </span>
        )}
        {!collapsed && (
          <div className="min-w-0 text-left">
            <p className="truncate text-xs font-bold text-gray-800 dark:text-white">{name}</p>
            <p className="truncate text-[11px] text-gray-400">{email}</p>
          </div>
        )}
      </div>

      <button
        onClick={() => {
          logout()
          navigate('/login')
          onNavigate && onNavigate()
        }}
        className={cn(
          'mt-1.5 flex items-center gap-2.5 rounded-xl text-sm font-medium text-rose-500 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10',
          collapsed ? 'h-10 w-10 justify-center p-0' : 'w-full px-3 py-2.5'
        )}
        aria-label="Logout"
      >
        <LogOut size={17} className="shrink-0" />
        {!collapsed && 'Logout'}
      </button>
    </div>
  )
}