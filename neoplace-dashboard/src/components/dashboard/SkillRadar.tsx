import { Radar as RadarIcon } from 'lucide-react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { radarData } from '../../data/mockData'
import { Card, CardHeader } from '../ui/Card'

export default function SkillRadar() {
  return (
    <Card id="skills-radar" hover>
      <CardHeader
        title="Skill Radar"
        subtitle="Your proficiency across key domains"
        action={<RadarIcon size={18} className="text-brand-500" />}
      />
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} outerRadius="78%">
            <defs>
              <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.25} />
              </linearGradient>
            </defs>
            <PolarGrid stroke="var(--chart-grid)" />
            <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Radar dataKey="value" stroke="#6366f1" fill="url(#radarFill)" strokeWidth={2} />
            <Tooltip
              contentStyle={{
                background: 'var(--tooltip-bg)',
                border: '1px solid rgba(148,163,184,0.3)',
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(value: number | string) => [`${value}%`, 'Proficiency']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
