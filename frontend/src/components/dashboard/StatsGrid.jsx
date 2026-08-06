import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { dashboardMock as mock } from '../../data/dashboardMock'
import { AnimatedNumber } from '../ui/AnimatedNumber'

export default function StatsGrid({ statCards = mock.statCards }) {
  return (
    <section aria-label="Placement statistics" className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat, i) => {
        const Icon = stat.icon
        const up = stat.trend >= 0
        const isCount = stat.suffix === ''
        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.45, delay: i * 0.06, ease: 'easeOut' }}
            whileHover={{ y: -5 }}
            className="glass card-hover rounded-2xl p-5 shadow-soft"
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-soft ${stat.gradient}`}>
                <Icon size={18} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-bold ${up ? 'text-emerald-500' : 'text-rose-500'}`}>
                {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {Math.abs(stat.trend)}%
              </span>
            </div>
            <p className="mt-4 text-2xl font-extrabold text-gray-900 dark:text-white">
              <AnimatedNumber value={stat.value} suffix={isCount ? '' : '%'} />
            </p>
            <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
          </motion.div>
        )
      })}
    </section>
  )
}