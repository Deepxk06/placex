import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Code2, Sparkles } from 'lucide-react'
import SectionCard, { EmptyState } from './SectionCard'
import Modal from './Modal'
import { Field, TextInput, ButtonRow } from './FormField'
import { useProfileStore } from '../../store/profileStore'
import { useToast } from '../ui/ToastProvider'
import { cn } from '../../utils/helpers'

const LEVELS = ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert']

const SUGGESTED = ['Python', 'Java', 'SQL', 'Machine Learning', 'Data Structures', 'React', 'Node.js', 'Git', 'AWS']

function LevelDots({ level }) {
  return (
    <span className="flex items-center gap-1" title={LEVELS[level - 1]}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={cn('h-1.5 w-3 rounded-full', i <= level ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700')} />
      ))}
    </span>
  )
}

export default function SkillsSection() {
  const { ext, addItem, updateItem, removeItem, moveItem } = useProfileStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [level, setLevel] = useState(3)
  const skills = ext?.skills || []

  const startAdd = (suggested) => {
    setEditing(null)
    setName(suggested || '')
    setLevel(3)
    setOpen(true)
  }

  const startEdit = (item) => {
    setEditing(item)
    setName(item.name)
    setLevel(item.level)
    setOpen(true)
  }

  const save = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast({ type: 'error', message: 'Enter a skill name' })
      return
    }
    if (editing) {
      updateItem('skills', editing.id, { name: trimmed, level }, `Skill "${trimmed}" updated`)
      toast({ type: 'success', message: 'Skill updated' })
    } else {
      addItem('skills', { name: trimmed, level }, `Skill "${trimmed}" added`)
      toast({ type: 'success', message: 'Skill added' })
    }
    setOpen(false)
  }

  const remove = (item) => {
    if (!window.confirm(`Remove skill "${item.name}"?`)) return
    removeItem('skills', item.id, `Skill "${item.name}" removed`)
  }

  return (
    <SectionCard
      id="sec-skills"
      icon={Code2}
      title="Skills"
      subtitle="Technical skills recruiters look for"
      action={
        <button onClick={() => startAdd()} className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600/10 px-3 py-1.5 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-600/20 dark:bg-primary-500/15 dark:text-primary-400">
          <Plus size={14} /> Add Skill
        </button>
      }
    >
      {skills.length === 0 ? (
        <EmptyState
          icon={Code2}
          title="No skills added yet"
          hint="Add Python, SQL, React — skills power your AI recommendations and job matches."
          action={
            <button onClick={() => startAdd()} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary-600 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-glass">
              <Plus size={14} /> Add your first skill
            </button>
          }
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {skills.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white/60 px-3 py-2 dark:border-gray-800 dark:bg-gray-900/40"
              >
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.name}</span>
                <LevelDots level={item.level || 3} />
                <span className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => moveItem('skills', item.id, -1)} disabled={i === 0} className="rounded p-0.5 text-gray-400 hover:text-primary-600 disabled:opacity-30" aria-label="Move up">
                    <ChevronUp size={13} />
                  </button>
                  <button onClick={() => moveItem('skills', item.id, 1)} disabled={i === skills.length - 1} className="rounded p-0.5 text-gray-400 hover:text-primary-600 disabled:opacity-30" aria-label="Move down">
                    <ChevronDown size={13} />
                  </button>
                  <button onClick={() => startEdit(item)} className="rounded p-0.5 text-gray-400 hover:text-primary-600" aria-label="Edit">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => remove(item)} className="rounded p-0.5 text-gray-400 hover:text-rose-500" aria-label="Delete">
                    <Trash2 size={13} />
                  </button>
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          <button onClick={() => startAdd()} className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:border-primary-400 hover:text-primary-500 dark:border-gray-700">
            <Plus size={14} /> Add
          </button>
        </div>
      )}

      {skills.length === 0 && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            <Sparkles size={12} /> Popular skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED.map((s) => (
              <button key={s} onClick={() => startAdd(s)} className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500 transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-gray-800 dark:text-gray-400">
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Skill' : 'Add Skill'}
        icon={Code2}
        footer
      >
        <Field label="Skill name">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Python" autoFocus />
        </Field>
        <Field label={`Proficiency — ${LEVELS[level - 1]}`} className="mt-4">
          <input type="range" min={1} max={5} value={level} onChange={(e) => setLevel(Number(e.target.value))} className="w-full accent-primary-600" />
        </Field>
        <ButtonRow>
          <button onClick={() => setOpen(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
            Cancel
          </button>
          <button onClick={save} className="rounded-xl bg-gradient-to-r from-primary-600 to-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-glass transition-all hover:-translate-y-px active:scale-95">
            {editing ? 'Update Skill' : 'Add Skill'}
          </button>
        </ButtonRow>
      </Modal>
    </SectionCard>
  )
}