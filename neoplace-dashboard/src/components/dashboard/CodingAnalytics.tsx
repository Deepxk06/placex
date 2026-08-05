import { useMemo } from 'react'
import { Code2, Trophy, Flame } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { codingWeekly } from '../../data/mockData'
import { Card, CardHeader } from '../ui/Card'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { cn } from '../../utils/cn'

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function CodingAnalytics() {
  const heatmap = useMemo(() => {
    const rand = mulberry32(42)
    return Array.from({ length: 7 }, (_, day) =>
      Array.from({ length: 12 }, (_, week) => Math.floor(rand() * 5))
    )
  }, [])

  const intensity = ['bg-slate-200/60 dark:bg-slate-800/60', 'bg-sky-300 dark:bg-sky-900/60', 'bg-sky-400 dark:bg-sky-700', 'bg-sky-500 dark:bg-sky-500', 'bg-brand-600 dark:bg-brand-400']

  return (
    <Card id="coding" hover>
      <CardHeader
        title="Coding Analytics"
        subtitle="Your competitive programming progress"
        action={<Code2 size={18} className="text-brand-500" />}
      />

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'LeetCode Solved', value: 142, icon: Code2, color: 'from-orange-500 to-amber-500' },
          { label: 'HackerRank Score', value: 1180, icon: Trophy, color: 'from-emerald-500 to-teal-500' },
          { label: 'Contest Rating', value: 1648, icon: Flame, color: 'from-violet-500 to-purple-500' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-3.5">
            <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white ${s.color}`}>
              <s.icon size={15} />
            </div>
            <AnimatedNumber value={s.value} className="text-xl font-extrabold text-slate-900 dark:text-white" />
            <p className="text-[10px] font-semibold text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={codingWeekly} barSize={18}>
            <defs>
              <linearGradient id="codingBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
            <Tooltip
              cursor={{ fill: 'rgba(99,102,241,0.08)' }}
              contentStyle={{ background: 'var(--tooltip-bg)', border: '1px solid rgba(148,163,184,0.3)', borderRadius: 12, fontSize: 12 }}
              formatter={(value: number | string) => [`${value} problems`, 'Solved']}
            />
            <Bar dataKey="solved" fill="url(#codingBar)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Daily Heatmap — Last 12 weeks</p>
        <div className="flex flex-col gap-1">
          {heatmap.map((row, day) => (
            <div key={day} className="flex items-center gap-1">
              <span className="w-8 text-[9px] text-slate-400">{days[day]}</span>
              {row.map((level, week) => (
                <div
                  key={week}
                  title={`${days[day]} week ${week + 1}: ${level} problems`}
                  className={cn('h-3.5 w-3.5 rounded-[4px] transition-transform hover:scale-125', intensity[level])}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1.5 justify-end text-[9px] text-slate-400">
          Less
          {intensity.map((c, i) => (
            <span key={i} className={`h-2.5 w-2.5 rounded-[3px] ${c}`} />
          ))}
          More
        </div>
      </div>
    </Card>
  )
}
