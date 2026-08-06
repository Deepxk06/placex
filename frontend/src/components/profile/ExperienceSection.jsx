import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Briefcase, Building2, UserRound, HeartHandshake, FlaskConical, CalendarRange } from 'lucide-react'
import SectionCard, { EmptyState } from './SectionCard'
import Modal from './Modal'
import { Field, TextInput, TextArea, SelectInput, ButtonRow } from './FormField'
import { useProfileStore } from '../../store/profileStore'
import { useToast } from '../ui/ToastProvider'

const TYPES = [
  { id: 'Internship', icon: Briefcase, color: 'text-primary-600 bg-primary-600/10' },
  { id: 'Part-time', icon: UserRound, color: 'text-violet-600 bg-violet-500/10' },
  { id: 'Volunteer', icon: HeartHandshake, color: 'text-amber-600 bg-amber-500/10' },
  { id: 'Research', icon: FlaskConical, color: 'text-emerald-600 bg-emerald-500/10' },
]

const EMPTY = { type: 'Internship', company: '', role: '', duration: '', description: '' }

export default function ExperienceSection() {
  const { ext, addItem, updateItem, removeItem } = useProfileStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const experience = ext?.experience || []

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

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
    if (!form.role.trim() || !form.company.trim()) {
      toast({ type: 'error', message: 'Role and company are required' })
      return
    }
    const payload = { ...form, role: form.role.trim(), company: form.company.trim() }
    if (editing) {
      updateItem('experience', editing.id, payload, `Experience at ${payload.company} updated`)
      toast({ type: 'success', message: 'Experience updated' })
    } else {
      addItem('experience', payload, `Added ${payload.type.toLowerCase()} at ${payload.company}`)
      toast({ type: 'success', message: 'Experience added' })
    }
    setOpen(false)
  }

  const remove = (item) => {
    if (!window.confirm(`Delete ${item.type.toLowerCase()} at "${item.company}"?`)) return
    removeItem('experience', item.id, `Removed ${item.type.toLowerCase()} at ${item.company}`)
  }

  return (
    <SectionCard
      id="sec-experience"
      icon={Briefcase}
      title="Work Experience"
      subtitle="Internships, part-time, volunteer & research"
      action={
        <button onClick={startAdd} className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600/10 px-3 py-1.5 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-600/20 dark:bg-primary-500/15 dark:text-primary-400">
          <Plus size={14} /> Add Experience
        </button>
      }
    >
      {experience.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No experience yet"
          hint="Add internships or projects you've worked on — even freelance counts."
          action={
            <button onClick={startAdd} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary-600 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-glass">
              <Plus size={14} /> Add experience
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {experience.map((xp) => {
              const meta = TYPES.find((t) => t.id === xp.type) || TYPES[0]
              const Icon = meta.icon
              return (
                <motion.div
                  key={xp.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="group flex items-start gap-3.5 rounded-2xl border border-gray-200/80 bg-white/60 p-4 transition-colors hover:border-primary-300 dark:border-gray-800 dark:bg-gray-900/40 dark:hover:border-primary-800"
                >
                  <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.color}`}>
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{xp.role}</h3>
                        <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Building2 size={12} /> {xp.company}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <button onClick={() => startEdit(xp)} className="rounded p-1 text-gray-400 hover:text-primary-600" aria-label="Edit"><Pencil size={13} /></button>
                        <button onClick={() => remove(xp)} className="rounded p-1 text-gray-400 hover:text-rose-500" aria-label="Delete"><Trash2 size={13} /></button>
                      </div>
                    </div>
                    {xp.duration && <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-400"><CalendarRange size={11} /> {xp.duration}</p>}
                    {xp.description && <p className="mt-1.5 text-xs leading-relaxed text-gray-600 dark:text-gray-300">{xp.description}</p>}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Experience' : 'Add Experience'}
        subtitle="Internships, part-time, volunteer or research"
        icon={Briefcase}
        size="lg"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Type">
            <SelectInput value={form.type} onChange={set('type')} options={TYPES.map((t) => t.id)} />
          </Field>
          <Field label="Duration">
            <TextInput value={form.duration} onChange={set('duration')} placeholder="e.g. Jun 2025 – Aug 2025" />
          </Field>
          <Field label="Role / Position">
            <TextInput value={form.role} onChange={set('role')} placeholder="e.g. Software Developer Intern" autoFocus />
          </Field>
          <Field label="Company / Organization">
            <TextInput value={form.company} onChange={set('company')} placeholder="e.g. Tata Consultancy Services" />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <TextArea rows={3} value={form.description} onChange={set('description')} placeholder="What did you work on? What was the impact?" />
          </Field>
        </div>
        <ButtonRow>
          <button onClick={() => setOpen(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
          <button onClick={save} className="rounded-xl bg-gradient-to-r from-primary-600 to-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-glass transition-all hover:-translate-y-px active:scale-95">
            {editing ? 'Update Experience' : 'Add Experience'}
          </button>
        </ButtonRow>
      </Modal>
    </SectionCard>
  )
}