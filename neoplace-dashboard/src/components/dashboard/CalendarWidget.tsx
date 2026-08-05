import { CalendarDays } from 'lucide-react'
import { calendarEvents } from '../../data/mockData'
import type { EventType } from '../../types'
import { Card, CardHeader } from '../ui/Card'
import { cn } from '../../utils/cn'

const typeMeta: Record<EventType, { label: string; dot: string; bg: string }> = {
  interview: { label: 'Interview', dot: 'bg-violet-500', bg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  drive: { label: 'Drive', dot: 'bg-brand-500', bg: 'bg-brand-500/10 text-brand-600 dark:text-brand-400' },
  contest: { label: 'Contest', dot: 'bg-emerald-500', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  certification: { label: 'Certification', dot: 'bg-amber-500', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  mock: { label: 'Mock', dot: 'bg-rose-500', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
}

export default function CalendarWidget() {
  const month = new Date().getMonth()
  const year = new Date().getFullYear()
  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date().getDate()

  const eventByDay = new Map<number, EventType[]>()
  calendarEvents.forEach((e) => {
    const d = new Date(e.date)
    if (d.getMonth() === month && d.getFullYear() === year) {
      const list = eventByDay.get(d.getDate()) ?? []
      list.push(e.type)
      eventByDay.set(d.getDate(), list)
    }
  })

  return (
    <Card hover>
      <CardHeader
        title="Calendar"
        subtitle={monthName}
        action={<CalendarDays size={18} className="text-brand-500" />}
      />

      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} className="text-[9px] font-bold text-slate-400 py-1">{d}</span>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <span key={`e${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const events = eventByDay.get(day) ?? []
          const isToday = day === today
          return (
            <div
              key={day}
              title={events.map((t) => typeMeta[t].label).join(', ')}
              className={cn(
                'relative mx-auto flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-semibold',
                isToday
                  ? 'bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-glass'
                  : events.length > 0
                    ? 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800'
                    : 'text-slate-400'
              )}
            >
              {day}
              {events.length > 0 && !isToday && (
                <span className="absolute -bottom-0.5 flex gap-0.5">
                  {events.slice(0, 3).map((t, j) => (
                    <span key={j} className={`h-1 w-1 rounded-full ${typeMeta[t].dot}`} />
                  ))}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 space-y-2">
        {calendarEvents.slice(0, 4).map((e) => {
          const meta = typeMeta[e.type]
          const date = new Date(e.date)
          return (
            <div key={e.id} className="flex items-center gap-3 rounded-xl border border-slate-200/70 dark:border-slate-800/70 p-2.5 hover:border-brand-500/40 transition-colors">
              <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <span className="text-xs font-extrabold leading-none text-slate-800 dark:text-white">{date.getDate()}</span>
                <span className="text-[8px] font-bold uppercase text-slate-400">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">{e.title}</p>
              </div>
              <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold', meta.bg)}>{meta.label}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
