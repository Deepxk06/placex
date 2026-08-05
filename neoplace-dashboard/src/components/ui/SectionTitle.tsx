import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export function SectionTitle({
  icon,
  title,
  className,
}: {
  icon?: ReactNode
  title: string
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {icon && <span className="text-brand-500">{icon}</span>}
      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
    </div>
  )
}
