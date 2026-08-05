import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { quickStats } from '../../data/mockData'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { Progress } from '../ui/Progress'

export default function StatsGrid() {
  return (
    <section aria-label="Quick statistics">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => {
          const Icon = stat.icon
          const pct = Math.round((stat.value / stat.target) * 100)
          const up = stat.trend >= 0
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
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-soft ${stat.gradient}`}>
                  <Icon size={20} />
                </div>
                <span
                  className={`flex items-center gap-0.5 text-xs font-bold ${
                    up ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {Math.abs(stat.trend)}%
                </span>
              </div>
              <p className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                <span className="ml-1 text-sm font-semibold text-slate-400">/{stat.target}</span>
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{stat.label}</p>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-slate-400">{pct}%</span>
                </div>
                <Progress value={pct} color={stat.barColor} />
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
