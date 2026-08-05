import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Loader2, CheckCircle2, User, Phone, MapPin, GraduationCap } from 'lucide-react'
import api from '../../services/api'
import { useToast } from '../ui/ToastProvider'
import { cn } from '../../utils/helpers'

const TABS = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'contact', label: 'Contact', icon: Phone },
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'college', label: 'College', icon: GraduationCap },
]

const FIELDS = {
  personal: [
    { key: 'date_of_birth', label: 'Date of Birth', type: 'date', validate: (v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v) || 'Use YYYY-MM-DD' },
    { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    { key: 'blood_group', label: 'Blood Group', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    { key: 'aadhaar_number', label: 'Aadhaar Number', placeholder: '1234 5678 9012', validate: (v) => !v || /^\d{4}\s?\d{4}\s?\d{4}$/.test(v) || 'Enter 12 digits' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'bio', label: 'Bio', type: 'textarea', rows: 3 },
  ],
  contact: [
    { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210', validate: (v) => !v || /^[0-9+\-\s()]{8,15}$/.test(v) || 'Enter 8-15 digits' },
    { key: 'alternate_phone', label: 'Alternate Phone', placeholder: '+91 98765 43210', validate: (v) => !v || /^[0-9+\-\s()]{8,15}$/.test(v) || 'Enter 8-15 digits' },
    { key: 'personal_email', label: 'Personal Email', type: 'email', validate: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email' },
    { key: 'website', label: 'Website', placeholder: 'https://...', validate: (v) => !v || /^(https?:\/\/|www\.)/.test(v) || 'Start with http(s)://' },
  ],
  address: [
    { key: 'address_line1', label: 'Address Line 1' },
    { key: 'address_line2', label: 'Address Line 2' },
    { key: 'city', label: 'City' },
    { key: 'district', label: 'District' },
    { key: 'state', label: 'State' },
    { key: 'country', label: 'Country' },
    { key: 'pin_code', label: 'PIN Code', validate: (v) => !v || /^\d{6}$/.test(v) || 'Must be 6 digits' },
    { key: 'landmark', label: 'Landmark' },
    { key: 'address_type', label: 'Address Type', type: 'select', options: ['permanent', 'current', 'hostel', 'other'] },
    { key: 'latitude', label: 'Latitude' },
    { key: 'longitude', label: 'Longitude' },
  ],
  college: [
    { key: 'college_name', label: 'College Name' },
    { key: 'college_location', label: 'College Location' },
    { key: 'degree', label: 'Degree', placeholder: 'B.Tech' },
    { key: 'branch', label: 'Branch', placeholder: 'Computer Science' },
    { key: 'cgpa', label: 'CGPA', validate: (v) => !v || (!isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 10) || 'Between 0 and 10' },
    { key: 'start_year', label: 'Start Year', placeholder: '2022', validate: (v) => !v || /^\d{4}$/.test(v) || '4-digit year' },
    { key: 'end_year', label: 'End Year', placeholder: '2026', validate: (v) => !v || /^\d{4}$/.test(v) || '4-digit year' },
    { key: 'roll_number', label: 'Roll Number' },
    { key: 'admission_number', label: 'Admission Number' },
  ],
}

export default function ProfileEditModal({ open, profile, onClose, onSaved }) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('personal')
  const [draft, setDraft] = useState({})
  const [dirty, setDirty] = useState(false)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('') // '', 'saving', 'saved'
  const loadedRef = useRef(false)

  useEffect(() => {
    if (open) {
      setDraft({
        personal: { ...profile.personal },
        contact: { ...profile.contact },
        address: { ...profile.address },
        college: { ...profile.college },
      })
      setDirty(false)
      setErrors({})
      setSaveStatus('')
      loadedRef.current = true
    }
  }, [open, profile])

  const setField = (section, key, value) => {
    setDraft((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }))
    setDirty(true)
    setErrors((prev) => ({ ...prev, [`${section}.${key}`]: undefined }))
  }

  useEffect(() => {
    if (!open || !dirty) return
    const t = setTimeout(() => {
      setSaveStatus('saving')
      api.put('/profile', { personal: draft.personal, contact: draft.contact, address: draft.address, college: draft.college })
        .then((res) => {
          setSaveStatus('saved')
          setDirty(false)
          if (onSaved) onSaved(res.data)
        })
        .catch(() => {
          setSaveStatus('')
          toast({ type: 'error', message: 'Auto-save failed. Your changes will be saved when you click Save.' })
        })
    }, 1500)
    return () => clearTimeout(t)
  }, [draft, dirty, open, onSaved, toast])

  const validateAll = () => {
    const next = {}
    Object.entries(FIELDS).forEach(([section, fields]) => {
      fields.forEach((f) => {
        if (!f.validate) return
        const err = f.validate(draft[section]?.[f.key] || '')
        if (err !== true && err) next[`${section}.${f.key}`] = err
      })
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (dirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [open, dirty])

  const handleClose = () => {
    if (dirty && !window.confirm('You have unsaved changes. Discard them?')) return
    onClose()
  }

  const handleSave = async () => {
    if (!validateAll()) {
      toast({ type: 'error', message: 'Please fix the highlighted fields' })
      return
    }
    setSaving(true)
    try {
      const res = await api.put('/profile', {
        personal: draft.personal, contact: draft.contact, address: draft.address,
        college: draft.college,
      })
      if (onSaved) onSaved(res.data)
      setDirty(false)
      toast({ type: 'success', message: 'Profile saved successfully' })
      onClose()
    } catch (err) {
      const detail = err.response?.data?.detail
      toast({ type: 'error', message: typeof detail === 'string' ? detail : 'Failed to save profile' })
    } finally {
      setSaving(false)
    }
  }

  const activeFields = FIELDS[activeTab] || []
  const ActiveIcon = TABS.find((t) => t.id === activeTab)?.icon

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <ActiveIcon size={20} className="text-primary-600" />
                <h2 className="text-lg font-bold dark:text-white">Edit Profile</h2>
              </div>
              <div className="flex items-center gap-2">
                {saveStatus === 'saving' && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Loader2 size={13} className="animate-spin" /> Saving draft...
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 size={13} /> Draft saved
                  </span>
                )}
                <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex gap-1 px-5 pt-4 border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
              {TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors',
                      activeTab === tab.id
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    )}
                  >
                    <Icon size={15} />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {activeFields.map((field) => {
                    const value = draft[activeTab]?.[field.key] || ''
                    const err = errors[`${activeTab}.${field.key}`]
                    return (
                      <div key={field.key} className={cn(field.type === 'textarea' && 'sm:col-span-2')}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {field.label}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            className={cn('input-field', err && 'border-red-500')}
                            rows={field.rows || 3}
                            value={value}
                            onChange={(e) => setField(activeTab, field.key, e.target.value)}
                          />
                        ) : field.type === 'select' ? (
                          <select
                            className={cn('input-field', err && 'border-red-500')}
                            value={value}
                            onChange={(e) => setField(activeTab, field.key, e.target.value)}
                          >
                            <option value="">Select...</option>
                            {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input
                            className={cn('input-field', err && 'border-red-500')}
                            type={field.type || 'text'}
                            placeholder={field.placeholder || ''}
                            value={value}
                            onChange={(e) => setField(activeTab, field.key, e.target.value)}
                          />
                        )}
                        {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
                      </div>
                    )
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 dark:text-gray-500">Changes are auto-saved as drafts</p>
              <div className="flex gap-2">
                <button onClick={handleClose} className="btn-secondary">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
