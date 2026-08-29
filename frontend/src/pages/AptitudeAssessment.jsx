import { useState, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import api from '../services/api'
import { getScoreColor } from '../utils/helpers'
import { DIFFICULTIES } from '../utils/constants'
import {
  Brain, BookOpen, TrendingUp, Clock, CheckCircle2, XCircle,
  Search, ChevronRight, Loader2, Target, Zap, Award, BarChart3, RotateCcw
} from 'lucide-react'

export default function AptitudeAssessment() {
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
          api.get('/assessment/aptitude'),
          api.get('/assessment/aptitude/stats'),
          api.get('/assessment/aptitude/topics'),
          api.get('/assessment/aptitude/recent-activity')
        ])
        setQuestions(qRes.data || [])
        setStats(statsRes.data || null)
        setTopics(topicsRes.data || [])
        setRecentActivity(actRes.data || [])
      } catch (err) {
        console.error('Failed to fetch aptitude data:', err)
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
      const res = await api.post('/assessment/aptitude/submit', payload)
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

  const statCards = [
    {
      label: 'Total Questions',
      value: stats?.total ?? questions.length,
      icon: Brain,
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
    easy: questions.filter(q => q.difficulty === 'easy').length,
    medium: questions.filter(q => q.difficulty === 'medium').length,
    hard: questions.filter(q => q.difficulty === 'hard').length
  }

  // STATE 1: Quiz Result
  if (quizResult) {
    const correct = quizResult.correct ?? 0
    const total = quizResult.total ?? quizQuestions.length
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0

    return (
      <div className="space-y-6">
        <div className="card max-w-3xl mx-auto p-8 text-center">
          <Award size={48} className="mx-auto text-primary-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Quiz Complete</h2>
          <div className="my-8">
            <div className={`text-6xl font-bold ${getScoreColor(percentage)}`}>
              {percentage}%
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              {correct}/{total} correct
            </p>
          </div>
          <div className="text-left space-y-4 mt-8">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg">Review</h3>
            {quizQuestions.map((q, i) => {
              const userAns = answers[q._id]
              const isCorrect = userAns === q.correctIndex
              return (
                <div key={q._id || i} className="border rounded-lg p-4">
                  <p className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                    <span className="text-gray-400 mr-2">Q{i + 1}.</span>
                    {q.question}
                  </p>
                  <div className="space-y-1 ml-6">
                    {q.options.map((opt, oi) => {
                      const isUserSelected = userAns === oi
                      const isCorrectOption = oi === q.correctIndex
                      let optClass = 'text-gray-600 dark:text-gray-400'
                      if (isCorrectOption) optClass = 'text-emerald-600 font-medium'
                      else if (isUserSelected && !isCorrect) optClass = 'text-red-600 line-through'
                      return (
                        <div key={oi} className={`flex items-center gap-2 text-sm ${optClass}`}>
                          {isCorrectOption
                            ? <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                            : isUserSelected
                              ? <XCircle size={14} className="text-red-500 flex-shrink-0" />
                              : <span className="w-3.5" />
                          }
                          <span>{opt}</span>
                        </div>
                      )
                    })}
                  </div>
                  {q.explanation && (
                    <p className="mt-2 ml-6 text-xs text-gray-500 dark:text-gray-400 italic">
                      {q.explanation}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
          <button
            onClick={resetQuiz}
            className="mt-8 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
          >
            <RotateCcw size={16} /> Back to Question Bank
          </button>
        </div>
      </div>
    )
  }

  // STATE 2: Quiz Mode
  if (quizMode && !quizResult) {
    const currentQ = quizQuestions[currentIdx]
    if (!currentQ) return null
    const answeredCount = Object.keys(answers).length
    const allAnswered = answeredCount === quizQuestions.length

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap size={22} className="text-primary-600" /> Aptitude Quiz
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Question {currentIdx + 1} of {quizQuestions.length}
          </p>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / quizQuestions.length) * 100}%` }}
          />
        </div>

        <div className="card p-6">
          <div className="flex items-start gap-3 mb-6">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-sm font-bold">
              {currentIdx + 1}
            </span>
            <div className="flex-1">
              <p className="text-gray-800 dark:text-gray-100 font-medium text-lg">
                {currentQ.question}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`badge ${currentQ.difficulty === 'easy' ? 'badge-easy' : currentQ.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'}`}>
                  {currentQ.difficulty}
                </span>
                {currentQ.topic && (
                  <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    {currentQ.topic}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 ml-11">
            {currentQ.options.map((opt, oi) => (
              <button
                key={oi}
                onClick={() => selectAnswer(currentQ._id, oi)}
                className={`w-full text-left border rounded-lg p-3 cursor-pointer transition-colors ${
                  answers[currentQ._id] === oi
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-medium border-gray-300 dark:border-gray-600">
                    {answers[currentQ._id] === oi ? (
                      <div className="w-3 h-3 rounded-full bg-primary-500" />
                    ) : (
                      String.fromCharCode(65 + oi)
                    )}
                  </span>
                  <span className="text-sm">{opt}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Previous
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {answeredCount}/{quizQuestions.length} answered
          </div>
          {currentIdx === quizQuestions.length - 1 ? (
            <button
              onClick={submitQuiz}
              disabled={!allAnswered || submitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
            >
              {submitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => setCurrentIdx(prev => Math.min(quizQuestions.length - 1, prev + 1))}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Next
            </button>
          )}
        </div>
      </div>
    )
  }

  // STATE 3: Browse Mode
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain size={22} className="text-primary-600" /> Aptitude Assessment
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Practice aptitude questions and track your progress
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
        <span className="badge badge-easy">{difficultyCounts.easy} easy</span>
        <span className="badge badge-medium">{difficultyCounts.medium} medium</span>
        <span className="badge badge-hard">{difficultyCounts.hard} hard</span>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
          <Zap size={16} className="text-primary-500" /> Start a Quiz
        </h3>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Topic</label>
            <select
              value={quizTopic}
              onChange={(e) => setQuizTopic(e.target.value)}
              className="input-field w-full"
            >
              <option value="">All Topics</option>
              {topics.map((t, i) => (
                <option key={i} value={t.name || t}>{t.name ? t.name.replace(/-/g, ' ') : t}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[120px]">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Questions</label>
            <select
              value={quizCount}
              onChange={(e) => setQuizCount(Number(e.target.value))}
              className="input-field w-full"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>
          <button
            onClick={startQuiz}
            disabled={questions.length === 0}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Zap size={16} /> Start Quiz
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search questions..."
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
              {topics.map((t, i) => (
                <option key={i} value={t.name || t}>{t.name ? t.name.replace(/-/g, ' ') : t}</option>
              ))}
            </select>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredQuestions.length} of {questions.length} questions
          </p>

          <div className="space-y-3">
            {filteredQuestions.map((q, i) => (
              <div
                key={q._id || i}
                className="card hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-gray-400 w-8">#{i + 1}</span>
                      <p className="font-medium text-gray-800 dark:text-gray-100 line-clamp-2">
                        {q.question}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 ml-11">
                      <span className={`badge ${q.difficulty === 'easy' ? 'badge-easy' : q.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'}`}>
                        {q.difficulty}
                      </span>
                      {q.topic && (
                        <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          {q.topic.replace(/-/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400 flex-shrink-0 ml-2" size={18} />
                </div>
              </div>
            ))}
            {filteredQuestions.length === 0 && (
              <div className="card text-center py-12">
                <Brain className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-500 dark:text-gray-400">No questions match your filters</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
              <Target size={16} className="text-primary-500" /> Top Topics
            </h3>
            <div className="space-y-3">
              {topics.slice(0, 10).map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                    {(t.name || t).replace(/-/g, ' ')}
                  </span>
                  <span className="badge bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                    {t.count} questions
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
                  {a.percentage >= 50
                    ? <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    : <XCircle size={14} className="text-red-500 flex-shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                      {a.topic ? a.topic.replace(/-/g, ' ') : 'Aptitude Quiz'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {a.score}/{a.total} &bull; {a.percentage}% &bull; {new Date(a.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-sm text-gray-400">No activity yet. Start a quiz!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
