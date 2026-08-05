import { Gauge } from 'lucide-react'
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { readinessItems } from '../../data/mockData'
import { Card, CardHeader } from '../ui/Card'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { Progress } from '../ui/Progress'

const scoreColor = (score: number) =>
  score >= 80 ? '#10b981' : score >= 65 ? '#6366f1' : score >= 50 ? '#f59e0b' : '#f43f5e'

const barColors: Record<string, string> = {
  'text-sky-500': 'bg-sky-500',
  'text-emerald-500': 'bg-emerald-500',
  'text-amber-500': 'bg-amber-500',
  'text-rose-500': 'bg-rose-500',
  'text-violet-500': 'bg-violet-500',
  'text-brand-500': 'bg-brand-500',
}

export default function ReadinessMeter() {
  const overall = readinessItems[0].score
  const data = [{ value: overall, fill: scoreColor(overall) }]

  return (
    <Card>
      <CardHeader title="Placement Readiness" subtitle="Overall readiness meter" action={<Gauge size={18} className="text-brand-500" />} />
      <div className="relative mx-auto h-52 w-52">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="78%"
            outerRadius="100%"
            barSize={14}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={14} background={{ fill: 'rgba(148,163,184,0.15)' }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedNumber value={overall} className="text-5xl font-extrabold text-slate-900 dark:text-white" />
          <p className="text-xs font-semibold text-slate-400 mt-1">/ 100 · Ready</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {readinessItems.slice(1).map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300">{item.label}</span>
              <span className={`font-bold ${item.color}`}>{item.score}%</span>
            </div>
            <Progress value={item.score} color={barColors[item.color] ?? 'bg-brand-500'} />
          </div>
        ))}
      </div>
    </Card>
  )
}
