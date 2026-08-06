import { cn } from '../../utils/helpers'

export function Avatar({ initials, color = 'bg-gradient-to-br from-primary-500 to-sky-600', size = 'md', className, src }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base', xl: 'h-20 w-20 text-xl' }
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-bold text-white shrink-0 ring-2 ring-white dark:ring-gray-800',
        sizes[size],
        color,
        className
      )}
    >
      {src ? <img src={src} alt="" className="h-full w-full rounded-full object-cover" /> : initials}
    </div>
  )
}
