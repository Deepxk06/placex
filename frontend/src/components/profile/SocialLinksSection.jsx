import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, Linkedin, Globe, Link2, Check, X, Pencil } from 'lucide-react'
import SectionCard, { EmptyState } from './SectionCard'
import { useProfileStore } from '../../store/profileStore'
import { useToast } from '../ui/ToastProvider'
import { cn } from '../../utils/helpers'

const PLATFORMS = [
  { id: 'github', label: 'GitHub', color: 'bg-gray-800 text-white', Icon: Github },
  { id: 'linkedin', label: 'LinkedIn', color: 'bg-sky-600 text-white', Icon: Linkedin },
  { id: 'portfolio', label: 'Portfolio Website', color: 'bg-primary-600 text-white', Icon: Globe },
  { id: 'leetcode', label: 'LeetCode', color: 'bg-amber-500 text-white', iconText: 'LC' },
  { id: 'hackerrank', label: 'HackerRank', color: 'bg-emerald-600 text-white', iconText: 'HR' },
  { id: 'codechef', label: 'CodeChef', color: 'bg-yellow-500 text-white', iconText: 'CC' },
  { id: 'codeforces', label: 'Codeforces', color: 'bg-rose-600 text-white', iconText: 'CF' },
  { id: 'kaggle', label: 'Kaggle', color: 'bg-cyan-600 text-white', iconText: 'KG' },
  { id: 'medium', label: 'Medium', color: 'bg-gray-800 text-white', iconText: 'MD' },
  { id: 'devto', label: 'Dev.to', color: 'bg-gray-600 text-white', iconText: 'DEV' },
]

export default function SocialLinksSection() {
  const { ext, saveField } = useProfileStore()
  const { toast } = useToast()
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState('')
  const social = ext?.socialLinks || {}

  const startEdit = (id) => {
    setEditId(id)
    setDraft(social[id] || '')
  }

  const save = (id) => {
    const next = { ...social, [id]: draft.trim() }
    saveField('socialLinks', next, `Linked ${PLATFORMS.find((p) => p.id === id)?.label}`)
    toast({ type: 'success', message: 'Social link saved' })
    setEditId(null)
  }

  const remove = (id) => {
    const next = { ...social, [id]: '' }
    saveField('socialLinks', next, `Removed ${PLATFORMS.find((p) => p.id === id)?.label} link`)
    setEditId(null)
  }

  const filledCount = PLATFORMS.filter((p) => social[p.id]).length

  return (
    <SectionCard id="sec-social" icon={Link2} title="Social Links" subtitle={`${filledCount} of ${PLATFORMS.length} connected`}>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {PLATFORMS.map((p) => {
          const value = social[p.id]
          const editing = editId === p.id
          const Icon = p.Icon
          return (
            <div key={p.id} className="flex items-center gap-2.5 rounded-xl border border-gray-200/80 px-3 py-2.5 dark:border-gray-800">
              {p.Icon ? (
                <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', p.color)}>
                  <Icon size={15} />
                </span>
              ) : (
                <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold', p.color)}>{p.iconText}</span>
              )}
              <span className="hidden w-24 shrink-0 text-xs font-semibold text-gray-600 sm:block dark:text-gray-300">{p.label}</span>
              {editing ? (
                <>
                  <input
                    autoFocus
                    aria-label={`${p.label} URL`}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && save(p.id)}
                    placeholder={`https://${p.id}.com/...`}
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/60 dark:border-gray-700 dark:bg-gray-900"
                  />
                  <button onClick={() => save(p.id)} className="rounded-lg bg-emerald-500 p-1.5 text-white" aria-label="Save"><Check size={13} /></button>
                  <button onClick={() => setEditId(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Cancel"><X size={13} /></button>
                </>
              ) : value ? (
                <>
                  <a href={value} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-xs text-primary-600 hover:underline">{value.replace(/^https?:\/\//, '')}</a>
                  <button onClick={() => startEdit(p.id)} className="rounded p-1 text-gray-400 hover:text-primary-600" aria-label="Edit"><Pencil size={13} /></button>
                  <button onClick={() => remove(p.id)} className="rounded p-1 text-gray-400 hover:text-rose-500" aria-label="Remove"><X size={13} /></button>
                </>
              ) : (
                <button onClick={() => startEdit(p.id)} className="flex-1 rounded-lg text-left text-xs text-gray-400 transition-colors hover:text-primary-500">
                  + Add link
                </button>
              )}
            </div>
          )
        })}
      </div>
      {filledCount === 0 && (
        <div className="mt-4">
          <EmptyState icon={Link2} title="Connect your profiles" hint="LinkedIn, GitHub and LeetCode links make your profile credible and visible to recruiters." />
        </div>
      )}
    </SectionCard>
  )
}