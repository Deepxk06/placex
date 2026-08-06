import { motion } from 'framer-motion'
import { BarChart2 } from 'lucide-react'
import { dashboardMock as mock } from '../../data/dashboardMock'
import { Card, CardHeader } from '../ui/Card'
import { Progress } from '../ui/Progress'

export default function SkillProgress() {
  return (
    <Card id="skills" hover>
      <CardHeader
        title="Skill Progress"
        subtitle="Your proficiency across key skills"
        action={<BarChart2 size={18} className="text-primary-500" />}
      />
      <div className="space-y-4">
        {mock.skillProgress.map((skill, i) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
          >
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700 dark:text-gray-200">{skill.name}</span>
              <span className="font-bold text-gray-500 dark:text-gray-400">{skill.value}%</span>
            </div>
            <Progress value={skill.value} color={skill.color} />
          </motion.div>
        ))}
      </div>
    </Card>
  )
}