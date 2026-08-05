import { motion } from 'framer-motion'
import { BellRing, CheckCheck } from 'lucide-react'
import { useState } from 'react'
import { notifications as initialNotifications } from '../../data/mockData'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'

export default function NotificationsPanel() {
  const [items, setItems] = useState(initialNotifications)

  return (
    <Card hover>
      <CardHeader
        title="Recent Activity"
        subtitle="Latest updates on your journey"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setItems(items.map((i) => ({ ...i, time: 'now' })))}
          >
            <CheckCheck size={14} /> Mark all read
          </Button>
        }
      />
      <div className="relative">
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-1">
          {items.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
              className="relative flex items-start gap-3 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
            >
              <span className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-soft ${n.color}`}>
                <n.icon size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-snug text-slate-700 dark:text-slate-200">{n.text}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">{n.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  )
}
