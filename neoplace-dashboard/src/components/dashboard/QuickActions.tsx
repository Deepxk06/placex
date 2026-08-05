import { motion } from 'framer-motion'
import {
  Upload,
  FileText,
  ScanText,
  Briefcase,
  Mic,
  Map,
  Code2,
  ClipboardList,
} from 'lucide-react'
import { Card, CardHeader } from '../ui/Card'

const actions = [
  { label: 'Upload Resume', desc: 'PDF / DOCX', icon: Upload, gradient: 'from-sky-500 to-cyan-500' },
  { label: 'Generate ATS Resume', desc: 'AI optimized', icon: FileText, gradient: 'from-brand-600 to-violet-600' },
  { label: 'Analyze Resume', desc: 'Get ATS score', icon: ScanText, gradient: 'from-emerald-500 to-teal-500' },
  { label: 'Find Jobs', desc: '18 matches', icon: Briefcase, gradient: 'from-amber-500 to-orange-500' },
  { label: 'Start Mock Interview', desc: 'AI interviewer', icon: Mic, gradient: 'from-rose-500 to-pink-500' },
  { label: 'Generate Roadmap', desc: '4-month plan', icon: Map, gradient: 'from-violet-500 to-purple-500' },
  { label: 'Practice Coding', desc: '142 solved', icon: Code2, gradient: 'from-blue-500 to-indigo-500' },
  { label: 'Skill Assessment', desc: '14 completed', icon: ClipboardList, gradient: 'from-teal-500 to-emerald-500' },
]

export default function QuickActions() {
  return (
    <Card>
      <CardHeader title="Quick Actions" subtitle="Jump straight into your next step" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-5 text-left hover:border-brand-500/40 hover:shadow-soft transition-all duration-300"
          >
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-soft transition-transform group-hover:scale-110 ${action.gradient}`}>
              <action.icon size={20} />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{action.label}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{action.desc}</p>
            <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity dark:from-white/10" />
          </motion.button>
        ))}
      </div>
    </Card>
  )
}
