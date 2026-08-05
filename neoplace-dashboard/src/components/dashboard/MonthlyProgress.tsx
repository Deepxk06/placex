import { BarChart3, TrendingUp } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { trends } from '../../data/mockData'
import { Card, CardHeader } from '../ui/Card'

const tooltipStyle = {
  background: 'var(--tooltip-bg)',
  border: '1px solid rgba(148,163,184,0.3)',
  borderRadius: 12,
  fontSize: 12,
} as const

const chartTitle = 'text-xs font-bold text-slate-600 dark:text-slate-300 mb-2'

export default function MonthlyProgress() {
  return (
    <Card hover>
      <CardHeader
        title="Monthly Progress Analytics"
        subtitle="Your growth over the last 7 months"
        action={<BarChart3 size={18} className="text-brand-500" />}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className={chartTitle}>Resume Score Trend</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={26} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="resume" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className={chartTitle}>Placement Score Trend</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="placeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={26} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="placement" stroke="#6366f1" strokeWidth={2.5} fill="url(#placeGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className={chartTitle}>Coding & Skill Growth</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={26} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="coding" name="Coding" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="skills" name="Skills" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className={chartTitle}>Applications & Interviews</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} barGap={4}>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={26} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="applications" name="Applications" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="interviews" name="Interviews" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-3">
        <TrendingUp size={15} className="shrink-0 text-emerald-500" />
        <p className="text-xs text-slate-600 dark:text-slate-300">
          You're growing <strong className="text-emerald-500">+23 points</strong> in placement readiness since January —
          nearly 2× the average student pace.
        </p>
      </div>
    </Card>
  )
}
