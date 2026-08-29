import { FileText, ScanSearch, Target, Wrench, FolderGit2 } from 'lucide-react'
import { Card } from '../ui/Card'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { cn } from '../../utils/helpers'

function scoreTone(score) {
  if (score == null) return 'text-gray-400'
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 50) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function ringColor(score) {
  if (score == null) return 'bg-gray-300'
  if (score >= 80) return 'bg-green-500'
  if (score >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

export default function ScoreCards({ analysis }) {
  const cards = [
    {
      label: 'Resume Score',
      value: analysis?.resumeScore,
      icon: FileText,
      sub: 'Overall quality',
    },
    {
      label: 'ATS Compatibility',
      value: analysis?.atsScore,
      icon: ScanSearch,
      sub: 'Estimated parseability',
    },
    {
      label: 'Job Match',
      value: analysis?.jobMatch?.score,
      icon: Target,
      sub: 'vs. target job',
    },
    {
      label: 'Skills',
      value: analysis?.skillLevels?.strong?.length,
      icon: Wrench,
      sub: 'Strong skills listed',
      unit: '',
    },
    {
      label: 'Projects',
      value: analysis?.projectAnalysis?.length,
      icon: FolderGit2,
      sub: 'Analyzed projects',
      unit: '',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {cards.map(({ label, value, icon: Icon, sub, unit = '%' }) => (
        <Card key={label} className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
            <Icon size={16} className="text-gray-300 dark:text-gray-600" />
          </div>
          <div className="flex items-center gap-3">
            <div className={cn('h-9 w-9 rounded-full p-1.5', ringColor(value))}>
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-gray-950 text-[10px] font-bold text-gray-700 dark:text-gray-200">
                {value ?? '–'}
              </div>
            </div>
            <div>
              <AnimatedNumber
                value={value ?? 0}
                suffix={value != null && unit ? unit : ''}
                className={cn('text-2xl font-extrabold', scoreTone(value))}
              />
              <p className="text-[10px] text-gray-400">{sub}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}