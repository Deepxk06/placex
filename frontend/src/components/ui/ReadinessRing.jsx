import { motion } from 'framer-motion'
import { cn } from '../../utils/helpers'
import { AnimatedNumber } from './AnimatedNumber'

function readinessColor(value) {
  if (value >= 80) return '#10b981'
  if (value >= 50) return '#eab308'
  return '#ef4444'
}

export function ReadinessRing({ value, size = 120, strokeWidth = 10, label = 'Readiness', children, className }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(Math.max(value, 0), 100) / 100)
  const color = readinessColor(value)

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-gray-200 dark:stroke-gray-800"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children ?? (
          <>
            <AnimatedNumber value={value} suffix="%" className="text-2xl font-extrabold text-gray-900 dark:text-white" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</span>
          </>
        )}
      </div>
    </div>
  )
}
