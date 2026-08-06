import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../components/ui/ToastProvider'
import SettingsCard from '../components/profile/SettingsCard'

export default function SettingsPage() {
  const { toast } = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    api
      .get('/profile')
      .then((res) => setProfile(res.data))
      .catch(() => toast({ type: 'error', message: 'Failed to load settings. Try again.' }))
      .finally(() => setLoading(false))
  }, [toast])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl animate-pulse">
        <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account preferences and visibility</p>
      </div>

      {profile ? (
        <SettingsCard settings={profile.settings} onUpdate={setProfile} />
      ) : (
        <div className="card dark:bg-gray-900 dark:border-gray-800 flex flex-col items-center gap-4 py-14 text-center">
          <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600">
            <AlertTriangle size={26} />
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">Couldn't load settings</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">The server may still be waking up. Please try again.</p>
          </div>
          <button onClick={load} className="btn-primary flex items-center gap-2">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      )}
    </div>
  )
}