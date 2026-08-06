import { motion } from 'framer-motion'
import { History } from 'lucide-react'
import { dashboardMock as mock } from '../../data/dashboardMock'
import { Card, CardHeader } from '../ui/Card'

export default function RecentActivity({ items = mock.recentActivity }) {
  return (
    <Card hover>
      <CardHeader
        title="Recent Activity"
        subtitle="Newest activity first"
        action={<History size={18} className="text-primary-500" />}
      />
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No activity yet. Start by uploading your resume!</p>
      ) : (
        <div className="relative">
          <div className="absolute left-[17px] top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-800" />
          <div className="space-y-1">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.35 }}
                className="group relative flex items-start gap-3 rounded-xl p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-soft ${item.color}`}>
                  <item.icon size={13} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{item.title}</p>
                  {item.description && <p className="mt-0.5 truncate text-[11px] text-gray-400">{item.description}</p>}
                </div>
                <span className="shrink-0 text-[10px] font-medium text-gray-400">{item.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}