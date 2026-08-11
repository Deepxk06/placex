import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Pencil, BadgeCheck, Phone, Mail, Share2, FileUp, FileDown, GraduationCap,
  Building2, Hash, Clock, Loader2, Camera, ShieldCheck, TrendingUp,
} from 'lucide-react'
import api from '../../services/api'
import { useToast } from '../ui/ToastProvider'
import { ReadinessRing } from '../ui/ReadinessRing'
import { useProfileStore } from '../../store/profileStore'
import { cn } from '../../utils/helpers'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024

export function placementReadiness(completion, skillCount) {
  const score = Math.min(100, Math.round(completion * 0.7 + Math.min(skillCount, 10) * 3))
  if (score >= 80) return { label: 'Placement Ready', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' }
  if (score >= 50) return { label: 'Almost Ready', tone: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' }
  return { label: 'Needs Work', tone: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400' }
}

export function currentSemester(startYear) {
  const sy = Number(startYear)
  if (!sy) return null
  const sem = new Date().getFullYear() - sy + 1
  return Math.min(8, Math.max(1, sem))
}

export default function ProfileHeader({ profile, onEdit }) {
  const { toast } = useToast()
  const { setProfile, hasResume, fetchProfile, ext } = useProfileStore()
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [sharing, setSharing] = useState(false)

  const name = profile.user?.name || ''
  const email = profile.user?.email || ''
  const photo = profile.photo || ''
  const completion = profile.completionPct || 0
  const college = profile.college || {}
  const skillCount = ext?.skills?.length || 0
  const readiness = placementReadiness(completion, skillCount)
  const semNum = currentSemester(college.start_year)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async ([file]) => {
      if (!file) return
      if (file.size > MAX_PHOTO_BYTES) {
        toast({ type: 'error', message: 'Photo too large. Maximum size is 5 MB' })
        return
      }
      setUploadingPhoto(true)
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await api.post('/profile/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        setProfile(res.data)
        toast({ type: 'success', message: 'Photo updated' })
      } catch {
        toast({ type: 'error', message: 'Photo upload failed' })
      } finally {
        setUploadingPhoto(false)
      }
    },
    maxFiles: 1,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
  })

  const share = async () => {
    setSharing(true)
    const text = `View ${name}'s placement-ready profile on PlaceX`
    try {
      if (navigator.share) await navigator.share({ title: `${name} — PlaceX`, text, url: window.location.href })
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href)
        toast({ type: 'success', message: 'Profile link copied' })
      }
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast({ type: 'success', message: 'Profile link copied' })
      } catch {
        /* share cancelled */
      }
    } finally {
      setSharing(false)
    }
  }

  const onUploadResume = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      await api.post('/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast({ type: 'success', message: 'Resume uploaded' })
      fetchProfile()
    } catch (err) {
      const detail = err.response?.data?.detail
      toast({ type: 'error', message: typeof detail === 'string' ? detail : 'Resume upload failed' })
    }
  }

  return (
    <div className="glass rounded-2xl p-6 shadow-soft sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        {/* Photo */}
        <div className="relative shrink-0 self-center">
          <div {...getRootProps()} className="relative cursor-pointer group">
            <input {...getInputProps()} aria-label="Upload profile photo" />
            {photo ? (
              <img src={photo} alt={name} className={cn('h-28 w-28 rounded-3xl object-cover border-4 border-primary-100 dark:border-gray-700 shadow-soft', isDragActive && 'opacity-60')} />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-600 to-sky-500 text-4xl font-extrabold text-white shadow-soft">
                {(name[0] || '?').toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/50 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              {uploadingPhoto ? <Loader2 size={20} className="animate-spin" /> : <><Camera size={16} /> Change photo</>}
            </div>
          </div>
          {profile?.isVerified && (
            <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white dark:ring-gray-900">
              <BadgeCheck size={18} />
            </span>
          )}
        </div>

        {/* Identity */}
        <div className="min-w-0 flex-1 text-center lg:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">{name}</h1>
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold', readiness.tone)}>
              <TrendingUp size={12} /> {readiness.label}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{email}</p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-gray-600 dark:text-gray-300 lg:justify-start">
            {college.branch && <span className="flex items-center gap-1.5"><GraduationCap size={13} className="text-primary-600" /> {college.branch}</span>}
            {college.college_name && <span className="flex items-center gap-1.5"><Building2 size={13} className="text-primary-600" /> {college.college_name}</span>}
            {semNum && <span className="flex items-center gap-1.5"><Hash size={13} className="text-primary-600" /> Semester {semNum}</span>}
            {college.roll_number && <span className="flex items-center gap-1.5"><Hash size={13} className="text-primary-600" /> Reg: {college.roll_number}</span>}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            {email && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                <Mail size={11} /> Email verified
              </span>
            )}
            {profile?.contact?.phone && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                <Phone size={11} /> Phone verified
              </span>
            )}
            {profile?.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-[11px] font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-400">
                <ShieldCheck size={12} /> PlaceX Verified
              </span>
            )}
          </div>

          <p className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-400 lg:justify-start">
            <Clock size={12} /> Last updated{' '}
            {profile.lastUpdated ? new Date(profile.lastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
          </p>
        </div>

        {/* Readiness ring + actions */}
        <div className="flex shrink-0 flex-col items-center gap-4 lg:items-end">
          <ReadinessRing value={completion} size={92} strokeWidth={9} label="Complete" />
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button onClick={onEdit} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-glass transition-all hover:-translate-y-px active:scale-95">
              <Pencil size={15} /> Edit Profile
            </button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
              <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={onUploadResume} />
              <FileUp size={15} /> Upload Resume
            </label>
            <button
              onClick={() => toast({ type: 'info', message: hasResume ? 'Open the Resume page to download' : 'Upload a resume first' })}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <FileDown size={15} /> Download Resume
            </button>
            <button onClick={share} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
              <Share2 size={15} /> {sharing ? '…' : 'Share Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}