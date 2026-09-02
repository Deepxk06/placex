import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import {
  CODING_TOPICS, CODING_SORT_OPTIONS, DIFFICULTY_ORDER,
} from '../utils/constants'
import {
  Code, Terminal, BookOpen, TrendingUp, Clock, CheckCircle2, XCircle,
  Search, ChevronRight, ChevronLeft, Tag, AlertTriangle,
  LayoutList, LayoutGrid, RotateCcw, ArrowRight, Clock3,
} from 'lucide-react'

const PROBLEMS_PER_PAGE = 10

const TOPIC_ICONS = {
  arrays: '[]', strings: '""', 'hash-table': '#', 'linked-list': '->',
  stack: '[]', queue: '>>', trees: '🌲', 'binary-tree': '🌳',
  graphs: '🕸️', 'dynamic-programming': 'DP', greedy: '>G',
  sorting: '↑↓', searching: '🔍', 'binary-search': '<>',
  'sliding-window': '>>', 'two-pointers': '<>', recursion: 'R',
  heap: 'H', math: '∑', 'bit-manipulation': '&',
}

function SkeletonBlock({ className = '' }) {
  return <div className={`bg-gray-200 dark:bg-gray-800 rounded animate-pulse ${className}`} />
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="w-10 h-10 rounded-lg" />
            <div className="flex-1">
              <SkeletonBlock className="h-3 w-20 mb-2" />
              <SkeletonBlock className="h-7 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProblemSkeleton() {
  return (
    <div className="card rounded-xl p-4">
      <div className="flex items-start gap-4">
        <SkeletonBlock className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <SkeletonBlock className="h-5 w-48 mb-2" />
          <SkeletonBlock className="h-3 w-full mb-1" />
          <SkeletonBlock className="h-3 w-3/4 mb-3" />
          <div className="flex gap-2">
            <SkeletonBlock className="h-5 w-16 rounded-full" />
            <SkeletonBlock className="h-5 w-20 rounded-full" />
            <SkeletonBlock className="h-5 w-14 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <SkeletonBlock className="h-5 w-14 rounded-full" />
          <SkeletonBlock className="h-4 w-12" />
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

function TopicSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <SkeletonBlock className="w-4 h-4 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <SkeletonBlock className="h-4 w-32 mb-1" />
            <SkeletonBlock className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
        <AlertTriangle size={28} className="text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
        Unable to load coding problems
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
        Something went wrong while fetching data. Please check your connection and try again.
      </p>
      <button onClick={onRetry} className="btn-primary flex items-center gap-2">
        <RotateCcw size={14} /> Retry
      </button>
    </div>
  )
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Code size={28} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
        No problems found
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
        {hasFilters
          ? 'Try changing your filters or search keywords.'
          : 'No coding problems are available yet.'}
      </p>
      {hasFilters && (
        <button onClick={onClear} className="btn-primary flex items-center gap-2">
          <RotateCcw size={14} /> Clear Filters
        </button>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, subtitle, iconColor, iconBg }) {
  return (
    <div className="card flex items-center gap-3 rounded-xl p-4">
      <div className={`rounded-lg p-2.5 ${iconBg}`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        {subtitle && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

function ProblemCard({ problem, index, onSolve, viewMode }) {
  const isSolved = problem.solved
  const isAttempted = problem.attempted

  const acceptanceRate = problem.totalSubmissions > 0
    ? ((problem.totalAccepted / problem.totalSubmissions) * 100).toFixed(1)
    : null

  const solvedCount = problem.totalAccepted
    ? problem.totalAccepted >= 1000
      ? `${(problem.totalAccepted / 1000).toFixed(1)}K`
      : problem.totalAccepted
    : null

  if (viewMode === 'grid') {
    return (
      <div
        className={`card rounded-xl p-4 hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer group ${
          isSolved ? 'border-green-200 dark:border-green-800/40' : ''
        }`}
        onClick={() => onSolve(problem)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isSolved ? (
              <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 size={14} className="text-green-600" />
              </div>
            ) : (
              <span className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-mono text-gray-500">
                {problem.id || index + 1}
              </span>
            )}
            <span className={`badge text-[10px] ${
              problem.difficulty === 'easy' ? 'badge-success' :
              problem.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'
            }`}>
              {problem.difficulty}
            </span>
          </div>
        </div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {problem.title}
        </h3>
        <div className="flex flex-wrap gap-1 mb-3">
          {(problem.topics || []).slice(0, 2).map(t => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">
              {t.replace(/-/g, ' ')}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-3">
          {acceptanceRate && <span>{acceptanceRate}% accept</span>}
          {solvedCount && <span>{solvedCount} solved</span>}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onSolve(problem) }}
          className="w-full py-1.5 text-xs font-medium border border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
        >
          Solve Now
        </button>
      </div>
    )
  }

  return (
    <div
      className={`card rounded-xl hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer group ${
        isSolved ? 'border-green-200 dark:border-green-800/40' : ''
      }`}
      onClick={() => onSolve(problem)}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 pt-0.5">
          {isSolved ? (
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-green-600" />
            </div>
          ) : isAttempted ? (
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock3 size={18} className="text-amber-600" />
            </div>
          ) : (
            <span className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-mono text-gray-500">
              {problem.id || index + 1}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary-600 transition-colors truncate">
            {problem.title}
          </h3>
          {(problem.description || problem.shortDescription) && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
              {problem.description || problem.shortDescription}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {(problem.topics || []).slice(0, 3).map(t => (
              <span key={t} className="text-[11px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full capitalize">
                {t.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0 min-w-[100px]">
          <span className={`badge text-[11px] font-semibold ${
            problem.difficulty === 'easy' ? 'badge-success' :
            problem.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'
          }`}>
            {problem.difficulty}
          </span>
          {acceptanceRate && (
            <span className="text-[11px] text-gray-400">{acceptanceRate}%</span>
          )}
          {solvedCount && (
            <span className="text-[11px] text-gray-400">{solvedCount} users</span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onSolve(problem) }}
            className="mt-1 px-3 py-1 text-xs font-medium border border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors whitespace-nowrap"
          >
            Solve Now
          </button>
        </div>
      </div>
    </div>
  )
}

function TopTopics({ topics, onTopicClick, loading }) {
  if (loading) return <TopicSkeleton />
  if (!topics || topics.length === 0) {
    return <p className="text-sm text-gray-400">No topics available</p>
  }
  return (
    <div className="space-y-2.5">
      {topics.slice(0, 8).map((t, i) => (
        <button
          key={i}
          onClick={() => onTopicClick(t.name)}
          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left group"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-md bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-[10px] font-bold text-primary-600">
              {TOPIC_ICONS[t.name] || '•'}
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize group-hover:text-primary-600 transition-colors">
              {t.name.replace(/-/g, ' ')}
            </span>
          </div>
          <span className="text-[11px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {t.count}
          </span>
        </button>
      ))}
    </div>
  )
}

function RecentActivity({ activities, loading }) {
  if (loading) return <ActivitySkeleton />
  if (!activities || activities.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        No recent activity. Start solving problems!
      </p>
    )
  }

  function timeAgo(dateStr) {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  return (
    <div className="space-y-1">
      {activities.slice(0, 6).map((a, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          {a.status === 'accepted' ? (
            <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
          ) : (
            <XCircle size={14} className="text-red-400 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
              {a.problemTitle || 'Unknown Problem'}
            </p>
            <p className="text-[11px] text-gray-400">
              {a.status === 'accepted' ? 'Solved' : 'Attempted'} • {timeAgo(a.completedAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function CodingAssessment() {
  const navigate = useNavigate()
  const [problems, setProblems] = useState([])
  const [stats, setStats] = useState(null)
  const [topics, setTopics] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [sortBy, setSortBy] = useState('recommended')
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('coding_view_mode') || 'list')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [problemsRes, statsRes, topicsRes, activityRes] = await Promise.all([
        api.get('/assessment/coding'),
        api.get('/assessment/coding/stats'),
        api.get('/assessment/coding/topics'),
        api.get('/assessment/coding/recent-activity'),
      ])
      setProblems(problemsRes.data || [])
      setStats(statsRes.data || null)
      setTopics(topicsRes.data || [])
      setRecentActivity(activityRes.data || [])
    } catch (err) {
      console.error('Failed to fetch coding assessment data:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    localStorage.setItem('coding_view_mode', viewMode)
  }, [viewMode])

  const enrichedProblems = useMemo(() => {
    return problems.map((p, i) => ({
      ...p,
      index: i,
      shortDescription: p.description
        ? p.description.substring(0, 120) + (p.description.length > 120 ? '...' : '')
        : '',
    }))
  }, [problems])

  const filteredProblems = useMemo(() => {
    let result = [...enrichedProblems]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.topics || []).some(t => t.toLowerCase().includes(q))
      )
    }

    if (selectedDifficulty) {
      result = result.filter(p => p.difficulty === selectedDifficulty)
    }

    if (selectedTopic) {
      result = result.filter(p => (p.topics || []).includes(selectedTopic))
    }

    switch (sortBy) {
      case 'most-solved':
        result.sort((a, b) => (b.totalAccepted || 0) - (a.totalAccepted || 0))
        break
      case 'recently-added':
        result.sort((a, b) => (b.id || 0) - (a.id || 0))
        break
      case 'easy-hard':
        result.sort((a, b) => (DIFFICULTY_ORDER[a.difficulty] || 0) - (DIFFICULTY_ORDER[b.difficulty] || 0))
        break
      case 'hard-easy':
        result.sort((a, b) => (DIFFICULTY_ORDER[b.difficulty] || 0) - (DIFFICULTY_ORDER[a.difficulty] || 0))
        break
      case 'recommended':
      default:
        break
    }

    return result
  }, [enrichedProblems, searchQuery, selectedDifficulty, selectedTopic, sortBy])

  const totalPages = Math.ceil(filteredProblems.length / PROBLEMS_PER_PAGE)
  const paginatedProblems = filteredProblems.slice(
    (currentPage - 1) * PROBLEMS_PER_PAGE,
    currentPage * PROBLEMS_PER_PAGE
  )

  const startItem = filteredProblems.length === 0 ? 0 : (currentPage - 1) * PROBLEMS_PER_PAGE + 1
  const endItem = Math.min(currentPage * PROBLEMS_PER_PAGE, filteredProblems.length)

  const hasActiveFilters = searchQuery || selectedDifficulty || selectedTopic

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedDifficulty('')
    setSelectedTopic('')
    setSortBy('recommended')
    setCurrentPage(1)
  }, [])

  const handleTopicClick = useCallback((topicName) => {
    setSelectedTopic(topicName)
    setCurrentPage(1)
    setSearchQuery('')
    setSelectedDifficulty('')
  }, [])

  const handleSolve = useCallback((problem) => {
    const id = problem.slug || problem._id || problem.id
    navigate(`/coding/problem/${id}`)
  }, [navigate])

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const statCards = useMemo(() => {
    const total = stats?.total ?? problems.length
    const solved = stats?.solved ?? 0
    const attempted = stats?.attempted ?? 0
    const accuracy = stats?.accuracy ?? 0

    return [
      {
        label: 'Total Problems',
        value: total,
        subtitle: 'Across all topics',
        icon: Code,
        iconColor: 'text-primary-600',
        iconBg: 'bg-primary-100 dark:bg-primary-900/30',
      },
      {
        label: 'Solved',
        value: solved,
        subtitle: total > 0 ? `${Math.round((solved / total) * 100)}% of total` : '0% of total',
        icon: CheckCircle2,
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100 dark:bg-green-900/30',
      },
      {
        label: 'Attempted',
        value: attempted,
        subtitle: total > 0 ? `${Math.round((attempted / total) * 100)}% of total` : '0% of total',
        icon: BookOpen,
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      },
      {
        label: 'Accuracy',
        value: `${accuracy}%`,
        subtitle: accuracy >= 70 ? 'Great job!' : accuracy > 0 ? 'Keep practicing!' : 'Start solving!',
        icon: TrendingUp,
        iconColor: 'text-purple-600',
        iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      },
    ]
  }, [stats, problems.length])

  const difficultyCounts = useMemo(() => ({
    easy: problems.filter(p => p.difficulty === 'easy').length,
    medium: problems.filter(p => p.difficulty === 'medium').length,
    hard: problems.filter(p => p.difficulty === 'hard').length,
  }), [problems])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SkeletonBlock className="w-6 h-6 rounded" />
            <SkeletonBlock className="h-7 w-48" />
          </div>
          <SkeletonBlock className="h-4 w-72" />
        </div>
        <StatsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-3">
            {[...Array(5)].map((_, i) => <ProblemSkeleton key={i} />)}
          </div>
          <div className="space-y-6">
            <div className="card rounded-xl p-4">
              <SkeletonBlock className="h-5 w-28 mb-4" />
              <TopicSkeleton />
            </div>
            <div className="card rounded-xl p-4">
              <SkeletonBlock className="h-5 w-36 mb-4" />
              <ActivitySkeleton />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
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
        <ErrorState onRetry={fetchData} />
      </div>
    )
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
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <span className="badge badge-success">{difficultyCounts.easy} easy</span>
        <span className="badge badge-warning">{difficultyCounts.medium} medium</span>
        <span className="badge badge-danger">{difficultyCounts.hard} hard</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                className="input-field !pl-10"
              />
            </div>
            <select
              value={selectedDifficulty}
              onChange={(e) => { setSelectedDifficulty(e.target.value); setCurrentPage(1) }}
              className="input-field !w-auto"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <select
              value={selectedTopic}
              onChange={(e) => { setSelectedTopic(e.target.value); setCurrentPage(1) }}
              className="input-field !w-auto"
            >
              <option value="">All Topics</option>
              {CODING_TOPICS.map(t => (
                <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1) }}
              className="input-field !w-auto"
            >
              {CODING_SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="List view"
              >
                <LayoutList size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {startItem}–{endItem} of {filteredProblems.length} problems
              {hasActiveFilters && (
                <button onClick={clearFilters} className="ml-2 text-primary-500 hover:text-primary-600 text-xs underline">
                  Clear filters
                </button>
              )}
            </p>
          </div>

          {filteredProblems.length === 0 ? (
            <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {paginatedProblems.map((problem, i) => (
                <ProblemCard
                  key={problem._id || problem.id || i}
                  problem={problem}
                  index={(currentPage - 1) * PROBLEMS_PER_PAGE + i}
                  onSolve={handleSolve}
                  viewMode="grid"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedProblems.map((problem, i) => (
                <ProblemCard
                  key={problem._id || problem.id || i}
                  problem={problem}
                  index={(currentPage - 1) * PROBLEMS_PER_PAGE + i}
                  onSolve={handleSolve}
                  viewMode="list"
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1
                if (totalPages > 7 && page > 2 && page < totalPages - 1 && Math.abs(page - currentPage) > 1) {
                  if (page === 3 || page === totalPages - 2) {
                    return <span key={i} className="text-gray-400">...</span>
                  }
                  return null
                }
                return (
                  <button
                    key={i}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-primary-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-3">
              <Tag size={16} className="text-primary-500" /> Top Topics
            </h3>
            <TopTopics topics={topics} onTopicClick={handleTopicClick} loading={false} />
            {topics.length > 8 && (
              <button
                onClick={() => {
                  const allTopics = topics.map(t => t.name)
                  const uncovered = allTopics.filter(t => !CODING_TOPICS.includes(t))
                  if (uncovered.length > 0) setSelectedTopic(uncovered[0])
                }}
                className="mt-3 text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
              >
                View All Topics <ArrowRight size={12} />
              </button>
            )}
          </div>

          <div className="card rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-3">
              <Clock size={16} className="text-primary-500" /> Your Recent Activity
            </h3>
            <RecentActivity activities={recentActivity} loading={false} />
            {recentActivity.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400">
                  {recentActivity.filter(a => a.status === 'accepted').length} solved in recent sessions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
