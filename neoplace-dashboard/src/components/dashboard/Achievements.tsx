import { Trophy } from 'lucide-react'
import { badges } from '../../data/mockData'
import { Card, CardHeader } from '../ui/Card'
import { cn } from '../../utils/cn'

export default function Achievements() {
  return (
    <Card id="achievements" hover>
      <CardHeader
        title="Achievements"
        subtitle={`${badges.filter((b) => b.unlocked).length}/${badges.length} unlocked`}
        action={<Trophy size={18} className="text-amber-500" />}
      />
      <div className="grid grid-cols-2 gap-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={cn(
              'relative rounded-2xl border p-4 text-center transition-all duration-300',
              badge.unlocked
                ? 'border-transparent bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-900/40 hover:shadow-soft cursor-pointer'
                : 'border-dashed border-slate-300 dark:border-slate-700 opacity-60'
            )}
          >
            {badge.unlocked && (
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/5 to-transparent" />
            )}
            <div
              className={cn(
                'mx-auto flex h-12 w-12 items-center justify-center rounded-full text-white shadow-soft bg-gradient-to-br',
                badge.unlocked ? badge.color : 'bg-slate-300 dark:bg-slate-700',
                badge.unlocked && 'animate-float'
              )}
            >
              <badge.icon size={20} />
            </div>
            <p className="mt-2.5 text-xs font-bold text-slate-800 dark:text-white">{badge.name}</p>
            <p className="mt-1 text-[10px] leading-snug text-slate-400">{badge.description}</p>
            <p className={cn('mt-2 text-[10px] font-bold uppercase tracking-wider', badge.unlocked ? 'text-amber-500' : 'text-slate-400')}>
              {badge.unlocked ? '✓ Unlocked' : '🔒 Locked'}
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}
