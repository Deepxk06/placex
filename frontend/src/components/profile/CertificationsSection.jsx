import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, BadgeCheck, Upload, FileText, ExternalLink, CalendarDays } from 'lucide-react'
import SectionCard, { EmptyState } from './SectionCard'
import Modal from './Modal'
import { Field, TextInput, TextArea, ButtonRow } from './FormField'
import { useProfileStore } from '../../store/profileStore'
import { useToast } from '../ui/ToastProvider'
import { cn } from '../../utils/helpers'

const ORGANIZATIONS = ['AWS', 'Coursera', 'Google', 'NPTEL', 'Microsoft', 'Udemy', 'IBM', 'Oracle', 'Other']
const MAX_PDF = 2 * 1024 * 1024

const EMPTY = { name: '', organization: '', issueDate: '', credentialId: '', credentialUrl: '', pdf: null }

function OrgAvatar({ org }) {
  const initial = (org || '?').charAt(0).toUpperCase()
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-sky-500 text-sm font-extrabold text-white">
      {initial}
    </span>
  )
}

export default function CertificationsSection() {
  const { ext, addItem, updateItem, removeItem } = useProfileStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const fileRef = useRef(null)
  const certifications = ext?.certifications || []

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const onFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_PDF) {
      toast({ type: 'error', message: 'Certificate PDF too large (max 2 MB)' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const preview = file.type.startsWith('image/') ? reader.result : null
      setForm((f) => ({ ...f, pdf: { name: file.name, size: file.size, dataUrl: reader.result, type: file.type, preview } }))
    }
    reader.readAsDataURL(file)
  }

  const startAdd = () => {
    setEditing(null)
    setForm(EMPTY)
    setOpen(true)
  }

  const startEdit = (item) => {
    setEditing(item)
    setForm({ ...EMPTY, ...item })
    setOpen(true)
  }

  const save = () => {
    if (!form.name.trim() || !form.organization.trim()) {
      toast({ type: 'error', message: 'Certificate name and organization are required' })
      return
    }
    const payload = { ...form, name: form.name.trim(), organization: form.organization.trim() }
    if (editing) {
      updateItem('certifications', editing.id, payload, `Certificate "${payload.name}" updated`)
      toast({ type: 'success', message: 'Certificate updated' })
    } else {
      addItem('certifications', payload, `Certificate "${payload.name}" added`)
      toast({ type: 'success', message: 'Certificate added' })
    }
    setOpen(false)
  }

  const remove = (item) => {
    if (!window.confirm(`Delete certificate "${item.name}"?`)) return
    removeItem('certifications', item.id, `Certificate "${item.name}" removed`)
  }

  return (
    <SectionCard
      id="sec-certifications"
      icon={BadgeCheck}
      title="Certifications"
      subtitle="AWS · Coursera · Google · NPTEL · Microsoft"
      action={
        <button onClick={startAdd} className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600/10 px-3 py-1.5 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-600/20 dark:bg-primary-500/15 dark:text-primary-400">
          <Plus size={14} /> Add Certificate
        </button>
      }
    >
      {certifications.length === 0 ? (
        <EmptyState
          icon={BadgeCheck}
          title="No certifications yet"
          hint="Add credentials that prove your skills — they carry huge weight with recruiters."
          action={
            <button onClick={startAdd} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary-600 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-glass">
              <Plus size={14} /> Add your first certificate
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {certifications.map((c) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group flex items-start gap-3 rounded-2xl border border-gray-200/80 bg-white/60 p-4 transition-colors hover:border-primary-300 dark:border-gray-800 dark:bg-gray-900/40 dark:hover:border-primary-800"
              >
                <OrgAvatar org={c.organization} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-sm font-bold text-gray-900 dark:text-white">{c.name}</h3>
                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => startEdit(c)} className="rounded p-1 text-gray-400 hover:text-primary-600" aria-label="Edit"><Pencil size={13} /></button>
                      <button onClick={() => remove(c)} className="rounded p-1 text-gray-400 hover:text-rose-500" aria-label="Delete"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{c.organization}</p>
                  {c.issueDate && <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-400"><CalendarDays size={11} /> {c.issueDate}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-2.5">
                    {c.credentialId && <span className="text-[10px] text-gray-400">ID: {c.credentialId}</span>}
                    {c.credentialUrl && (
                      <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:underline">
                        Verify <ExternalLink size={11} />
                      </a>
                    )}
                    {c.pdf?.name && (
                      <a href={c.pdf.dataUrl} download={c.pdf.name} className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-primary-600 dark:text-gray-400">
                        <FileText size={11} /> PDF
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Certificate' : 'Add Certificate'}
        subtitle="Add a credential you have earned"
        icon={BadgeCheck}
        size="lg"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Certificate name" className="sm:col-span-2">
            <TextInput value={form.name} onChange={set('name')} placeholder="e.g. AWS Certified Cloud Practitioner" autoFocus />
          </Field>
          <Field label="Organization" className="sm:col-span-2">
            <div className="flex flex-wrap gap-1.5">
              {ORGANIZATIONS.map((org) => (
                <button
                  key={org}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, organization: org }))}
                  className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-colors', form.organization === org ? 'border-primary-500 bg-primary-600/10 text-primary-600' : 'border-gray-200 text-gray-500 hover:border-primary-400 dark:border-gray-700 dark:text-gray-400')}
                >
                  {org}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Issue date">
            <TextInput type="date" value={form.issueDate} onChange={set('issueDate')} />
          </Field>
          <Field label="Credential ID">
            <TextInput value={form.credentialId} onChange={set('credentialId')} placeholder="e.g. AWS-1234-5678" />
          </Field>
          <Field label="Credential URL" className="sm:col-span-2">
            <TextInput value={form.credentialUrl} onChange={set('credentialUrl')} placeholder="https://coursera.org/verify/..." />
          </Field>
        </div>

        {/* PDF upload */}
        <Field label="Certificate PDF (optional)" className="mt-4">
          <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.webp" className="hidden" onChange={onFile} />
          {form.pdf?.name ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-700">
              <span className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                <FileText size={16} className="text-primary-600" /> {form.pdf.name}
              </span>
              <div className="flex gap-2">
                <button onClick={() => fileRef.current?.click()} className="rounded-lg bg-primary-600/10 px-2.5 py-1 text-[11px] font-semibold text-primary-600">Replace</button>
                <button onClick={() => setForm((f) => ({ ...f, pdf: null }))} className="rounded-lg bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-500">Remove</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 px-4 py-6 text-center transition-colors hover:border-primary-400 dark:border-gray-700">
              <Upload size={20} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Upload certificate PDF or image</span>
              <span className="text-[11px] text-gray-400">Max 2 MB — stored locally in your profile</span>
            </button>
          )}
        </Field>

        <ButtonRow>
          <button onClick={() => setOpen(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
          <button onClick={save} className="rounded-xl bg-gradient-to-r from-primary-600 to-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-glass transition-all hover:-translate-y-px active:scale-95">
            {editing ? 'Update Certificate' : 'Add Certificate'}
          </button>
        </ButtonRow>
      </Modal>
    </SectionCard>
  )
}