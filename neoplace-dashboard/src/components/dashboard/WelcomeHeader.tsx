import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { CalendarDays, Clock, Target } from 'lucide-react'
import { FadeIn } from '../ui/AnimatedNumber'
import { Badge } from '../ui/Badge'
import { motivationalQuotes, student, todayGoal } from '../../data/mockData'

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

export default function WelcomeHeader() {
  const now = useNow()
  const [quoteIndex, setQuoteIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setQuoteIndex((i) => (i + 1) % motivationalQuotes.length), 10000)
    return () => clearInterval(t)
  }, [])

  const dateText = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const timeText = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <FadeIn>
      <div className="relative overflow-hidden rounded-2xl glass shadow-soft p-6 sm:p-8">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-brand-500/20 to-violet-500/20 blur-2xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Welcome back, {student.name} <span className="inline-block animate-bounce">👋</span>
              </h1>
              <Badge tone="success">🎯 Placement Ready</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} /> {dateText}
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                <Clock size={14} /> {timeText}
              </span>
              <span className="hidden sm:inline text-slate-400 dark:text-slate-500">{student.college}</span>
            </div>
            <div className="h-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={quoteIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm italic text-brand-600 dark:text-brand-400"
                >
                  {motivationalQuotes[quoteIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-4 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4 lg:min-w-[320px]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-glass">
              <Target size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today's Goal</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">{todayGoal}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </FadeIn>
  )
}
