import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
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
        action={
          <Link
            to="/placement-prediction"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
          >
            View full analytics <ArrowUpRight size={13} />
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className={chartTitle}>Applications per Month</p>
          <div className="h-36">
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
          <p className={chartTitle}>Score Trends (Coding · Resume · Interview)</p>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mock.monthlyAnalytics}>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={axisTick} axisLine={false} tickLine={false} width={26} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="coding" name="Coding score" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="resume" name="Resume score" stroke="#0ea5e9" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="interview" name="Interview score" stroke="#8b5cf6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  )
}