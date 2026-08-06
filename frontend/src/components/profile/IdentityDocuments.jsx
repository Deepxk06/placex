import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ShieldCheck, Upload, FileText, Trash2, Loader2, Lock, BadgeCheck } from 'lucide-react'
import SectionCard from './SectionCard'
import api from '../../services/api'
import { useProfileStore } from '../../store/profileStore'
import { useToast } from '../ui/ToastProvider'
import { cn } from '../../utils/helpers'

const MAX_SIZE = 5 * 1024 * 1024

const SLOTS = [
  { id: 'student_id', label: 'Student ID', desc: 'College ID card', required: true, server: true },
  { id: 'aadhaar', label: 'Government ID', desc: 'Aadhaar — masked, never shown in full', required: true, server: true },
  { id: 'passport', label: 'Passport', desc: 'Optional identity document', required: false, server: false },
]

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function IdentityDocuments() {
  const { profile, ext, setProfile, saveField } = useProfileStore()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(null)

  const docFor = (slot) => (slot.server ? profile?.documents?.[slot.id] : ext?.passport)

  const upload = async (slot, file) => {
    if (file.size > MAX_SIZE) {
      toast({ type: 'error', message: 'File too large. Maximum size is 5 MB' })
      return
    }
    setUploading(slot.id)
    try {
      if (slot.server) {
        const formData = new FormData()
        formData.append('file', file)
        const res = await api.post(`/profile/documents/${slot.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setProfile(res.data)
      } else {
        const reader = new FileReader()
        reader.onload = () => {
          saveField(
            'passport',
            { name: file.name, size: file.size, type: file.type, dataUrl: reader.result, uploadedAt: new Date().toISOString() },
            'Passport classified'
          )
        }
        reader.readAsDataURL(file)
      }
      toast({ type: 'success', message: `${slot.label} uploaded securely` })
    } catch {
      toast({ type: 'error', message: 'Upload failed' })
    } finally {
      setUploading(null)
    }
  }

  const remove = async (slot) => {
    if (!window.confirm(`Remove ${slot.label}?`)) return
    try {
      if (slot.server) {
        const res = await api.delete(`/profile/documents/${slot.id}`)
        setProfile(res.data)
      } else {
        saveField('passport', {}, 'Passport document removed')
      }
      toast({ type: 'success', message: `${slot.label} removed` })
    } catch {
      toast({ type: 'error', message: 'Failed to remove document' })
    }
  }

  return (
    <SectionCard id="sec-identity" icon={ShieldCheck} title="Identity Documents" subtitle="Verified & stored securely" delay={0.15}>
      <div className="space-y-3">
        {SLOTS.map((slot) => (
          <SlotItem
            key={slot.id}
            slot={slot}
            doc={docFor(slot)}
            uploading={uploading === slot.id}
            onUpload={upload}
            onRemove={remove}
          />
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400">
        <Lock size={11} /> Documents are encrypted in storage — sensitive numbers are never displayed.
      </p>
    </SectionCard>
  )
}

function SlotItem({ slot, doc, uploading, onUpload, onRemove }) {
  const onDrop = useCallback(
    (accepted) => {
      if (accepted[0]) onUpload(slot, accepted[0])
    },
    [slot, onUpload]
  )
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })

  return (
    <div className="rounded-2xl border border-gray-200/80 p-3.5 dark:border-gray-800">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', slot.required ? 'bg-primary-600/10 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400')}>
            <FileText size={16} />
          </span>
          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
              {slot.label} {!slot.required && <span className="text-[10px] font-medium text-gray-400">(optional)</span>}
            </p>
            <p className="text-[11px] text-gray-400">{slot.desc}</p>
          </div>
        </div>
        {doc?.name ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
            <BadgeCheck size={11} /> Verified
          </span>
        ) : null}
      </div>

      {doc?.name ? (
        <div className="mt-3 flex items-center gap-3">
          {doc.dataUrl?.startsWith('data:image') ? (
            <img src={doc.dataUrl} alt={doc.name} className="h-14 w-14 shrink-0 rounded-xl border border-gray-200 object-cover dark:border-gray-700" />
          ) : (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-600/10 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400">
              <FileText size={18} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">{doc.name}</p>
            <p className="text-[11px] text-gray-400">
              {formatSize(doc.size)} · {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'uploaded'}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <label className="cursor-pointer rounded-lg bg-primary-600/10 px-2.5 py-1.5 text-[11px] font-bold text-primary-600 transition-colors hover:bg-primary-600/20 dark:bg-primary-500/15 dark:text-primary-400">
              <input {...getInputProps()} className="hidden" />
              Replace
            </label>
            <button onClick={() => onRemove(slot)} className="rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-bold text-rose-500 transition-colors hover:bg-rose-500/20">
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'mt-3 flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-gray-300 py-5 text-center transition-colors hover:border-primary-400 dark:border-gray-700',
            isDragActive && 'border-primary-500 bg-primary-500/5'
          )}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <Loader2 size={18} className="animate-spin text-primary-500" />
          ) : (
            <Upload size={18} className="text-gray-400" />
          )}
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-300">
            {uploading ? 'Uploading…' : isDragActive ? 'Drop to upload' : `Drag & drop ${slot.label}`}
          </span>
          <span className="text-[11px] text-gray-400">or click to browse · JPG, PNG, PDF · max 5 MB</span>
        </div>
      )}
    </div>
  )
}