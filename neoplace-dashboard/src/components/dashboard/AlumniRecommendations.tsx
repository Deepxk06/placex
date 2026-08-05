import { Users, UserPlus, Route } from 'lucide-react'
import { alumni } from '../../data/mockData'
import { Card, CardHeader } from '../ui/Card'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

export default function AlumniRecommendations() {
  return (
    <Card id="alumni" hover>
      <CardHeader
        title="Alumni Recommendations"
        subtitle="Alumni with similar profiles"
        action={<Users size={18} className="text-brand-500" />}
      />
      <div className="space-y-3">
        {alumni.map((alum) => (
          <div
            key={alum.id}
            className="group rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-3.5 hover:border-brand-500/40 hover:shadow-soft transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <Avatar initials={alum.initials} color={alum.color} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 dark:text-white">{alum.name}</p>
                <p className="truncate text-[11px] text-slate-400">
                  {alum.role} · {alum.company}
                </p>
              </div>
              <Badge tone="brand">{alum.similarity}% similar</Badge>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Route size={13} /> View Journey
              </Button>
              <Button size="sm" className="flex-1">
                <UserPlus size={13} /> Connect
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
