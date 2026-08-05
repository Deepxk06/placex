import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label?: string
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow',
          checked ? 'left-[22px]' : 'left-0.5'
        )}
      />
    </button>
  )
}
