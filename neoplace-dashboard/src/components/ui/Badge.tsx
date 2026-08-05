import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

const tones: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  danger: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400',
  brand: 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: keyof typeof tones
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  )
}
