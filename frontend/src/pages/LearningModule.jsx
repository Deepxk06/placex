import { useState, useEffect } from 'react'
import api from '../services/api'
import { BookOpen, CheckCircle, Clock, Star, ChevronRight, Trophy, Target, TrendingUp, ArrowLeft, Loader2 } from 'lucide-react'

const DIFFICULTY_MAP = {
  beginner: { label: 'Beginner', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
  intermediate: { label: 'Intermediate', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400' },
  advanced: { label: 'Advanced', cls: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400' },
}

function ProgressBar({ value, size = 'md' }) {
  const h = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'
  return (
    <div className={`w-full ${h} rounded-full bg-gray-200 dark:bg-gray-700`}>
      <div className={`${h} rounded-full transition-all duration-500 ${value >= 80 ? 'bg-emerald-500' : value >= 40 ? 'bg-primary-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

export default function LearningModule() {
  const [stats, setStats] = useState(null)
  const [recommended, setRecommended] = useState([])
  const [topics, setTopics] = useState([])
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/learning/stats').catch(() => ({ data: null })),
      api.get('/learning/recommended').catch(() => ({ data: [] })),
      api.get('/learning/topics').catch(() => ({ data: [] })),
    ]).then(([s, r, t]) => {
      setStats(s.data)
      setRecommended(Array.isArray(r.data?.recommended) ? r.data.recommended.slice(0, 10) : Array.isArray(r.data) ? r.data.slice(0, 10) : [])
      setTopics(Array.isArray(t.data?.topics) ? t.data.topics : Array.isArray(t.data) ? t.data : [])
    }).finally(() => setLoading(false))
  }, [])

  const filteredTopics = topics.filter((t) => {
    if (filter === 'all') return true
    return t.career_type === filter
  })

  const openTopic = async (topicId) => {
    setDetailLoading(true)
    setSelectedTopic(null)
    try {
      const res = await api.get(`/learning/topics/${topicId}`)
      setSelectedTopic(res.data)
    } catch {
      const fallback = topics.find((t) => (t._id || t.id) === topicId)
      if (fallback) setSelectedTopic(fallback)
    } finally {
      setDetailLoading(false)
    }
  }

  const updateProgress = async (topicId, progressPct, score) => {
    setUpdateLoading(true)
    try {
      const res = await api.post('/learning/progress', {
        topic_id: topicId,
        progress_pct: progressPct,
        score,
      })
      const updated = res.data
      setTopics((prev) => prev.map((t) => (t._id || t.id) === (updated?._id || updated?.id || topicId) ? { ...t, ...updated } : t))
      setSelectedTopic((prev) => prev && (prev._id || prev.id) === (updated?._id || updated?.id || topicId) ? { ...prev, ...updated } : prev)
      const sRes = await api.get('/learning/stats').catch(() => null)
      if (sRes?.data) setStats(sRes.data)
      const rRes = await api.get('/learning/recommended').catch(() => null)
      if (Array.isArray(rRes?.data)) setRecommended(rRes.data.slice(0, 10))
    } catch {} finally {
      setUpdateLoading(false)
    }
  }

  const statCards = stats ? [
    { label: 'Total Topics', value: stats.total_topics ?? stats.totalTopics ?? 0, icon: BookOpen, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-100 dark:bg-primary-500/15' },
    { label: 'Completed', value: stats.completed ?? stats.completed_topics ?? 0, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
    { label: 'Avg Score', value: stats.average_score ?? stats.avgScore ?? 0, icon: Star, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/15', suffix: '%' },
    { label: 'In Progress', value: stats.in_progress ?? stats.inProgress ?? 0, icon: TrendingUp, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-500/15' },
  ] : []

  if (selectedTopic) {
    return (
      <div className="space-y-6 max-w-4xl">
        <button onClick={() => setSelectedTopic(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <ArrowLeft size={16} /> Back to topics
        </button>

        {detailLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary-500" size={32} /></div>
        ) : (
          <>
            <div className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2 min-w-0">
                  <h1 className="text-2xl font-bold dark:text-white">{selectedTopic.name || selectedTopic.title}</h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-400">{selectedTopic.category || 'General'}</span>
                    <span className={`badge ${(DIFFICULTY_MAP[selectedTopic.difficulty] || DIFFICULTY_MAP.beginner).cls}`}>
                      {(DIFFICULTY_MAP[selectedTopic.difficulty] || DIFFICULTY_MAP.beginner).label}
                    </span>
                    {selectedTopic.career_type && (
                      <span className="badge bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">{selectedTopic.career_type}</span>
                    )}
                  </div>
                  {selectedTopic.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">{selectedTopic.description}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">{selectedTopic.progress_pct ?? selectedTopic.progress ?? 0}%</div>
                  <div className="text-xs text-gray-400">Progress</div>
                </div>
              </div>
              <div className="mt-4"><ProgressBar value={selectedTopic.progress_pct ?? selectedTopic.progress ?? 0} size="lg" /></div>
              {selectedTopic.score != null && (
                <div className="mt-3 flex items-center gap-2">
                  <Trophy size={16} className="text-amber-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Score: <span className="text-amber-600 dark:text-amber-400">{selectedTopic.score}%</span></span>
                </div>
              )}
            </div>

            {Array.isArray(selectedTopic.subtopics) && selectedTopic.subtopics.length > 0 && (
              <div className="card">
                <h2 className="font-semibold mb-3 flex items-center gap-2 dark:text-white">
                  <Target size={18} className="text-primary-500" /> Subtopics ({selectedTopic.subtopics.length})
                </h2>
                <div className="space-y-2">
                  {selectedTopic.subtopics.map((sub, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${sub.completed || sub.progress_pct === 100 ? 'bg-emerald-500' : sub.progress_pct > 0 ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium dark:text-gray-200">{sub.name || sub.title}</span>
                        {sub.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub.description}</p>}
                      </div>
                      {sub.progress_pct != null && (
                        <div className="w-20 shrink-0">
                          <ProgressBar value={sub.progress_pct} size="sm" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(selectedTopic.resources) && selectedTopic.resources.length > 0 && (
              <div className="card">
                <h2 className="font-semibold mb-3 dark:text-white">Resources</h2>
                <div className="space-y-2">
                  {selectedTopic.resources.map((res, i) => (
                    <a key={i} href={res.url || '#'} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                      <div className="bg-primary-100 dark:bg-primary-500/15 p-2 rounded-lg shrink-0">
                        <BookOpen size={16} className="text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium group-hover:text-primary-600 dark:group-hover:text-primary-400 dark:text-gray-200">{res.title || res.name || 'Resource'}</span>
                        {res.type && <span className="text-xs text-gray-400 ml-2">({res.type})</span>}
                      </div>
                      <ChevronRight size={14} className="text-gray-400 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="card">
              <h2 className="font-semibold mb-3 dark:text-white">Update Progress</h2>
              <ProgressForm
                currentProgress={selectedTopic.progress_pct ?? selectedTopic.progress ?? 0}
                currentScore={selectedTopic.score}
                loading={updateLoading}
                onSubmit={(pct, score) => updateProgress(selectedTopic._id || selectedTopic.id, pct, score)}
              />
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Learning Module</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your learning progress across all topics</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary-500" size={32} /></div>
      ) : (
        <>
          {statCards.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((s, i) => (
                <div key={i} className="card flex items-center gap-3">
                  <div className={`${s.bg} p-3 rounded-xl`}>
                    <s.icon size={20} className={s.color} />
                  </div>
                  <div>
                    <div className="text-xl font-bold dark:text-white">{s.value}{s.suffix || ''}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {recommended.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star size={18} className="text-amber-500" />
                <h2 className="font-semibold dark:text-white">Recommended For You</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {recommended.map((t) => (
                  <TopicCard key={t._id || t.id} topic={t} onClick={openTopic} compact />
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h2 className="font-semibold dark:text-white">All Topics ({filteredTopics.length})</h2>
              <div className="flex gap-2">
                {[{ id: 'all', label: 'All' }, { id: 'technical', label: 'Technical' }, { id: 'non-technical', label: 'Non-Technical' }].map((f) => (
                  <button key={f.id} onClick={() => setFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f.id ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredTopics.length === 0 ? (
              <div className="card text-center py-12 text-gray-400 dark:text-gray-500">
                <BookOpen size={48} className="mx-auto mb-3 opacity-50" />
                <p>No topics available{filter !== 'all' ? ` for ${filter}` : ''}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTopics.map((t) => (
                  <TopicCard key={t._id || t.id} topic={t} onClick={openTopic} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function TopicCard({ topic, onClick, compact = false }) {
  const id = topic._id || topic.id
  const progress = topic.progress_pct ?? topic.progress ?? 0
  const difficulty = DIFFICULTY_MAP[topic.difficulty] || DIFFICULTY_MAP.beginner
  const subtopicCount = Array.isArray(topic.subtopics) ? topic.subtopics.length : topic.subtopic_count ?? 0

  if (compact) {
    return (
      <button onClick={() => onClick(id)}
        className="card text-left hover:border-primary-300 dark:hover:border-primary-600 transition-all group">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-sm font-medium truncate dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">{topic.name || topic.title}</span>
          <ChevronRight size={14} className="text-gray-400 shrink-0 group-hover:text-primary-500" />
        </div>
        <span className={`text-xs ${difficulty.cls}`}>{difficulty.label}</span>
        <div className="mt-2"><ProgressBar value={progress} size="sm" /></div>
        {topic.score != null && <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">Score: {topic.score}%</div>}
      </button>
    )
  }

  return (
    <div onClick={() => onClick(id)}
      className="card cursor-pointer hover:border-primary-300 dark:hover:border-primary-600 transition-all group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold group-hover:text-primary-600 dark:group-hover:text-primary-400 dark:text-white transition-colors">{topic.name || topic.title}</h3>
        <ChevronRight size={16} className="text-gray-400 shrink-0 mt-0.5 group-hover:text-primary-500" />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-400 text-xs">{topic.category || 'General'}</span>
        <span className={`badge text-xs ${difficulty.cls}`}>{difficulty.label}</span>
        {topic.career_type && (
          <span className="badge bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 text-xs">{topic.career_type}</span>
        )}
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500 dark:text-gray-400">Progress</span>
          <span className="font-medium dark:text-gray-300">{progress}%</span>
        </div>
        <ProgressBar value={progress} size="sm" />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Target size={12} /> {subtopicCount} subtopic{subtopicCount !== 1 ? 's' : ''}
        </span>
        {topic.score != null && (
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <Trophy size={12} /> {topic.score}%
          </span>
        )}
      </div>
    </div>
  )
}

function ProgressForm({ currentProgress, currentScore, loading, onSubmit }) {
  const [progress, setProgress] = useState(currentProgress || 0)
  const [score, setScore] = useState(currentScore ?? '')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setProgress(currentProgress || 0)
    setScore(currentScore ?? '')
  }, [currentProgress, currentScore])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess(false)
    await onSubmit(Number(progress), score === '' ? null : Number(score))
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Progress ({progress}%)</label>
        <input type="range" min="0" max="100" value={progress} onChange={(e) => setProgress(e.target.value)}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-primary-600" />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Score (%)</label>
        <input type="number" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)}
          placeholder="Optional" className="input-field w-full sm:w-40" />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={16} /> : <TrendingUp size={16} />}
          {loading ? 'Updating...' : 'Update Progress'}
        </button>
        {success && (
          <span className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle size={14} /> Updated
          </span>
        )}
      </div>
    </form>
  )
}
