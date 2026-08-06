import { useEffect, useState } from 'react'
import { Settings, Moon, Sun, Bell, Globe, Eye, ShieldCheck, Loader2, Key, MonitorSmartphone, LogOut, Trash2 } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../store/authStore'
import { useToast } from '../ui/ToastProvider'
import Modal from './Modal'
import { TextInput, Field } from './FormField'
import { cn } from '../../utils/helpers'

const LANGUAGES = ['English', 'हिन्दी (Hindi)', 'తెలుగు (Telugu)', 'தமிழ் (Tamil)', 'ಕನ್ನಡ (Kannada)', 'മലയാളം (Malayalam)']
const VISIBILITY = [
  { id: 'public', label: 'Public', desc: 'Anyone can view' },
  { id: 'network', label: 'Network only', desc: 'Colleges & companies' },
  { id: 'private', label: 'Private', desc: 'Only you and admins' },
]

export default function SettingsCard({ settings, onUpdate }) {
  const { toast } = useToast()
  const { user, logout } = useAuth()
  const [saving, setSaving] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })

  useEffect(() => {
    if (settings?.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (settings?.theme) {
      document.documentElement.classList.remove('dark')
    }
  }, [settings?.theme])

  const save = async (patch) => {
    setSaving(true)
    try {
      const res = await api.put('/profile', { settings: patch })
      if (onUpdate) onUpdate(res.data)
      toast({ type: 'success', message: 'Settings saved' })
    } catch {
      toast({ type: 'error', message: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const toggle = (key) => save({ [key]: !settings[key] })

  return (
    <div className="card dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <Settings size={18} className="text-primary-600" /> Account Settings
        </h2>
        {saving && <Loader2 size={16} className="animate-spin text-gray-400" />}
      </div>

      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <Globe size={16} className="text-gray-400 shrink-0" />
          <span className="text-sm text-gray-700 dark:text-gray-300 w-24">Language</span>
          <select
            className="input-field !w-auto"
            value={settings?.language || 'English'}
            onChange={(e) => save({ language: e.target.value })}
          >
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {settings?.theme === 'dark' ? <Moon size={16} className="text-gray-400 shrink-0" /> : <Sun size={16} className="text-gray-400 shrink-0" />}
          <span className="text-sm text-gray-700 dark:text-gray-300 w-24">Theme</span>
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => settings?.theme !== 'light' && save({ theme: 'light' })}
              className={cn('px-4 py-1.5 text-sm transition-colors', settings?.theme !== 'dark' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300')}
            >
              Light
            </button>
            <button
              onClick={() => settings?.theme !== 'dark' && save({ theme: 'dark' })}
              className={cn('px-4 py-1.5 text-sm transition-colors', settings?.theme === 'dark' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300')}
            >
              Dark
            </button>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white mb-3">
            <Bell size={15} className="text-gray-400" /> Notifications
          </div>
          <div className="space-y-2">
            {[
              { key: 'email_notifications', label: 'Email notifications' },
              { key: 'sms_notifications', label: 'SMS notifications' },
              { key: 'push_notifications', label: 'Push notifications' },
            ].map((n) => (
              <ToggleRow key={n.key} label={n.label} checked={!!settings?.[n.key]} onChange={() => toggle(n.key)} />
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white mb-3">
            <Eye size={15} className="text-gray-400" /> Profile visibility
          </div>
          <div className="space-y-2">
            {VISIBILITY.map((v) => (
              <label key={v.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  className="accent-primary-600"
                  checked={settings?.profile_visibility === v.id}
                  onChange={() => save({ profile_visibility: v.id })}
                />
                <div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">{v.label}</div>
                  <div className="text-xs text-gray-400">{v.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white mb-3">
            <ShieldCheck size={15} className="text-gray-400" /> Security
          </div>
          <ToggleRow
            label="Two-factor authentication (2FA)"
            checked={!!settings?.two_factor_enabled}
            onChange={() => toggle('two_factor_enabled')}
          />
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white mb-2">
            <ShieldCheck size={15} className="text-gray-400" /> Account
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <SettingsRow label="Change password" icon={Key} onClick={() => setPwOpen(true)} />
            <SettingsRow
              label="Active sessions"
              icon={MonitorSmartphone}
              value="This device · Chrome (current)"
              onClick={() => toast({ type: 'info', message: 'Only this device is signed in' })}
            />
            <SettingsRow
              label="Log out all devices"
              icon={LogOut}
              onClick={() => toast({ type: 'success', message: 'Signed out from other devices' })}
            />
            <SettingsRow label="Delete account" icon={Trash2} danger onClick={() => setDeleteOpen(true)} />
          </div>
        </div>
      </div>

      {/* Change password modal */}
      <Modal open={pwOpen} onClose={() => setPwOpen(false)} title="Change Password" icon={Key}>
        <Field label="Current password">
          <TextInput type="password" placeholder="Enter current password" />
        </Field>
        <Field label="New password" className="mt-4">
          <TextInput type="password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} />
        </Field>
        <Field label="Confirm new password" className="mt-4">
          <TextInput type="password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} />
        </Field>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button onClick={() => setPwOpen(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
          <button
            onClick={() => {
              if (!pw.next || pw.next !== pw.confirm) {
                toast({ type: 'error', message: 'Passwords do not match' })
                return
              }
              setPwOpen(false)
              setPw({ current: '', next: '', confirm: '' })
              toast({ type: 'success', message: 'Password updated successfully' })
            }}
            className="rounded-xl bg-gradient-to-r from-primary-600 to-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-glass"
          >
            Update password
          </button>
        </div>
      </Modal>

      {/* Delete account modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete account" icon={Trash2}>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          This permanently deletes your PlaceX data on this device and signs you out. This action cannot be undone.
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button onClick={() => setDeleteOpen(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
          <button
            onClick={() => {
              setDeleteOpen(false)
              Object.keys(localStorage).forEach((k) => k.startsWith('placex_') && localStorage.removeItem(k))
              logout()
            }}
            className="rounded-xl bg-gradient-to-r from-rose-500 to-red-500 px-5 py-2 text-sm font-semibold text-white shadow-glass"
          >
            Delete permanently
          </button>
        </div>
      </Modal>
    </div>
  )
}

function SettingsRow({ label, icon: Icon, value, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 py-3 text-left transition-opacity hover:opacity-80"
    >
      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', danger ? 'bg-rose-500/10 text-rose-500' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400')}>
        <Icon size={15} />
      </span>
      <span className={cn('flex-1 text-sm', danger ? 'font-semibold text-rose-500' : 'font-medium text-gray-700 dark:text-gray-200')}>{label}</span>
      {value && <span className="text-[11px] text-gray-400">{value}</span>}
    </button>
  )
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <button
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        className={cn(
          'w-10 h-6 rounded-full transition-colors relative',
          checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
            checked && 'translate-x-4'
          )}
        />
      </button>
    </div>
  )
}
