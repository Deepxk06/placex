import { motion } from 'framer-motion'
import { ArrowUpRight, BellRing } from 'lucide-react'
import { Link } from 'react-router-dom'
import { dashboardMock as mock } from '../../data/dashboardMock'
import { Card, CardHeader } from '../ui/Card'

export default function NotificationsPanel({ notifications = mock.notifications }) {
  return (
    <Card hover>
      <CardHeader
        title="Notifications"
        subtitle="Recent updates for you"
        action={
          <Link
            to="/settings"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
          >
            View all <ArrowUpRight size={13} />
          </Link>
        }
      />
      <div className="space-y-1">
        {notifications.slice(0, 3).map((n, i) => (
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