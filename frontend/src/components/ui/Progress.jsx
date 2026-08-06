import { motion } from 'framer-motion'
import { cn } from '../../utils/helpers'

export function Progress({ value, color = 'bg-primary-500', className, trackClassName }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-gray-200/80 dark:bg-gray-700/50', className, trackClassName)}>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className={cn('h-full rounded-full', color)}
      />
    </div>
  )
}
