import { cn } from '../../utils/helpers'

export function Skeleton({ className }) {
  return (
    <div className={cn('relative overflow-hidden rounded-xl bg-gray-200/70 dark:bg-gray-800/60', className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />
    </div>
  )
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn('glass rounded-2xl p-6 shadow-soft', className)}>
      <Skeleton className="mb-4 h-5 w-2/5" />
      <Skeleton className="mb-2 h-3 w-full" />
      <Skeleton className="mb-6 h-3 w-4/5" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="mb-2 h-3 w-3/4" />
          <Skeleton className="h-2 w-1/2" />
        </div>
      </div>
    </div>
  )
}
