import { CalendarClock, CalendarX, IndianRupee, CircleCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { dashboardMock as mock } from '../../data/dashboardMock'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

function daysUntil(dateStr) {
  const target = new Date(dateStr).getTime()
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.max(0, Math.ceil((target - today) / 86400000))
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function PlacementDrives({ drives = mock.drives }) {
  const navigate = useNavigate()
  const upcoming = drives
    .filter((d) => daysUntil(d.deadline) > 0 || daysUntil(d.date) >= 0)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))

  if (upcoming.length === 0) {
    return (
      <Card id="drives" hover>
        <CardHeader title="Upcoming Placement Drives" subtitle="On-campus recruitment schedule" />
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <CalendarX size={32} className="text-gray-300" />
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">No upcoming drives right now</p>
          <p className="text-xs text-gray-400">New drives will appear here when announced.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card id="drives" hover>
      <CardHeader
        title="Upcoming Placement Drives"
        subtitle="Sorted by application deadline — apply before time runs out"
        action={<CalendarClock size={18} className="text-primary-500" />}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {upcoming.map((drive) => {
          const days = daysUntil(drive.date)
          const urgent = days <= 7
          return (
            <div
              key={drive.id}
              className={`group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
                urgent
                  ? 'border-rose-300/70 dark:border-rose-500/40 ring-1 ring-rose-400/30 shadow-soft'
                  : 'border-gray-200/70 dark:border-gray-800/70 hover:border-primary-500/40 hover:shadow-soft'
              }`}
            >
              {urgent && (
                <div className="absolute left-0 top-4 h-6 w-1 rounded-r-full bg-gradient-to-b from-rose-500 to-red-400" />
              )}
              <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-gradient-to-br from-primary-500/10 to-sky-500/10" />
              <div className="relative">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-white text-sm font-extrabold ring-1 ring-gray-900/5 ${drive.color}`}>
                      {drive.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-800 dark:text-white">{drive.company}</p>
                      <p className="truncate text-[11px] text-gray-400">{drive.role}</p>
                    </div>
                  </div>
                  <Badge tone={days <= 7 ? 'danger' : days <= 15 ? 'warning' : 'info'}>
                    {days === 0 ? 'Today' : `${days} days left`}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Package</p>
                    <p className="mt-0.5 flex items-center gap-1 font-bold text-gray-800 dark:text-white">
                      <IndianRupee size={12} className="text-emerald-500" /> {drive.package}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Eligibility</p>
                    <p className="mt-0.5 flex items-center gap-1 font-medium text-gray-600 dark:text-gray-300">
                      <CircleCheck size={12} className="text-primary-500" /> {drive.eligibility}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3 text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-gray-600 dark:text-gray-300">
                    <CalendarClock size={13} className="text-primary-500" /> Deadline: {formatDate(drive.deadline)}
                  </span>
                  {urgent && <Badge tone="danger">Closing soon</Badge>}
                </div>

                <div className="mt-3">
                  <Button size="sm" className="w-full" onClick={() => navigate('/jobs')}>Apply Now</Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}