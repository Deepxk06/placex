import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserCheck, ChevronRight, X } from 'lucide-react'
import api from '../../services/api'

export default function ProfileCompletionBanner() {
  const [profile, setProfile] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    api.get('/profile').then((res) => setProfile(res.data)).catch(() => {})
  }, [])

  if (dismissed || !profile) return null

  const completion = profile.completion_pct || 0
  if (completion >= 80) return null

  return (
    <div className="bg-gradient-to-r from-primary-50 to-sky-50 dark:from-primary-900/20 dark:to-sky-900/20 rounded-2xl border border-primary-200/50 dark:border-primary-800/50 p-4 flex items-center gap-4">
      <div className="shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800/30 flex items-center justify-center">
        <UserCheck size={20} className="text-primary-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 dark:text-white">
          Complete your profile ({completion}%)
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          A complete profile improves placement recommendations by 3x
        </p>
        <div className="mt-2 h-1.5 rounded-full bg-primary-100 dark:bg-primary-800/30 overflow-hidden">
          <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${completion}%` }} />
        </div>
      </div>
      <Link
        to="/profile"
        className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary-600 text-white text-xs font-bold hover:bg-primary-700 transition-colors"
      >
        Complete <ChevronRight size={14} />
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  )
}
