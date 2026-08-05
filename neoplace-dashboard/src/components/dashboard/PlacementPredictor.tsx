import { TrendingUp, ThumbsUp, ThumbsDown, ArrowUpCircle } from 'lucide-react'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Progress } from '../ui/Progress'
import { Badge } from '../ui/Badge'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { predictorFactors, strengths, weaknesses, skillGapFactors } from '../../data/mockData'

const impactTone = { high: 'danger', medium: 'warning', low: 'neutral' } as const

export default function PlacementPredictor() {
  return (
    <Card id="predictor" className="relative overflow-hidden" hover>
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-500/15 to-teal-500/15 blur-3xl" />
      <CardHeader
        title="Placement Probability Predictor"
        subtitle="AI model forecast based on your profile"
        action={<TrendingUp size={18} className="text-emerald-500" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 relative flex flex-col items-center justify-center rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-transparent p-6">
          <div className="relative flex h-40 w-40 items-center justify-center">
            <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
              <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="12" />
              <MotionCircle />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatedNumber value={84} suffix="%" className="text-5xl font-extrabold text-emerald-500" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Probability</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Badge tone="success">Confidence: High</Badge>
            <Badge tone="info">Model v2.4</Badge>
          </div>
          <p className="mt-3 text-center text-[11px] text-slate-400">Predicted CTC: ₹6.8 – 9.5 LPA</p>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Factors affecting your score</p>
            <div className="flex flex-wrap gap-1.5">
              {skillGapFactors.map((f) => (
                <Badge key={f.factor} tone={impactTone[f.impact]}>{f.factor}</Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {predictorFactors.map((f) => (
              <div key={f.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{f.label}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{f.value}/{f.max}</span>
                </div>
                <Progress value={(f.value / f.max) * 100} color={f.color} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <ThumbsUp size={13} /> Strengths
              </p>
              <ul className="space-y-1">
                {strengths.map((s) => (
                  <li key={s} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-500" /> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-rose-500">
                <ThumbsDown size={13} /> Weaknesses
              </p>
              <ul className="space-y-1">
                {weaknesses.map((s) => (
                  <li key={s} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-rose-500" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Button size="md" className="w-full sm:w-auto">
            <ArrowUpCircle size={15} /> Improve My Score
          </Button>
        </div>
      </div>
    </Card>
  )
}

function MotionCircle() {
  return <circle cx="80" cy="80" r="68" fill="none" stroke="#10b981" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(84 / 100) * 427.2} 427.2`} className="animate-[dash_1.5s_ease-out]" />
}
