import { motion } from 'framer-motion'
import { Sparkles, Wand2, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTypingEffect } from '../../hooks/useTypingEffect'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

const INSIGHTS = [
  'Your placement readiness increased from 78% to 84%. Completing Docker and AWS will increase your probability to 92%. You are currently eligible for 18 companies. Keep your coding streak alive — it is adding +2% monthly.',
  'Your resume ATS score improved to 78%. Adding 3 missing keywords (Kubernetes, CI/CD, Microservices) can push it past 90% and unlock 6 more companies.',
  'Based on your profile, TCS and Infosys drives have 90%+ match probability. Your strongest asset is your 8.6 CGPA — mention it prominently in your resume summary.',
]

export default function AiInsightCard() {
  const [index, setIndex] = useState(0)
  const [generating, setGenerating] = useState(true)
  const text = INSIGHTS[index]
  const { displayed, complete } = useTypingEffect(text, 16, generating)

  useEffect(() => {
    if (complete) setGenerating(false)
  }, [complete])

  const generate = () => {
    if (generating) return
    setGenerating(true)
    setIndex((i) => (i + 1) % INSIGHTS.length)
  }

  return (
    <Card className="relative overflow-hidden" hover>
      <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-brand-500/25 to-violet-500/25 blur-3xl" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 via-violet-600 to-purple-600 text-white shadow-glass animate-float">
          <Sparkles size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <p className="text-sm font-bold text-slate-900 dark:text-white">AI Career Insight</p>
            <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
              Beta
            </span>
          </div>
          <p className="min-h-[72px] text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {displayed}
            {generating && (
              <motion.span
                key="cursor"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 0.9 }}
                className="inline-block h-4 w-[2px] bg-brand-500 align-middle"
              />
            )}
          </p>
        </div>
        <div className="flex gap-2 lg:flex-col">
          <Button onClick={generate} disabled={generating} size="md">
            {generating ? <RefreshCw size={14} className="animate-spin" /> : <Wand2 size={14} />}
            {generating ? 'Generating…' : 'Generate Insight'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
