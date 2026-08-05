import { motion } from 'framer-motion'
import { GitCompare, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Card, CardHeader } from '../ui/Card'
import { Select } from '../ui/Select'
import { Badge } from '../ui/Badge'
import { AnimatedNumber } from '../ui/AnimatedNumber'

const jdCompanies: Record<string, { match: number; matched: string[]; missing: string[]; coverage: number; recommendation: string }> = {
  tcs: {
    match: 92,
    matched: ['Java', 'SQL', 'Communication', 'Python'],
    missing: ['AWS'],
    coverage: 88,
    recommendation: 'Excellent match! Your profile aligns very well with TCS System Engineer role. Completing AWS will make you a near-perfect candidate.',
  },
  infosys: {
    match: 88,
    matched: ['Python', 'SQL', 'Problem Solving', 'Communication'],
    missing: ['Spring Boot'],
    coverage: 84,
    recommendation: 'Great fit! Strengthen your Spring Boot fundamentals to increase your chances for this role.',
  },
  wipro: {
    match: 85,
    matched: ['Java', 'React', 'SQL'],
    missing: ['Docker', 'CI/CD'],
    coverage: 80,
    recommendation: 'Good match. Adding Docker and CI/CD experience will push your score past 90%.',
  },
  accenture: {
    match: 80,
    matched: ['Java', 'Python', 'Cloud basics'],
    missing: ['AWS', 'Kubernetes'],
    coverage: 74,
    recommendation: 'Decent match. Your missing cloud skills are holding you back — prioritize AWS certification.',
  },
  capgemini: {
    match: 76,
    matched: ['Java', 'SQL', 'Communication'],
    missing: ['Microservices', 'API Design'],
    coverage: 71,
    recommendation: 'Consider building a microservices project to close the gap for this role.',
  },
}

export default function JdMatch() {
  const [company, setCompany] = useState('tcs')
  const data = jdCompanies[company]
  const pct = data.match

  return (
    <Card id="jd-match" hover>
      <CardHeader
        title="Resume vs Job Description"
        subtitle="AI matching against live company job descriptions"
        action={<GitCompare size={18} className="text-brand-500" />}
      />

      <div className="mb-5">
        <Select value={company} onChange={(e) => setCompany(e.target.value)} className="max-w-xs" aria-label="Select company">
          {Object.entries(jdCompanies).map(([key, v]) => (
            <option key={key} value={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)} — Software Engineer
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="relative mx-auto h-44 w-44">
          <div
            className="flex h-full w-full items-center justify-center rounded-full transition-all duration-700"
            style={{ background: `conic-gradient(#6366f1 ${pct * 3.6}deg, rgba(148,163,184,0.15) 0deg)` }}
          >
            <motion.div
              key={company}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900"
            >
              <AnimatedNumber value={pct} suffix="%" className="text-4xl font-extrabold text-brand-600 dark:text-brand-400" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match</p>
            </motion.div>
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">Matched Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {data.matched.map((s) => (
                  <Badge key={s} tone="success">{s}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">Missing Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {data.missing.map((s) => (
                  <Badge key={s} tone="danger">{s}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wide text-slate-500">Keyword Coverage</span>
              <span className="font-extrabold text-brand-600 dark:text-brand-400">{data.coverage}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200/80 dark:bg-slate-700/50 overflow-hidden">
              <motion.div
                key={company}
                initial={{ width: 0 }}
                animate={{ width: `${data.coverage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-brand-500/5 border border-brand-500/15 p-3">
            <Sparkles size={15} className="mt-0.5 shrink-0 text-brand-500" />
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{data.recommendation}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
