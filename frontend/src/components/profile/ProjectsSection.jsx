import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, FolderGit2, Github, ExternalLink, Calendar, Trophy, Star } from 'lucide-react'
import SectionCard, { EmptyState } from './SectionCard'
import Modal from './Modal'
import { Field, TextInput, TextArea, ButtonRow } from './FormField'
import { useProfileStore } from '../../store/profileStore'
import { useToast } from '../ui/ToastProvider'

const EMPTY = { name: '', description: '', techStack: '', github: '', liveDemo: '', duration: '', achievements: '', image: '' }

export default function ProjectsSection() {
  const { ext, addItem, updateItem, removeItem } = useProfileStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const projects = ext?.projects || []

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const startAdd = () => {
    setEditing(null)
    setForm(EMPTY)
    setOpen(true)
  }

  const startEdit = (item) => {
    setEditing(item)
    setForm({ ...EMPTY, ...item, techStack: (item.techStack || []).join(', ') })
    setOpen(true)
  }

  const save = () => {
    if (!form.name.trim()) {
      toast({ type: 'error', message: 'Project name is required' })
      return
    }
    const payload = {
      ...form,
      name: form.name.trim(),
      techStack: form.techStack.split(',').map((s) => s.trim()).filter(Boolean),
    }
    if (editing) {
      updateItem('projects', editing.id, payload, `Project "${payload.name}" updated`)
      toast({ type: 'success', message: 'Project updated' })
    } else {
      addItem('projects', payload, `Project "${payload.name}" added`)
      toast({ type: 'success', message: 'Project added' })
    }
    setOpen(false)
  }

  const remove = (item) => {
    if (!window.confirm(`Delete project "${item.name}"?`)) return
    removeItem('projects', item.id, `Project "${item.name}" removed`)
  }

  return (
    <SectionCard
      id="sec-projects"
      icon={FolderGit2}
      title="Projects"
      subtitle="Showcase what you've built"
      action={
        <button onClick={startAdd} className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600/10 px-3 py-1.5 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-600/20 dark:bg-primary-500/15 dark:text-primary-400">
          <Plus size={14} /> Add Project
        </button>
      }
    >
      {projects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No projects yet"
          hint="Projects boost your ATS score and are the #1 thing recruiters check."
          action={
            <button onClick={startAdd} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary-600 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-glass">
              <Plus size={14} /> Add your first project
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {projects.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group overflow-hidden rounded-2xl border border-gray-200/80 bg-white/60 transition-colors hover:border-primary-300 dark:border-gray-800 dark:bg-gray-900/40 dark:hover:border-primary-800"
              >
                {p.image && <img src={p.image} alt={p.name} className="h-32 w-full object-cover" />}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{p.name}</h3>
                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => startEdit(p)} className="rounded p-1 text-gray-400 hover:text-primary-600" aria-label="Edit"><Pencil size={13} /></button>
                      <button onClick={() => remove(p)} className="rounded p-1 text-gray-400 hover:text-rose-500" aria-label="Delete"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  {p.duration && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-400"><Calendar size={11} /> {p.duration}</p>
                  )}
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">{p.description}</p>
                  {p.techStack?.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {p.techStack.slice(0, 6).map((t) => (
                        <span key={t} className="rounded-md bg-primary-600/10 px-2 py-0.5 text-[10px] font-semibold text-primary-600 dark:bg-primary-500/15 dark:text-primary-400">{t}</span>
                      ))}
                    </div>
                  )}
                  {p.achievements && (
                    <p className="mt-2.5 flex items-start gap-1.5 text-[11px] text-gray-500 dark:text-gray-400"><Trophy size={12} className="mt-0.5 shrink-0 text-amber-500" /> {p.achievements}</p>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    {p.github && <a href={p.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 transition-colors hover:text-primary-600 dark:text-gray-400"><Github size={13} /> Code</a>}
                    {p.liveDemo && <a href={p.liveDemo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 transition-colors hover:text-primary-600 dark:text-gray-400"><ExternalLink size={13} /> Live</a>}
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
        title={editing ? 'Edit Project' : 'Add Project'}
        subtitle="Projects make your profile stand out to recruiters"
        icon={FolderGit2}
        size="lg"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Project name">
            <TextInput value={form.name} onChange={set('name')} placeholder="e.g. PlaceX Placement Portal" autoFocus />
          </Field>
          <Field label="Duration">
            <TextInput value={form.duration} onChange={set('duration')} placeholder="e.g. Jan 2025 – Apr 2025" />
          </Field>
          <Field label="Tech stack" className="sm:col-span-2">
            <TextInput value={form.techStack} onChange={set('techStack')} placeholder="React, Node.js, PostgreSQL (comma separated)" />
          </Field>
          <Field label="GitHub link">
            <TextInput value={form.github} onChange={set('github')} placeholder="https://github.com/you/project" />
          </Field>
          <Field label="Live demo">
            <TextInput value={form.liveDemo} onChange={set('liveDemo')} placeholder="https://..." />
          </Field>
          <Field label="Cover image URL" className="sm:col-span-2">
            <TextInput value={form.image} onChange={set('image')} placeholder="https://.../screenshot.png (optional)" />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <TextArea rows={3} value={form.description} onChange={set('description')} placeholder="What does it do? What problem does it solve?" />
          </Field>
          <Field label="Achievements / impact" className="sm:col-span-2">
            <TextArea rows={2} value={form.achievements} onChange={set('achievements')} placeholder="e.g. Used by 500+ students, won hackathon 2nd place" />
          </Field>
        </div>
        <ButtonRow>
          <button onClick={() => setOpen(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
          <button onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-glass transition-all hover:-translate-y-px active:scale-95">
            <Star size={14} /> {editing ? 'Update Project' : 'Add Project'}
          </button>
        </ButtonRow>
      </Modal>
    </SectionCard>
  )
}