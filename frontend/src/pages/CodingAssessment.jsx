import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import api from '../services/api'
import { getScoreColor } from '../utils/helpers'
import { CODING_TOPICS, DIFFICULTIES } from '../utils/constants'
import {
  Code, Terminal, BookOpen, TrendingUp, Clock, CheckCircle2, XCircle,
  Search, Filter, ChevronRight, BarChart3, Zap, Award, Loader2, ExternalLink, Tag
} from 'lucide-react'

export default function CodingAssessment() {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [problems, setProblems] = useState([])
  const [stats, setStats] = useState(null)
  const [topics, setTopics] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [sortBy, setSortBy] = useState('id')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [problemsRes, statsRes, topicsRes, activityRes] = await Promise.all([
          api.get('/assessment/coding'),
          api.get('/assessment/coding/stats'),
          api.get('/assessment/coding/topics'),
          api.get('/assessment/coding/recent-activity')
        ])
        setProblems(problemsRes.data || [])
        setStats(statsRes.data || null)
        setTopics(topicsRes.data || [])
        setRecentActivity(activityRes.data || [])
      } catch (err) {
        console.error('Failed to fetch coding assessment data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredProblems = problems
    .filter(p => {
      if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (selectedDifficulty && p.difficulty !== selectedDifficulty) return false
      if (selectedTopic && !(p.topics || []).includes(selectedTopic)) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'difficulty') return { easy: 0, medium: 1, hard: 2 }[a.difficulty] - { easy: 0, medium: 1, hard: 2 }[b.difficulty]
      return a.id - b.id
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Problems',
      value: stats?.totalProblems ?? problems.length,
      icon: Code,
      color: 'text-primary-600',
      bg: 'bg-primary-100 dark:bg-primary-900/30'
    },
    {
      label: 'Solved',
      value: stats?.solved ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    {
      label: 'Attempted',
      value: stats?.attempted ?? 0,
      icon: BookOpen,
      color: 'text-amber-600',
      bg: 'bg-amber-100 dark:bg-amber-900/30'
    },
    {
      label: 'Accuracy',
      value: stats?.accuracy ? `${stats.accuracy}%` : '0%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900/30'
    }
  ]

  const difficultyCounts = {
    easy: problems.filter(p => p.difficulty === 'easy').length,
    medium: problems.filter(p => p.difficulty === 'medium').length,
    hard: problems.filter(p => p.difficulty === 'hard').length
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Terminal size={22} className="text-primary-600" /> Coding Assessment
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Practice coding problems and track your progress
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card flex items-center gap-3 rounded-xl p-4">
            <div className={`rounded-lg p-2.5 ${card.bg}`}>
              <card.icon size={20} className={card.color} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <span className="badge badge-easy">{difficultyCounts.easy} problems</span>
        <span className="badge badge-medium">{difficultyCounts.medium} problems</span>
        <span className="badge badge-hard">{difficultyCounts.hard} problems</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field !pl-10"
              />
            </div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="input-field !w-auto"
            >
              <option value="">All Difficulties</option>
              {DIFFICULTIES.map(d => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="input-field !w-auto"
            >
              <option value="">All Topics</option>
              {CODING_TOPICS.map(t => (
                <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field !w-auto"
            >
              <option value="id">Default</option>
              <option value="title">Title</option>
              <option value="difficulty">Difficulty</option>
            </select>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredProblems.length} of {problems.length} problems
          </p>

          <div className="space-y-3">
            {filteredProblems.map((problem, i) => (
              <div
                key={problem._id || i}
                className="card hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer"
                onClick={() => navigate(`/coding/problem/${problem._id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-gray-400 w-8">#{i + 1}</span>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                        {problem.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mt-2 ml-11">
                      <span className={`badge ${problem.difficulty === 'easy' ? 'badge-easy' : problem.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'}`}>
                        {problem.difficulty}
                      </span>
                      {(problem.topics || []).slice(0, 3).map(t => (
                        <span key={t} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          {t.replace(/-/g, ' ')}
                        </span>
                      ))}
                      {(problem.companies || []).slice(0, 2).map(c => (
                        <span key={c} className="badge bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400 flex-shrink-0 ml-2" size={18} />
                </div>
              </div>
            ))}
            {filteredProblems.length === 0 && (
              <div className="card text-center py-12">
                <Code className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-500 dark:text-gray-400">No problems match your filters</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
              <Tag size={16} className="text-primary-500" /> Top Topics
            </h3>
            <div className="space-y-3">
              {topics.slice(0, 10).map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                    {t.name.replace(/-/g, ' ')}
                  </span>
                  <span className="badge bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                    {t.count} problems
                  </span>
                </div>
              ))}
              {topics.length === 0 && (
                <p className="text-sm text-gray-400">No topics data yet</p>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
              <Clock size={16} className="text-primary-500" /> Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.slice(0, 8).map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  {a.status === 'accepted'
                    ? <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    : <XCircle size={14} className="text-red-500 flex-shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                      {a.problemTitle || 'Unknown Problem'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {a.language} • {a.score}/{a.total} • {new Date(a.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-sm text-gray-400">No activity yet. Start solving problems!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
