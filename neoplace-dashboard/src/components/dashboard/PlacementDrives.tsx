import { CalendarClock, ExternalLink, Eye } from 'lucide-react'
import { placementDrives } from '../../data/mockData'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

function daysUntil(dateStr: string) {
  const target = new Date(dateStr).getTime()
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.max(0, Math.ceil((target - today) / 86400000))
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function PlacementDrives() {
  return (
    <Card id="drives" hover>
      <CardHeader
        title="Upcoming Placement Drives"
        subtitle="On-campus recruitment schedule"
        action={<CalendarClock size={18} className="text-brand-500" />}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {placementDrives.map((drive, i) => {
          const days = daysUntil(drive.date)
          return (
            <div
              key={drive.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-4 hover:border-brand-500/40 hover:shadow-soft transition-all duration-300"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-gradient-to-br from-brand-500/10 to-violet-500/10" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-white text-sm font-extrabold ${drive.color}`}>
                      {drive.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{drive.company}</p>
                      <p className="text-[11px] text-slate-400">{drive.role}</p>
                    </div>
                  </div>
                  <Badge tone={days <= 7 ? 'danger' : days <= 15 ? 'warning' : 'info'}>
                    {days === 0 ? 'Today' : `${days} days left`}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                    <CalendarClock size={13} className="text-brand-500" /> {formatDate(drive.date)}
                  </span>
                  <span className="text-slate-400">{drive.eligibility}</span>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button size="sm" className="flex-1">Apply Now</Button>
                  <Button size="sm" variant="outline"><Eye size={14} /> Details</Button>
                  <Button size="sm" variant="ghost" aria-label="External link"><ExternalLink size={14} /></Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
