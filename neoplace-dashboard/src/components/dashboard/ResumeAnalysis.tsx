import { motion } from 'framer-motion'
import {
  FileText,
  RefreshCw,
  Upload,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { AnimatedNumber } from '../ui/AnimatedNumber'

const missingKeywords = ['Kubernetes', 'CI/CD', 'Microservices', 'Agile', 'REST APIs']
const suggestions = [
  'Add quantifiable achievements (e.g. "improved load time by 40%")',
  'Include an AWS or Docker certification section',
  'Use stronger action verbs in project descriptions',
]
const missingSections = ['Certifications', 'Hobbies & Interests']

export default function ResumeAnalysis() {
  return (
    <Card id="resume-analysis" hover>
      <CardHeader
        title="Resume Analysis"
        subtitle="AI-powered ATS evaluation of your resume"
        action={
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white">
            <FileText size={18} />
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row items-start gap-6">
        <div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full"
          style={{ background: `conic-gradient(#0ea5e9 ${78 * 3.6}deg, rgba(148,163,184,0.15) 0deg)` }}
        >
          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900">
            <AnimatedNumber value={78} suffix="%" className="text-3xl font-extrabold text-slate-900 dark:text-white" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ATS Score</p>
          </div>
        </div>

        <div className="flex-1 space-y-4 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="info">Resume Strength: Good</Badge>
            <Badge tone="warning">6 improvements available</Badge>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              <XCircle size={13} className="text-rose-500" /> Missing Keywords
            </p>
            <div className="flex flex-wrap gap-1.5">
              {missingKeywords.map((k) => (
                <span key={k} className="rounded-lg bg-rose-500/10 px-2 py-1 text-[11px] font-semibold text-rose-500 line-through decoration-rose-400/60">
                  {k}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              <AlertTriangle size={13} className="text-amber-500" /> Improvement Suggestions
            </p>
            <ul className="space-y-1.5">
              {suggestions.map((s) => (
                <motion.li
                  key={s}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"
                >
                  <ArrowRight size={12} className="mt-0.5 shrink-0 text-brand-500" />
                  {s}
                </motion.li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              <CheckCircle2 size={13} className="text-emerald-500" /> Missing Sections
            </p>
            <div className="flex flex-wrap gap-1.5">
              {missingSections.map((s) => (
                <span key={s} className="rounded-lg bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  + {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm"><RefreshCw size={14} /> Analyze Again</Button>
        <Button size="sm"><Upload size={14} /> Upload New Resume</Button>
        <Button variant="outline" size="sm"><Eye size={14} /> View Full Report</Button>
      </div>
    </Card>
  )
}
