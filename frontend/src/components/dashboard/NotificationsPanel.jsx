import { motion } from 'framer-motion'
import { BellRing, CheckCheck } from 'lucide-react'
import { useState } from 'react'
import { dashboardMock as mock } from '../../data/dashboardMock'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'

export default function NotificationsPanel({ notifications = mock.notifications }) {
  const [items, setItems] = useState(notifications)

  return (
    <Card hover>
      <CardHeader
        title="Notifications"
        subtitle="Recent updates for you"
        action={
          <Button variant="ghost" size="sm" onClick={() => setItems(items.map((i) => ({ ...i, time: 'now' })))}>
            <CheckCheck size={14} /> Mark all read
          </Button>
        }
      />
      <div className="space-y-1">
        {items.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-soft ${n.color}`}>
              <n.icon size={14} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs leading-snug text-gray-700 dark:text-gray-200">{n.text}</p>
              <p className="mt-0.5 text-[10px] text-gray-400">{n.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}