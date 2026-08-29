import { useState, useEffect } from 'react'
import api from '../services/api'
import { MessageSquare, ThumbsUp, ThumbsDown, Target, Send, ChevronDown, ChevronUp } from 'lucide-react'

const CATEGORY_COLORS = {
  technology: { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-300' },
  society: { bg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-700 dark:text-green-300' },
  environment: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300' },
  business: { bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-700 dark:text-orange-300' },
  education: { bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-700 dark:text-purple-300' },
  politics: { bg: 'bg-rose-100 dark:bg-rose-500/20', text: 'text-rose-700 dark:text-rose-300' },
  science: { bg: 'bg-cyan-100 dark:bg-cyan-500/20', text: 'text-cyan-700 dark:text-cyan-300' },
  lifestyle: { bg: 'bg-yellow-100 dark:bg-yellow-500/20', text: 'text-yellow-700 dark:text-yellow-300' },
  entertainment: { bg: 'bg-pink-100 dark:bg-pink-500/20', text: 'text-pink-700 dark:text-pink-300' },
}

const DIFFICULTY_STYLES = {
  easy: 'badge-success',
  medium: 'badge-warning',
  hard: 'badge-danger',
}

function CategoryBadge({ category }) {
  const style = CATEGORY_COLORS[category] || { bg: 'bg-gray-100 dark:bg-gray-500/20', text: 'text-gray-700 dark:text-gray-300' }
  return (
    <span className={`badge text-xs font-medium ${style.bg} ${style.text}`}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  )
}

function DifficultyBadge({ difficulty }) {
  const d = difficulty || 'medium'
  return (
    <span className={`badge text-xs ${DIFFICULTY_STYLES[d] || 'badge-warning'}`}>
      {d.charAt(0).toUpperCase() + d.slice(1)}
    </span>
  )
}

function TopicCard({ topic, isExpanded, onToggle }) {
  return (
    <div className={`card transition-all duration-200 ${isExpanded ? 'ring-2 ring-primary-400 dark:ring-primary-500' : 'hover:border-gray-300 dark:hover:border-gray-600'}`}>
      <button onClick={onToggle} className="w-full text-left cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 leading-snug">{topic.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{topic.description}</p>
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={topic.category} />
              <DifficultyBadge difficulty={topic.difficulty} />
            </div>
          </div>
          <div className="shrink-0 mt-1 text-gray-400">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700 space-y-5 animate-in fade-in duration-200">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{topic.description}</p>

          {topic.points_for && topic.points_for.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-green-100 dark:bg-green-500/20 p-1.5 rounded-lg">
                  <ThumbsUp size={16} className="text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-semibold text-sm text-green-700 dark:text-green-400">Points FOR</h4>
              </div>
              <ul className="space-y-2 ml-9">
                {topic.points_for.map((point, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 shrink-0">&#10003;</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {topic.points_against && topic.points_against.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-red-100 dark:bg-red-500/20 p-1.5 rounded-lg">
                  <ThumbsDown size={16} className="text-red-600 dark:text-red-400" />
                </div>
                <h4 className="font-semibold text-sm text-red-700 dark:text-red-400">Points AGAINST</h4>
              </div>
              <ul className="space-y-2 ml-9">
                {topic.points_against.map((point, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5 shrink-0">&#10007;</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {topic.key_arguments && topic.key_arguments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-amber-100 dark:bg-amber-500/20 p-1.5 rounded-lg">
                  <Target size={16} className="text-amber-600 dark:text-amber-400" />
                </div>
                <h4 className="font-semibold text-sm text-amber-700 dark:text-amber-400">Key Arguments</h4>
              </div>
              <ul className="space-y-2 ml-9">
                {topic.key_arguments.map((arg, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5 shrink-0">&#9733;</span>
                    {arg}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {topic.opening_statement && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={14} className="text-primary-500" />
                <h4 className="font-semibold text-sm text-primary-700 dark:text-primary-400">Opening Statement</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed ml-6">
                "{topic.opening_statement}"
              </p>
            </div>
          )}

          {topic.conclusion && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={14} className="text-primary-500" />
                <h4 className="font-semibold text-sm text-primary-700 dark:text-primary-400">Conclusion</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed ml-6">
                "{topic.conclusion}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PracticeSection({ topics }) {
  const [selectedTopicId, setSelectedTopicId] = useState('')
  const [responseText, setResponseText] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!selectedTopicId || !responseText.trim()) return
    setLoading(true)
    setError('')
    setFeedback(null)
    try {
      const res = await api.post('/gd/practice', {
        topic_id: Number(selectedTopicId),
        response_text: responseText.trim(),
      })
      setFeedback(res.data)
    } catch (e) {
      const detail = e?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to get feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-amber-600 dark:text-amber-400'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const scoreRing = (score) => {
    if (score >= 80) return 'border-green-500'
    if (score >= 60) return 'border-amber-500'
    if (score >= 40) return 'border-orange-500'
    return 'border-red-500'
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-primary-100 dark:bg-primary-500/20 p-1.5 rounded-lg">
            <Send size={16} className="text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Practice GD Response</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Select Topic</label>
            <select
              className="input-field w-full"
              aria-label="Select GD topic for practice"
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
            >
              <option value="">Choose a topic...</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.title} ({t.category})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Your GD Response</label>
            <textarea
              className="input-field w-full font-mono text-sm"
              rows={8}
              placeholder="Write your GD response here. Structure it with a clear opening, key points, and a conclusion. Address both sides of the argument if possible..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">{responseText.length} characters</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !selectedTopicId || !responseText.trim()}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Analyzing...
              </>
            ) : (
              <>
                <Send size={16} />
                Get AI Feedback
              </>
            )}
          </button>

          {error && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card text-center">
              <div className={`text-4xl font-bold mb-1 ${scoreColor(feedback.score)}`}>
                {feedback.score}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Overall Score</div>
              <div className={`mx-auto mt-2 w-12 h-1 rounded-full ${scoreRing(feedback.score)} border-2`} />
            </div>
            <div className="md:col-span-2 card">
              <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-100">Feedback</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{feedback.feedback}</p>
            </div>
          </div>

          {feedback.strengths && feedback.strengths.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-green-700 dark:text-green-400">
                <ThumbsUp size={16} />
                Strengths
              </h3>
              <ul className="space-y-2">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-green-500 mt-0.5 shrink-0">&#10003;</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {feedback.improvements && feedback.improvements.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Target size={16} />
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {feedback.improvements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-amber-500 mt-0.5 shrink-0">&#9733;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => { setFeedback(null); setResponseText(''); setSelectedTopicId('') }}
            className="btn-secondary"
          >
            Practice Another Topic
          </button>
        </div>
      )}
    </div>
  )
}

export default function GDPreparation() {
  const [topics, setTopics] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('topics')

  useEffect(() => {
    setLoading(true)
    api.get('/gd/topics')
      .then((res) => setTopics(res.data.topics))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const categories = ['all', ...new Set(topics.map((t) => t.category))]

  const filteredTopics = filterCategory === 'all'
    ? topics
    : topics.filter((t) => t.category === filterCategory)

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="bg-primary-100 dark:bg-primary-500/20 p-2 rounded-xl">
          <MessageSquare size={24} className="text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">GD Preparation</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Master Group Discussions with AI-powered practice</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        {[
          { id: 'topics', label: 'Browse Topics', icon: MessageSquare },
          { id: 'practice', label: 'Practice', icon: Send },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'topics' && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat === 'all' ? 'All Topics' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <span className="animate-spin inline-block w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full" />
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="card text-center py-12 text-gray-400 dark:text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-3 opacity-50" />
              <p>No topics found{filterCategory !== 'all' ? ` in "${filterCategory}" category` : ''}.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTopics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  isExpanded={expandedId === topic.id}
                  onToggle={() => setExpandedId(expandedId === topic.id ? null : topic.id)}
                />
              ))}
            </div>
          )}

          {!loading && filteredTopics.length > 0 && (
            <div className="text-center text-sm text-gray-400 dark:text-gray-500">
              Showing {filteredTopics.length} of {topics.length} topics
            </div>
          )}
        </div>
      )}

      {activeTab === 'practice' && (
        <PracticeSection topics={topics} />
      )}
    </div>
  )
}
