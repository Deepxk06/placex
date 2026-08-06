import { Link } from 'react-router-dom'
import { cn } from '../../utils/helpers'

export default function SidebarItem({ to, label, icon: Icon, active, collapsed, onNavigate }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      aria-label={label}
      title={collapsed ? label : undefined}
      className={cn(
        'group relative flex items-center text-sm font-medium outline-none transition-colors duration-200',
        collapsed
          ? 'h-11 w-11 justify-center rounded-xl'
          : 'h-10 w-full gap-2.5 rounded-xl px-3',
        active
          ? 'bg-primary-600/10 dark:bg-primary-500/15 font-semibold text-primary-700 dark:text-primary-300'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:text-gray-900 dark:hover:text-white'
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary-600" />
      )}
      <Icon
        size={18}
        className={cn(
          'shrink-0 transition-transform duration-200',
          !collapsed && 'group-hover:scale-110'
        )}
      />
      {!collapsed && <span className="truncate">{label}</span>}
      {collapsed && (
        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 dark:bg-gray-800">
          {label}
        </span>
      )}
    </Link>
  )
}