import { motion } from 'framer-motion'
import { dashboardMock as mock } from '../../data/dashboardMock'
import { Card, CardHeader } from '../ui/Card'

export default function QuickActions() {
  return (
    <Card hover>
      <CardHeader title="Quick Actions" subtitle="Jump straight into your next step" />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {mock.quickActions.map((action, i) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-200/70 dark:border-gray-800/70 p-5 text-center hover:border-primary-500/40 hover:shadow-soft transition-all duration-300"
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-soft transition-transform group-hover:scale-110 ${action.gradient}`}>
              <action.icon size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-white">{action.label}</p>
              <p className="mt-0.5 text-[11px] text-gray-400">{action.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </Card>
  )
}