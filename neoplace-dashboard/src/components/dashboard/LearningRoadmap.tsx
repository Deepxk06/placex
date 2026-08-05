import { Map, PlayCircle, Clock3 } from 'lucide-react'
import { learningRoadmap } from '../../data/mockData'
import { Card, CardHeader } from '../ui/Card'
import { Progress } from '../ui/Progress'
import { Button } from '../ui/Button'

export default function LearningRoadmap() {
  return (
    <Card id="roadmap" hover className="p-0 overflow-hidden">
      <div className="p-6 pb-0">
        <CardHeader
          title="Personalized Learning Roadmap"
          subtitle="Picked for your target role: Software Engineer"
          action={<Map size={18} className="text-brand-500" />}
        />
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {learningRoadmap.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-4 hover:border-brand-500/40 hover:shadow-soft transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-soft ${item.color}`}>
                <PlayCircle size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{item.title}</p>
                  <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400">{item.progress}%</span>
                </div>
                <Progress value={item.progress} color={item.color} className="mt-1.5" trackClassName="h-1.5" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">Next: {item.nextLesson}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock3 size={10} /> {item.time}
                </p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0">Continue</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
