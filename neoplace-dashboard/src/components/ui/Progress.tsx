import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

export function Progress({
  value,
  color = 'bg-brand-500',
  className,
  trackClassName,
}: {
  value: number
  color?: string
  className?: string
  trackClassName?: string
}) {
  return (
    <div
      className={cn(
        'h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/50',
        className,
        trackClassName
      )}
    >
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
