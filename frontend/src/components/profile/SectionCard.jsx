import { Card } from '../ui/Card'
import { cn } from '../../utils/helpers'

export default function SectionCard({ id, icon: Icon, title, subtitle, action, children, className, delay = 0 }) {
  return (
    <Card id={id} delay={delay} className={cn('scroll-mt-24', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600/10 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400">
              <Icon size={17} />
            </span>
          )}
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </Card>
  )
}

export function EmptyState({ icon: Icon, title, hint, action, compact = true }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'py-8' : 'py-14')}>
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800">
        <Icon size={22} />
      </div>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-xs text-gray-400">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}