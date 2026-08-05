import { motion } from 'framer-motion'
import { GripVertical, Briefcase, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { initialApplications } from '../../data/mockData'
import type { Application, ColumnId } from '../../types'
import { Card, CardHeader } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/cn'

const columns: { id: ColumnId; label: string; accent: string }[] = [
  { id: 'applied', label: 'Applied', accent: 'bg-sky-500' },
  { id: 'assessment', label: 'Assessment', accent: 'bg-amber-500' },
  { id: 'technical', label: 'Technical Interview', accent: 'bg-violet-500' },
  { id: 'hr', label: 'HR Interview', accent: 'bg-brand-500' },
  { id: 'offer', label: 'Offer', accent: 'bg-emerald-500' },
  { id: 'rejected', label: 'Rejected', accent: 'bg-rose-500' },
]

export default function ApplicationTracker() {
  const [board, setBoard] = useState<Record<ColumnId, Application[]>>(initialApplications)
  const [dragId, setDragId] = useState<string | null>(null)
  const [overColumn, setOverColumn] = useState<ColumnId | null>(null)

  const handleDrop = (target: ColumnId) => {
    if (!dragId) return
    setBoard((prev) => {
      const next: Record<ColumnId, Application[]> = { ...prev }
      let dragged: Application | undefined
      ;(Object.keys(next) as ColumnId[]).forEach((col) => {
        next[col] = next[col].filter((app) => {
          if (app.id === dragId) {
            dragged = app
            return false
          }
          return true
        })
      })
      if (dragged) next[target] = [dragged, ...next[target]]
      return next
    })
    setDragId(null)
    setOverColumn(null)
  }

  return (
    <Card id="applications" hover>
      <CardHeader
        title="Application Tracker"
        subtitle="Drag & drop applications across stages"
        action={<Briefcase size={18} className="text-brand-500" />}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto pb-2">
        {columns.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault()
              setOverColumn(col.id)
            }}
            onDragLeave={() => setOverColumn((c) => (c === col.id ? null : c))}
            onDrop={() => handleDrop(col.id)}
            className={cn(
              'flex min-w-[180px] flex-col rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 p-2.5 border border-transparent transition-colors',
              overColumn === col.id && 'border-brand-500/50 bg-brand-500/5'
            )}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                <span className={`h-2 w-2 rounded-full ${col.accent}`} />
                {col.label}
              </span>
              <Badge tone="neutral">{board[col.id].length}</Badge>
            </div>
            <div className="space-y-2">
              {board[col.id].map((app) => (
                <motion.div
                  key={app.id}
                  layout
                  draggable
                  onDragStart={() => setDragId(app.id)}
                  onDragEnd={() => {
                    setDragId(null)
                    setOverColumn(null)
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    'group cursor-grab rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 p-3 shadow-soft active:cursor-grabbing',
                    dragId === app.id && 'opacity-50'
                  )}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{app.company}</p>
                      <p className="text-[10px] text-slate-400 truncate">{app.role}</p>
                    </div>
                    <GripVertical size={13} className="shrink-0 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{app.date}</span>
                    <ChevronRight size={12} className="text-slate-300" />
                  </div>
                </motion.div>
              ))}
              {board[col.id].length === 0 && (
                <p className="py-4 text-center text-[10px] text-slate-400">Drop here</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
