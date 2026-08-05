import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import {
  Pencil, Camera, Trash2, BadgeCheck, Clock, User, Phone, MapPin,
  GraduationCap, Activity, Loader2, Camera as CameraIcon,
} from 'lucide-react'
import api from '../services/api'
import { useToast } from '../components/ui/ToastProvider'
import ProfileEditModal from '../components/profile/ProfileEditModal'
import StudentIdCard from '../components/profile/StudentIdCard'
import DocumentsCard from '../components/profile/DocumentsCard'
import SettingsCard from '../components/profile/SettingsCard'
import { cn } from '../utils/helpers'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024

const ACTIVITY_META = {
  profile_updated: { icon: User, color: 'bg-blue-100 text-blue-600' },
  photo_updated: { icon: CameraIcon, color: 'bg-purple-100 text-purple-600' },
  photo_removed: { icon: Trash2, color: 'bg-red-100 text-red-600' },
  document_uploaded: { icon: Camera, color: 'bg-green-100 text-green-600' },
  document_removed: { icon: Trash2, color: 'bg-red-100 text-red-600' },
  admin_updated: { icon: BadgeCheck, color: 'bg-yellow-100 text-yellow-600' },
}

const ACTIVITY_LABEL = {
  profile_updated: 'Profile details updated',
  photo_updated: 'Profile photo updated',
  photo_removed: 'Profile photo removed',
  document_uploaded: 'Document uploaded',
  document_removed: 'Document removed',
  admin_updated: 'Profile updated by admin',
}

const SECTION_CARDS = [
  { id: 'personal', title: 'Personal Information', icon: User, fields: [
    ['date_of_birth', 'Date of Birth', 'text'], ['gender', 'Gender', 'text'],
    ['blood_group', 'Blood Group', 'text'], ['aadhaar_number', 'Aadhaar Number', 'aadhaar'],
    ['nationality', 'Nationality', 'text'], ['bio', 'Bio', 'long'],
  ]},
  { id: 'contact', title: 'Contact Details', icon: Phone, fields: [
    ['phone', 'Phone', 'text'], ['alternate_phone', 'Alternate Phone', 'text'],
    ['personal_email', 'Personal Email', 'text'], ['website', 'Website', 'text'],
  ]},
  { id: 'address', title: 'Address', icon: MapPin, fields: [
    ['address_line1', 'Address Line 1', 'long'], ['address_line2', 'Address Line 2', 'long'],
    ['city', 'City', 'text'], ['district', 'District', 'text'],
    ['state', 'State', 'text'], ['country', 'Country', 'text'],
    ['pin_code', 'PIN Code', 'text'], ['landmark', 'Landmark', 'text'],
    ['address_type', 'Address Type', 'text'], ['latitude', 'Latitude', 'text'],
    ['longitude', 'Longitude', 'text'],
  ]},
  { id: 'college', title: 'College Details', icon: GraduationCap, fields: [
    ['college_name', 'College Name', 'long'], ['college_location', 'College Location', 'text'],
    ['degree', 'Degree', 'text'], ['branch', 'Branch', 'text'],
    ['cgpa', 'CGPA', 'text'], ['start_year', 'Start Year', 'text'],
    ['end_year', 'End Year', 'text'], ['roll_number', 'Roll Number', 'text'],
    ['admission_number', 'Admission Number', 'text'],
  ]},
]

function maskAadhaar(value) {
  if (!value) return ''
  const digits = value.replace(/\s/g, '')
  if (digits.length !== 12) return value
  return `XXXX XXXX ${digits.slice(8)}`
}

export default function ProfilePage() {
  const { toast } = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoDropRef = useRef(null)

  useEffect(() => {
    api.get('/profile')
      .then((res) => setProfile(res.data))
      .catch(() => toast({ type: 'error', message: 'Failed to load profile' }))
      .finally(() => setLoading(false))
  }, [toast])

  const onPhoto = useCallback(async (file) => {
    if (!file) return
    if (file.size > MAX_PHOTO_BYTES) {
      toast({ type: 'error', message: 'Photo too large. Maximum size is 5 MB' })
      return
    }
    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await api.post('/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setProfile(res.data)
      toast({ type: 'success', message: 'Photo updated' })
    } catch (err) {
      const detail = err.response?.data?.detail
      toast({ type: 'error', message: typeof detail === 'string' ? detail : 'Photo upload failed' })
    } finally {
      setUploadingPhoto(false)
    }
  }, [toast])

  const removePhoto = async () => {
    if (!window.confirm('Remove your profile photo?')) return
    try {
      const res = await api.delete('/profile/photo')
      setProfile(res.data)
      toast({ type: 'success', message: 'Photo removed' })
    } catch {
      toast({ type: 'error', message: 'Failed to remove photo' })
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => onPhoto(accepted[0]),
    maxFiles: 1,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
  })

  if (loading) return <ProfileSkeleton />

  const name = profile.user?.name || ''
  const email = profile.user?.email || ''
  const completion = profile.completionPct || 0
  const photo = profile.photo || ''

  const docCount = Object.values(profile.documents || {}).filter((d) => d && d.name).length

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Profile</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your personal, college and account details</p>
        </div>
        <div className="flex gap-2">
          <button onClick={removePhoto} disabled={!photo} className="btn-secondary flex items-center gap-2 disabled:opacity-40">
            <Trash2 size={16} /> Remove Photo
          </button>
          <button onClick={() => setEditOpen(true)} className="btn-primary flex items-center gap-2">
            <Pencil size={16} /> Edit Profile
          </button>
        </div>
      </div>

      <div className="card dark:bg-gray-900 dark:border-gray-800 flex flex-col sm:flex-row items-center gap-6">
        <div {...getRootProps()} className="relative shrink-0 cursor-pointer group">
          <input {...getInputProps()} />
          {photo ? (
            <img src={photo} alt={name} className={cn('w-24 h-24 rounded-full object-cover border-4 border-primary-100 dark:border-gray-700', isDragActive && 'opacity-60')} />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-gray-800 text-primary-700 dark:text-primary-300 flex items-center justify-center text-3xl font-bold">
              {(name[0] || '?').toUpperCase()}
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity">
            {uploadingPhoto ? <Loader2 size={18} className="animate-spin" /> : <><Camera size={16} /> Change</>}
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold dark:text-white">{name}</h2>
            {profile.isVerified && (
              <span className="badge-success flex items-center gap-1">
                <BadgeCheck size={13} /> Verified
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {profile.college?.branch || ''}{profile.college?.branch && profile.college?.college_name ? ' · ' : ''}{profile.college?.college_name || ''}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1"><Clock size={12} /> Updated {profile.lastUpdated ? new Date(profile.lastUpdated).toLocaleDateString() : '—'}</span>
            <span>{docCount} document{docCount === 1 ? '' : 's'} uploaded</span>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-center gap-1">
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" strokeWidth="8" className="stroke-gray-200 dark:stroke-gray-700" />
              <motion.circle
                cx="40" cy="40" r="34" fill="none" strokeWidth="8" strokeLinecap="round"
                className="stroke-primary-600"
                strokeDasharray={2 * Math.PI * 34}
                initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - completion / 100) }}
                transition={{ duration: 1 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-300">
              {completion}%
            </div>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Complete</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {SECTION_CARDS.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div className="card dark:bg-gray-900 dark:border-gray-800 h-full">
              <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                <card.icon size={17} className="text-primary-600" /> {card.title}
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {card.fields.map(([key, label, kind]) => {
                  let value = profile[card.id]?.[key]
                  if (kind === 'aadhaar') value = maskAadhaar(value)
                  if (kind === 'long' && value) return (
                    <div key={key} className="col-span-2">
                      <div className="text-xs text-gray-400 dark:text-gray-500">{label}</div>
                      <div className="text-sm text-gray-800 dark:text-gray-200 break-words whitespace-pre-wrap">{value}</div>
                    </div>
                  )
                  return (
                    <div key={key}>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{label}</div>
                      <div className="text-sm text-gray-800 dark:text-gray-200 break-words">{value || '—'}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        ))}

        <div className="card dark:bg-gray-900 dark:border-gray-800">
          <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
            <Activity size={17} className="text-primary-600" /> Recent Activity
          </h3>
          {(profile.recentActivity || []).length === 0 ? (
            <p className="text-sm text-gray-400">No activity yet. Update your profile to get started.</p>
          ) : (
            <div className="space-y-3">
              {(profile.recentActivity || []).slice(0, 8).map((item, i) => {
                const meta = ACTIVITY_META[item.action] || ACTIVITY_META.profile_updated
                const Icon = meta.icon
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className={cn('p-1.5 rounded-lg shrink-0', meta.color)}>
                      <Icon size={13} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300 truncate">{item.detail || ACTIVITY_LABEL[item.action] || item.action}</div>
                      <div className="text-xs text-gray-400">
                        {item.time ? new Date(item.time).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <StudentIdCard profile={profile} user={{ ...profile.user, uid: localStorage.getItem('placex_uid') }} />
        <DocumentsCard profile={profile} onUpdate={setProfile} />
      </div>

      <SettingsCard settings={profile.settings} onUpdate={setProfile} />

      <ProfileEditModal open={editOpen} profile={profile} onClose={() => setEditOpen(false)} onSaved={setProfile} />
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl animate-pulse">
      <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded-lg" />
      <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-52 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
