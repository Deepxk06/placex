import { motion } from 'framer-motion'
import {
  Sparkles,
  FileText,
  ListChecks,
  MessageSquareText,
  Rocket,
  Lightbulb,
  Check,
  Hash,
} from 'lucide-react'
import { dashboardMock as mock } from '../../data/dashboardMock'
import { Card, CardHeader } from '../ui/Card'
import { Badge } from '../ui/Badge'

const box = 'rounded-2xl border border-gray-200/70 dark:border-gray-800/70 p-4 hover:border-primary-500/40 transition-colors'

export default function AIFeatures() {
  return (
    <Card id="ai-features" hover>
      <CardHeader
        title="AI Career Insights"
        subtitle="Personalized suggestions from your AI coach"
        action={
          <span className="flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-[11px] font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-400">
            <Sparkles size={12} /> AI
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI resume suggestions */}
        <div className={box}>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
              <FileText size={15} />
            </span>
            <p className="text-sm font-bold text-gray-800 dark:text-white">AI Resume Suggestions</p>
          </div>
          <div className="space-y-2">
            {mock.resumeSuggestions.map((s, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300"
              >
                <Check size={13} className="mt-0.5 shrink-0 text-emerald-500" />
                {s}
              </motion.p>
            ))}
          </div>
        </div>

        {/* Missing ATS keywords */}
        <div className={box}>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Hash size={15} />
            </span>
            <p className="text-sm font-bold text-gray-800 dark:text-white">Missing ATS Keywords</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {mock.atsKeywords.map((k) => (
              <Badge key={k} tone="warning">
                {k}
              </Badge>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-gray-400">Add these to your resume to improve ATS visibility.</p>
        </div>

        {/* Interview question + career recommendation */}
        <div className={`${box} lg:col-span-2`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                <MessageSquareText size={18} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-800 dark:text-white">Interview Question of the Day</p>
                  <Badge tone="brand">{mock.interviewQuestion.topic}</Badge>
                </div>
                <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-300">“{mock.interviewQuestion.question}”</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-gradient-to-br from-primary-600/5 to-sky-600/5 p-3.5 sm:max-w-xs">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400">
                <Rocket size={16} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Career Recommendation</p>
                <p className="mt-1 text-xs font-semibold text-gray-700 dark:text-gray-200">{mock.careerRecommendation.role}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-gray-500 dark:text-gray-400">{mock.careerRecommendation.summary}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resume improvement tips */}
        <div className={`${box} lg:col-span-2`}>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Lightbulb size={15} />
            </span>
            <p className="text-sm font-bold text-gray-800 dark:text-white">Resume Improvement Tips</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {mock.resumeImprovementTips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-2.5"
              >
                <ListChecks size={13} className="mt-0.5 shrink-0 text-emerald-500" />
                <span className="text-xs text-gray-600 dark:text-gray-300">{tip}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}