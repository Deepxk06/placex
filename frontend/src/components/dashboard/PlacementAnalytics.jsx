import { BarChart3 } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { dashboardMock as mock } from '../../data/dashboardMock'
import { Card, CardHeader } from '../ui/Card'

const tooltipStyle = {
  background: 'var(--tooltip-bg)',
  border: '1px solid rgba(148,163,184,0.3)',
  borderRadius: 12,
  fontSize: 12,
}

const chartTitle = 'text-xs font-bold text-gray-600 dark:text-gray-300 mb-2'
const axisTick = { fill: '#94a3b8', fontSize: 10 }

export default function PlacementAnalytics() {
  return (
    <Card id="analytics" hover>
      <CardHeader
        title="Placement Analytics"
        subtitle="Your performance over the last 7 months"
        action={<BarChart3 size={18} className="text-primary-500" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className={chartTitle}>Applications per Month</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mock.monthlyAnalytics} barSize={18}>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} width={26} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(245,158,11,0.08)' }} />
                <Bar dataKey="applications" name="Applications" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className={chartTitle}>Coding Score Trend</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mock.monthlyAnalytics}>
                <defs>
                  <linearGradient id="codingTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={axisTick} axisLine={false} tickLine={false} width={26} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="coding" name="Coding score" stroke="#10b981" strokeWidth={2.5} fill="url(#codingTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className={chartTitle}>Resume Score Trend</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mock.monthlyAnalytics}>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={axisTick} axisLine={false} tickLine={false} width={26} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="resume" name="Resume score" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className={chartTitle}>Interview Performance</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mock.interviewPerformance} barSize={22}>
                <defs>
                  <linearGradient id="interviewGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.55} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="attempt" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={axisTick} axisLine={false} tickLine={false} width={26} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(139,92,246,0.08)' }} />
                <Bar dataKey="score" name="Score" fill="url(#interviewGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  )
}