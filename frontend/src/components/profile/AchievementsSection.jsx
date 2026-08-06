import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Trophy, Pencil } from 'lucide-react'
import SectionCard, { EmptyState } from './SectionCard'
import { Field, TextInput, SelectInput } from './FormField'
import { useProfileStore } from '../../store/profileStore'
import { useToast } from '../ui/ToastProvider'
import { cn } from '../../utils/helpers'

const TYPES = [
  'Hackathon', 'Coding Contest', 'Sports', 'Paper Presentation', 'Award', 'Open Source Contribution',
]

const TYPE_STYLES = {
  Hackathon: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  'Coding Contest': 'bg-primary-600/10 text-primary-600 dark:text-primary-400',
  Sports: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'Paper Presentation': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Award: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  'Open Source Contribution': 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
}

export default function AchievementsSection() {
  const { ext, addItem, updateItem, removeItem } = useProfileStore()
  const { toast } = useToast()
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [type, setType] = useState(TYPES[0])
  const [date, setDate] = useState('')
  const achievements = ext?.achievements || []

  const startAdd = () => {
    setEditingId(null)
    setTitle('')
    setType(TYPES[0])
    setDate('')
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setTitle(item.title)
    setType(item.type)
    setDate(item.date || '')
  }

  const save = () => {
    if (!title.trim()) {
      toast({ type: 'error', message: 'Describe your achievement' })
      return
    }
    if (editingId) {
      updateItem('achievements', editingId, { title: title.trim(), type, date }, `Achievement "${title}" updated`)
      toast({ type: 'success', message: 'Achievement updated' })
    } else {
      addItem('achievements', { title: title.trim(), type, date }, `Achievement "${title}" added`)
      toast({ type: 'success', message: 'Achievement added' })
    }
    startAdd()
  }

  return (
    <SectionCard id="sec-achievements" icon={Trophy} title="Achievements" subtitle="Hackathons, contests, awards & more">
      {/* Inline add/edit form */}
      <div className="mb-4 rounded-2xl border border-dashed border-gray-300 p-4 dark:border-gray-700">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px_140px_auto]">
          <Field label="Achievement">
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 2nd place, Smart India Hackathon 2025" />
          </Field>
          <Field label="Type">
            <SelectInput value={type} onChange={(e) => setType(e.target.value)} options={TYPES} />
          </Field>
          <Field label="Date">
            <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <div className="flex items-end">
            <button
              onClick={save}
              className={cn('inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-glass transition-all hover:-translate-y-px active:scale-95', editingId ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-primary-600 to-sky-500')}
            >
              <Plus size={15} /> {editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
        {editingId && (
          <button onClick={startAdd} className="mt-2 text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            Cancel edit
          </button>
        )}
      </div>

      {achievements.length === 0 ? (
        <EmptyState icon={Trophy} title="No achievements yet" hint="Won a hackathon? Cracked a contest? Add it here." />
      ) : (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {achievements.map((a) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white/60 px-3 py-2 dark:border-gray-800 dark:bg-gray-900/40"
              >
                <span className={cn('rounded-lg px-2 py-0.5 text-[10px] font-bold', TYPE_STYLES[a.type] || TYPE_STYLES.Award)}>{a.type}</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{a.title}</span>
                {a.date && <span className="text-[10px] text-gray-400">{a.date}</span>}
                <span className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => startEdit(a)} className="rounded p-0.5 text-gray-400 hover:text-primary-600" aria-label="Edit"><Pencil size={12} /></button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this achievement?')) {
                        removeItem('achievements', a.id, `Achievement "${a.title}" removed`)
                      }
                    }}
                    className="rounded p-0.5 text-gray-400 hover:text-rose-500"
                    aria-label="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </SectionCard>
  )
}