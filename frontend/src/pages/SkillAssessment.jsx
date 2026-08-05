import { useState, useEffect } from 'react'
import api from '../services/api'
import { Code2, Brain, BookOpen, BarChart3, Target, ChevronRight } from 'lucide-react'
import { getScoreColor } from '../utils/helpers'

export default function SkillAssessment() {
  const [tab, setTab] = useState('coding')
  const [problems, setProblems] = useState([])
  const [aptitudeQuestions, setAptitudeQuestions] = useState([])
  const [mcqQuestions, setMcqQuestions] = useState([])
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [result, setResult] = useState(null)
  const [aptitudeAnswers, setAptitudeAnswers] = useState({})
  const [aptitudeResult, setAptitudeResult] = useState(null)
  const [mcqAnswers, setMcqAnswers] = useState({})
  const [mcqResult, setMcqResult] = useState(null)
  const [skillGap, setSkillGap] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tab === 'coding') {
      api.get('/assessment/coding').then(r => setProblems(r.data)).catch(() => {})
    } else if (tab === 'aptitude') {
      api.get('/assessment/aptitude').then(r => setAptitudeQuestions(r.data)).catch(() => {})
    } else if (tab === 'mcq') {
      api.get('/assessment/mcq').then(r => setMcqQuestions(r.data)).catch(() => {})
    } else if (tab === 'skill-gap') {
      api.get('/assessment/skill-gap').then(r => setSkillGap(r.data)).catch(() => {})
    }
  }, [tab])

  const submitCode = async () => {
    if (!selectedProblem || !code) return
    setLoading(true)
    try {
      const res = await api.post(`/assessment/coding/submit?problem_id=${selectedProblem._id}&language=${language}&code=${encodeURIComponent(code)}`)
      setResult(res.data)
    } catch {} finally { setLoading(false) }
  }

  const submitAptitude = async () => {
    setLoading(true)
    const answers = Object.entries(aptitudeAnswers).map(([qId, selectedIndex]) => ({ questionId: qId, selectedIndex, timeTaken: 30 }))
    try {
      const res = await api.post('/assessment/aptitude/submit', answers)
      setAptitudeResult(res.data)
    } catch {} finally { setLoading(false) }
  }

  const submitMCQ = async () => {
    setLoading(true)
    const answers = Object.entries(mcqAnswers).map(([qId, selectedIndex]) => ({ questionId: qId, selectedIndex, timeTaken: 30 }))
    try {
      const res = await api.post('/assessment/mcq/submit', answers)
      setMcqResult(res.data)
    } catch {} finally { setLoading(false) }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold">Skill Assessment</h1>
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {[
          { id: 'coding', label: 'Coding', icon: Code2 },
          { id: 'aptitude', label: 'Aptitude', icon: Brain },
          { id: 'mcq', label: 'Technical MCQ', icon: BookOpen },
          { id: 'skill-gap', label: 'Skill Gap', icon: Target },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'
            }`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'coding' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h2 className="font-semibold">Problems</h2>
            {problems.map((p) => (
              <div key={p._id} className={`card cursor-pointer transition-colors ${selectedProblem?._id === p._id ? 'border-primary-500' : ''}`}
                onClick={() => { setSelectedProblem(p); setResult(null); setCode('') }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-medium">{p.title}</span>
                  <span className={`badge ${
                    p.difficulty === 'easy' ? 'badge-success' : p.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'
                  }`}>{p.difficulty}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {p.topics?.map((t, i) => <span key={i} className="badge bg-gray-100 text-gray-600">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {selectedProblem && (
              <>
                <div className="card">
                  <h3 className="font-semibold mb-2">{selectedProblem.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{selectedProblem.description}</p>
                  {selectedProblem.examples?.map((ex, i) => (
                    <div key={i} className="bg-gray-50 p-2 rounded text-sm mb-2">
                      <div><span className="font-medium">Input:</span> {ex.input}</div>
                      <div><span className="font-medium">Output:</span> {ex.output}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                <select className="input-field w-32" value={language} onChange={e => setLanguage(e.target.value)}>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                </select>
                </div>
                <textarea className="input-field font-mono text-sm" rows={10}
                  placeholder="Write your code here..." value={code} onChange={e => setCode(e.target.value)} />
                <button onClick={submitCode} disabled={loading || !code} className="btn-primary">
                  {loading ? 'Running...' : 'Submit Solution'}
                </button>
                {result && (
                  <div className="card">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">Status:</span>
                      <span className={`badge ${result.status === 'accepted' ? 'badge-success' : 'badge-danger'}`}>
                        {result.status === 'accepted' ? 'Accepted' : 'Wrong Answer'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span>Passed: {result.passedTestCases}/{result.totalTestCases} test cases</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'aptitude' && (
        <div className="space-y-4">
          {!aptitudeResult ? (
            <>
              {aptitudeQuestions.map((q, i) => (
                <div key={q._id} className="card">
                  <p className="font-medium mb-3">{i + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, j) => (
                      <label key={j} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        aptitudeAnswers[q._id] === j ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input type="radio" name={q._id} checked={aptitudeAnswers[q._id] === j}
                          onChange={() => setAptitudeAnswers({...aptitudeAnswers, [q._id]: j})} className="accent-primary-600" />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={submitAptitude} disabled={loading || Object.keys(aptitudeAnswers).length === 0} className="btn-primary">
                {loading ? 'Submitting...' : 'Submit Answers'}
              </button>
            </>
          ) : (
            <div className="card text-center">
              <h2 className="text-xl font-bold mb-2">Your Score</h2>
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(aptitudeResult.percentage)}`}>
                {aptitudeResult.percentage}%
              </div>
              <p className="text-gray-500">{aptitudeResult.score}/{aptitudeResult.total} correct</p>
              <button onClick={() => { setAptitudeResult(null); setAptitudeAnswers({}) }} className="btn-secondary mt-4">
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'mcq' && (
        <div className="space-y-4">
          {!mcqResult ? (
            <>
              {mcqQuestions.map((q, i) => (
                <div key={q._id} className="card">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <span className="text-xs font-medium text-gray-400">{i + 1}. {q.topic}</span>
                    <span className={`badge ${q.difficulty === 'easy' ? 'badge-success' : q.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'}`}>{q.difficulty}</span>
                  </div>
                  <p className="font-medium mb-3">{q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, j) => (
                      <label key={j} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        mcqAnswers[q._id] === j ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input type="radio" name={`mcq_${q._id}`} checked={mcqAnswers[q._id] === j}
                          onChange={() => setMcqAnswers({...mcqAnswers, [q._id]: j})} className="accent-primary-600" />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {mcqQuestions.length > 0 && (
                <button onClick={submitMCQ} disabled={loading || Object.keys(mcqAnswers).length === 0} className="btn-primary">
                  {loading ? 'Submitting...' : `Submit Answers (${Object.keys(mcqAnswers).length}/${mcqQuestions.length} answered)`}
                </button>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="card text-center">
                <h2 className="text-xl font-bold mb-2">Your Score</h2>
                <div className={`text-4xl font-bold mb-2 ${getScoreColor(mcqResult.percentage)}`}>
                  {mcqResult.percentage}%
                </div>
                <p className="text-gray-500">{mcqResult.score}/{mcqResult.total} correct</p>
                <button onClick={() => { setMcqResult(null); setMcqAnswers({}) }} className="btn-secondary mt-4">
                  Try Again
                </button>
              </div>
              {mcqResult.results?.length > 0 && (
                <div className="card">
                  <h2 className="font-semibold mb-3">Detailed Review</h2>
                  <div className="space-y-3">
                    {mcqQuestions.map((q, i) => {
                      const r = mcqResult.results.find(res => res.questionId === q._id)
                      if (!r) return null
                      return (
                        <div key={q._id} className={`p-3 rounded-lg ${r.correct ? 'bg-green-50' : 'bg-red-50'}`}>
                          <div className="flex items-start gap-2">
                            <span className={`text-sm font-medium ${r.correct ? 'text-green-700' : 'text-red-700'}`}>
                              {r.correct ? '✓' : '✗'}
                            </span>
                            <div>
                              <p className="text-sm font-medium">{q.question}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                Your answer: {q.options[r.selected] ?? 'Not answered'}
                              </p>
                              {!r.correct && (
                                <p className="text-xs text-green-700 mt-1">
                                  Correct: {q.options[r.correctIndex]}
                                </p>
                              )}
                              {(r.explanation || q.subtopic) && (
                                <p className="text-xs text-gray-500 mt-1">{r.explanation || q.subtopic}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          {mcqQuestions.length === 0 && !mcqResult && (
            <div className="card text-center text-gray-400 py-10">
              <BookOpen size={48} className="mx-auto mb-3 opacity-50" />
              <p>No MCQ questions available yet. Check back soon!</p>
            </div>
          )}
        </div>
      )}

      {tab === 'skill-gap' && skillGap && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-semibold mb-3">Your Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skillGap.currentSkills?.map((s, i) => (
                <span key={i} className="badge-success">{s}</span>
              ))}
            </div>
          </div>
          <div className="card">
            <h2 className="font-semibold mb-3">Target Skills ({skillGap.targetSkills?.length})</h2>
            <div className="flex flex-wrap gap-2">
              {skillGap.targetSkills?.map((s, i) => (
                <span key={i} className="badge bg-blue-100 text-blue-800">{s}</span>
              ))}
            </div>
          </div>
          <div className="card lg:col-span-2">
            <h2 className="font-semibold mb-3">Missing Skills</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {skillGap.missingSkills?.map((s, i) => (
                <span key={i} className="badge-warning">{s}</span>
              ))}
            </div>
            <h3 className="font-medium mb-2">Recommendations</h3>
            <ul className="space-y-2">
              {skillGap.recommendations?.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <ChevronRight size={14} className="text-primary-500 mt-0.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
