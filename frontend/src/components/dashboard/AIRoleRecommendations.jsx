import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { dashboardMock as mock } from '../../data/dashboardMock'
import { Card, CardHeader } from '../ui/Card'
import { Badge } from '../ui/Badge'

export default function AIRoleRecommendations() {
  const recs = [...mock.roleRecommendations].sort((a, b) => b.match - a.match).slice(0, 3)

  return (
    <Card id="ai-recs" hover>
      <CardHeader
        title="AI Career Recommendations"
        subtitle="Top roles matched to your profile"
        action={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-[11px] font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-400">
              <Sparkles size={12} /> AI
            </span>
            <Link
              to="/jobs"
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
            >
              View all <ArrowUpRight size={13} />
            </Link>
          </div>
        }
      />
      <div className="space-y-3">
        {recs.map((rec, i) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
            whileHover={{ x: 4 }}
            className="flex items-center justify-between gap-3 rounded-xl border border-gray-200/70 dark:border-gray-800/70 p-3 hover:border-primary-500/40 transition-colors"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-800 dark:text-white">{rec.role}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400">
                <TrendingUp size={11} className="text-emerald-500" /> {rec.demand}
              </p>
            </div>
            <Badge tone={rec.match >= 85 ? 'success' : rec.match >= 75 ? 'info' : 'neutral'}>{rec.match}% match</Badge>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}