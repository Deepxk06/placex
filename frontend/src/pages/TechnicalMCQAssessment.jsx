import { useState, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import api from '../services/api'
import { getScoreColor } from '../utils/helpers'
import { DIFFICULTIES } from '../utils/constants'
import {
  BookOpen, Brain, TrendingUp, Clock, CheckCircle2, XCircle,
  Search, ChevronRight, Loader2, Target, Zap, Award, BarChart3, RotateCcw, Code
} from 'lucide-react'

const TechnicalMCQAssessment = () => {
  const { theme } = useTheme()
  const [questions, setQuestions] = useState([])
  const [stats, setStats] = useState(null)
  const [topics, setTopics] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [quizMode, setQuizMode] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [quizResult, setQuizResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [quizTopic, setQuizTopic] = useState('')
  const [quizCount, setQuizCount] = useState(10)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qRes, statsRes, topicsRes, actRes] = await Promise.all([
          api.get('/assessment/mcq'),
          api.get('/assessment/mcq/stats'),
          api.get('/assessment/mcq/topics'),
          api.get('/assessment/mcq/recent-activity')
        ])
        setQuestions(qRes.data || [])
        setStats(statsRes.data || null)
        setTopics(topicsRes.data || [])
        setRecentActivity(actRes.data || [])
      } catch (err) {
        console.error('Failed to fetch MCQ data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredQuestions = questions
    .filter(q => {
      if (searchQuery && !q.question.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (selectedDifficulty && q.difficulty !== selectedDifficulty) return false
      if (selectedTopic && q.topic !== selectedTopic) return false
      return true
    })

  const startQuiz = () => {
    let pool = [...questions]
    if (quizTopic) pool = pool.filter(q => q.topic === quizTopic)
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, quizCount)
    setQuizQuestions(shuffled)
    setCurrentIdx(0)
    setAnswers({})
    setQuizResult(null)
    setQuizMode(true)
  }

  const selectAnswer = (qId, idx) => {
    setAnswers(prev => ({ ...prev, [qId]: idx }))
  }

  const submitQuiz = async () => {
    setSubmitting(true)
    try {
      const payload = quizQuestions.map(q => ({
        questionId: q._id,
        selectedIndex: answers[q._id] ?? -1,
        timeTaken: 30
      }))
      const res = await api.post('/assessment/mcq/submit', payload)
      setQuizResult(res.data)
    } catch (err) {
      console.error('Submit failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const resetQuiz = () => {
    setQuizMode(false)
    setQuizQuestions([])
    setQuizResult(null)
    setAnswers({})
    setCurrentIdx(0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    )
  }

  // Quiz Result State
  if (quizResult) {
    const correctCount = quizResult.correctCount ?? quizResult.correct ?? 0
    const total = quizQuestions.length
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz Complete</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Technical MCQ Assessment Results</p>
          </div>
          <button
            onClick={resetQuiz}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RotateCcw size={18} />
            Back to Question Bank
          </button>
        </div>

        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white">
          <div className="text-center">
            <p className="text-sm opacity-80 mb-1">Your Score</p>
            <p className="text-6xl font-bold" style={{ color: getScoreColor(percentage) }}>{percentage}%</p>
            <p className="text-lg mt-2 opacity-90">{correctCount}/{total} correct</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Review</h3>
          {quizQuestions.map((q, idx) => {
            const userAnswer = answers[q._id]
            const correctIdx = q.correctIndex ?? q.correctAnswer
            const isCorrect = userAnswer === correctIdx

            return (
              <div
                key={q._id || idx}
                className={`p-5 rounded-xl border-2 ${
                  isCorrect
                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10'
                    : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 flex-shrink-0 ${isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isCorrect ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                        {q.topic}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        q.difficulty === 'easy'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                          : q.difficulty === 'medium'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white mb-3">{q.question}</p>
                    <div className="space-y-2">
                      {q.options?.map((opt, oIdx) => {
                        const isUserSelected = userAnswer === oIdx
                        const isCorrectOption = correctIdx === oIdx
                        let optClass = 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        if (isCorrectOption) optClass = 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-600'
                        if (isUserSelected && !isCorrect) optClass = 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600'

                        return (
                          <div
                            key={oIdx}
                            className={`px-4 py-2 rounded-lg border ${optClass} flex items-center gap-2`}
                          >
                            {isCorrectOption && <CheckCircle2 size={16} className="text-emerald-500" />}
                            {isUserSelected && !isCorrect && <XCircle size={16} className="text-red-500" />}
                            <span className="text-gray-700 dark:text-gray-300">{opt}</span>
                          </div>
                        )
                      })}
                    </div>
                    {!isCorrect && userAnswer !== undefined && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        Your answer: {q.options?.[userAnswer] ?? 'None'}
                      </p>
                    )}
                    {q.explanation && (
                      <div className="mt-3 p-3 bg-primary-50 dark:bg-primary-900/10 rounded-lg">
                        <p className="text-sm text-primary-700 dark:text-primary-300">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Quiz Mode State
  if (quizMode) {
    const currentQ = quizQuestions[currentIdx]
    const answeredCount = Object.keys(answers).length
    const progress = quizQuestions.length > 0 ? (answeredCount / quizQuestions.length) * 100 : 0

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Technical MCQ Quiz</h2>
          <button
            onClick={resetQuiz}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RotateCcw size={18} />
            Quit
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Question {currentIdx + 1} of {quizQuestions.length}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {answeredCount} answered
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {currentQ && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                {currentQ.topic}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                currentQ.difficulty === 'easy'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : currentQ.difficulty === 'medium'
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                {currentQ.difficulty}
              </span>
            </div>

            <p className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              {currentQ.question}
            </p>

            <div className="space-y-3">
              {currentQ.options?.map((opt, oIdx) => {
                const isSelected = answers[currentQ._id] === oIdx
                return (
                  <button
                    key={oIdx}
                    onClick={() => selectAnswer(currentQ._id, oIdx)}
                    className={`w-full text-left px-5 py-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-3">
            {currentIdx < quizQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="px-5 py-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={submitQuiz}
                disabled={submitting || answeredCount === 0}
                className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Award size={18} />
                    Submit Quiz
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Browse Mode (Default)
  const statCards = [
    { label: 'Total Questions', value: stats?.total ?? questions.length, icon: Code, color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/30' },
    { label: 'Solved', value: stats?.solved ?? 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Attempted', value: stats?.attempted ?? 0, icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { label: 'Accuracy', value: stats?.accuracy ? `${stats.accuracy}%` : '0%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
          <Code className="text-primary-600 dark:text-primary-400" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Technical MCQ Assessment</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Practice technical questions across various topics</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={stat.color} size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Difficulty Breakdown */}
      {stats?.difficultyBreakdown && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Difficulty Breakdown</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.difficultyBreakdown).map(([level, count]) => (
              <span
                key={level}
                className={`text-xs font-medium px-3 py-1 rounded-full ${
                  level === 'easy'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : level === 'medium'
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Start Quiz Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Zap size={20} className="text-amber-500" />
          Start a Quiz
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Topic (optional)</label>
            <select
              value={quizTopic}
              onChange={e => setQuizTopic(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Topics</option>
              {topics.map(t => (
                <option key={typeof t === 'string' ? t : t.name} value={typeof t === 'string' ? t : t.name}>
                  {typeof t === 'string' ? t : t.name} {typeof t === 'object' && t.count !== undefined ? `(${t.count})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-32">
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Questions</label>
            <select
              value={quizCount}
              onChange={e => setQuizCount(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {[5, 10, 15, 20, 30].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <button
            onClick={startQuiz}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <Brain size={18} />
            Start
          </button>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Questions List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Difficulties</option>
              {DIFFICULTIES.map(d => (
                <option key={d.value || d} value={d.value || d}>
                  {(d.label || d).charAt(0).toUpperCase() + (d.label || d).slice(1)}
                </option>
              ))}
            </select>
            <select
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Topics</option>
              {topics.map(t => (
                <option key={typeof t === 'string' ? t : t.name} value={typeof t === 'string' ? t : t.name}>
                  {typeof t === 'string' ? t : t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Question List */}
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Target size={40} className="mx-auto mb-3 opacity-50" />
                <p>No questions found matching your filters.</p>
              </div>
            ) : (
              filteredQuestions.map((q, idx) => (
                <div
                  key={q._id || idx}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                          {q.topic}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          q.difficulty === 'easy'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            : q.difficulty === 'medium'
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium line-clamp-2">
                        {q.question}
                      </p>
                    </div>
                    <ChevronRight className="text-gray-400 flex-shrink-0 mt-1" size={18} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          {/* Top Topics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <BarChart3 size={16} className="text-primary-500" />
              Top Topics
            </h3>
            <div className="space-y-2">
              {topics.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No topics available</p>
              ) : (
                topics.slice(0, 10).map((t, idx) => {
                  const name = typeof t === 'string' ? t : t.name
                  const count = typeof t === 'object' ? t.count : undefined
                  return (
                    <button
                      key={name || idx}
                      onClick={() => setSelectedTopic(selectedTopic === name ? '' : name)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                        selectedTopic === name
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-sm">{name}</span>
                      {count !== undefined && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{count}</span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
              ) : (
                recentActivity.slice(0, 8).map((act, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      act.correct ? 'bg-emerald-500' : 'bg-red-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-900 dark:text-white truncate">{act.topic || 'Quiz'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {act.score !== undefined ? `${act.score}%` : act.result || ''}
                        {act.date && ` - ${new Date(act.date).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TechnicalMCQAssessment
