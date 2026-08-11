import { motion } from 'framer-motion'
import { useState } from 'react'
import { ListChecks, Check } from 'lucide-react'
import { dashboardMock as mock } from '../../data/dashboardMock'
import { Card, CardHeader } from '../ui/Card'

export default function DailyGoals() {
  const [goals, setGoals] = useState(mock.dailyGoals)
  const done = goals.filter((g) => g.done).length

  const toggle = (id) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g)))
  }

  return (
    <Card id="goals" hover>
      <CardHeader
        title="Today's Goals"
        subtitle={`${done} of ${goals.length} completed`}
        action={<ListChecks size={18} className="text-primary-500" />}
      />
      <div className="space-y-2">
        {goals.map((goal, i) => (
          <motion.button
            key={goal.id}
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            onClick={() => toggle(goal.id)}
            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
              goal.done
                ? 'border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-500/10'
                : 'border-gray-200/70 dark:border-gray-800/70 hover:border-primary-500/40'
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                goal.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {goal.done && <Check size={12} strokeWidth={3} />}
            </span>
            <span
              className={`text-sm font-medium transition-colors ${
                goal.done ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              {goal.label}
            </span>
          </motion.button>
        ))}
      </div>
    </Card>
  )
}