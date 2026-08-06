import { motion } from 'framer-motion'
import { Workflow } from 'lucide-react'
import { dashboardMock as mock } from '../../data/dashboardMock'
import { Card, CardHeader } from '../ui/Card'
import { cn } from '../../utils/helpers'

export default function PlacementTimeline() {
  return (
    <Card id="timeline" hover>
      <CardHeader
        title="Placement Timeline"
        subtitle="Where you stand in the hiring cycle"
        action={<Workflow size={18} className="text-primary-500" />}
      />
      <div className="flex items-start justify-between">
        {mock.timelineSteps.map((step, i) => {
          const Icon = step.icon
          const isLast = i === mock.timelineSteps.length - 1
          return (
            <div key={step.id} className="flex flex-1 items-start">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
                  className={cn(
                    'relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-soft',
                    step.status === 'completed' && 'border-primary-500 bg-primary-500 text-white',
                    step.status === 'current' && 'border-primary-500 bg-white text-primary-600 animate-pulse-ring dark:bg-gray-900',
                    step.status === 'upcoming' && 'border-gray-200 bg-white text-gray-300 dark:border-gray-700 dark:bg-gray-900'
                  )}
                >
                  <Icon size={18} />
                </motion.div>
                <p
                  className={cn(
                    'mt-2 text-center text-[11px] font-bold leading-tight',
                    step.status === 'completed' && 'text-gray-700 dark:text-gray-200',
                    step.status === 'current' && 'text-primary-600 dark:text-primary-400',
                    step.status === 'upcoming' && 'text-gray-400'
                  )}
                >
                  {step.label}
                </p>
                <p className="mt-0.5 text-center text-[10px] text-gray-400">{step.date}</p>
              </div>
              {!isLast && (
                <div className="mt-5 h-0.5 flex-1 bg-gray-200 dark:bg-gray-800 mx-1 rounded-full overflow-hidden">
                  {step.status === 'completed' && (
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-primary-500 to-sky-500"
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}