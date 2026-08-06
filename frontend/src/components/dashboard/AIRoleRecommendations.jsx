import { motion } from 'framer-motion'
import { Sparkles, TrendingUp } from 'lucide-react'
import { dashboardMock as mock } from '../../data/dashboardMock'
import { Card, CardHeader } from '../ui/Card'
import { Badge } from '../ui/Badge'

export default function AIRoleRecommendations() {
  return (
    <Card id="ai-recs" hover>
      <CardHeader
        title="AI Career Recommendations"
        subtitle="Roles matched to your profile"
        action={
          <span className="flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-[11px] font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-400">
            <Sparkles size={12} /> AI
          </span>
        }
      />
      <div className="space-y-3">
        {mock.roleRecommendations.map((rec, i) => (
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