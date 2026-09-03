import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight, Code2 } from 'lucide-react'
import api from '../../services/api'

export default function ProblemOfTheDay() {
  const [problem, setProblem] = useState(null)

  useEffect(() => {
    api.get('/assessment/coding').then((res) => {
      const problems = res.data
      if (problems.length > 0) {
        const today = new Date()
        const idx = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % problems.length
        setProblem(problems[idx])
      }
    }).catch(() => {})
  }, [])

  if (!problem) return null

  const diffColors = {
    easy: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    hard: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
  }

  return (
    <div className="bg-gradient-to-br from-primary-50 to-sky-50 dark:from-primary-900/20 dark:to-sky-900/20 rounded-2xl border border-primary-200/50 dark:border-primary-800/50 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} className="text-primary-500" />
        <h3 className="text-sm font-bold text-gray-800 dark:text-white">Problem of the Day</h3>
      </div>
      <div className="flex items-start justify-between">
        <div>
          <Link
            to={`/coding/problem/${problem._id}`}
            className="text-lg font-bold text-gray-900 dark:text-white hover:text-primary-600 transition-colors"
          >
            {problem.title}
          </Link>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${diffColors[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
            {problem.topics?.slice(0, 2).map((t) => (
              <span key={t} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-500">{t}</span>
            ))}
          </div>
        </div>
        <Link
          to={`/coding/problem/${problem._id}`}
          className="shrink-0 p-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
