import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import api from '../../services/api'
import CodingHeader from './CodingHeader'
import ProblemDescription from './ProblemDescription'
import CodeEditor from './CodeEditor'
import TestcasePanel from './TestcasePanel'
import SubmissionResult from './SubmissionResult'
import SubmissionHistory from './SubmissionHistory'
import {
  Loader2, AlertCircle, ChevronLeft, ChevronRight, Play, Send,
  Clock, Cpu, Bookmark, BookmarkCheck, History, Lightbulb,
  Maximize2, Minimize2, RotateCcw
} from 'lucide-react'

const DEFAULT_TEMPLATES = {
  python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        pass`,
  javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};`,
  java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}`,
  cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};`,
  c: `#include <stdlib.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    \n}`,
  go: `func twoSum(nums []int, target int) []int {\n    \n}`,
  rust: `impl Solution {\n    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {\n        \n    }\n}`,
  typescript: `function twoSum(nums: number[], target: number): number[] {\n    \n};`,
}

export default function CodingWorkspace() {
  const { problemId } = useParams()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [runResult, setRunResult] = useState(null)
  const [submitResult, setSubmitResult] = useState(null)
  const [activeTab, setActiveTab] = useState('description')
  const [bottomTab, setBottomTab] = useState('testcases')

  const [submissions, setSubmissions] = useState([])
  const [showSubmissions, setShowSubmissions] = useState(false)
  const [showHints, setShowHints] = useState(false)
  const [selectedTestCase, setSelectedTestCase] = useState(0)

  const [splitRatio, setSplitRatio] = useState(40)
  const [isDragging, setIsDragging] = useState(false)

  const [nextProblem, setNextProblem] = useState(null)
  const [prevProblem, setPrevProblem] = useState(null)

  const LANGUAGES = [
    { id: 'python', name: 'Python', monaco: 'python' },
    { id: 'javascript', name: 'JavaScript', monaco: 'javascript' },
    { id: 'java', name: 'Java', monaco: 'java' },
    { id: 'cpp', name: 'C++', monaco: 'cpp' },
    { id: 'c', name: 'C', monaco: 'c' },
    { id: 'go', name: 'Go', monaco: 'go' },
    { id: 'rust', name: 'Rust', monaco: 'rust' },
    { id: 'typescript', name: 'TypeScript', monaco: 'typescript' },
  ]

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get(`/coding/problems/${problemId}`)
        setProblem(res.data)
        setCode(DEFAULT_TEMPLATES[res.data.solution?.python ? 'python' : language] || DEFAULT_TEMPLATES.python)

        const [nextRes, prevRes] = await Promise.all([
          api.get(`/coding/problems/${problemId}/next`).catch(() => ({ data: null })),
          api.get(`/coding/problems/${problemId}/prev`).catch(() => ({ data: null })),
        ])
        setNextProblem(nextRes.data)
        setPrevProblem(prevRes.data)
      } catch (err) {
        setError('Failed to load problem')
      } finally {
        setLoading(false)
      }
    }
    fetchProblem()
  }, [problemId])

  useEffect(() => {
    if (problem) {
      setCode(DEFAULT_TEMPLATES[language] || DEFAULT_TEMPLATES.python)
    }
  }, [language])

  useEffect(() => {
    const handleRunEvent = () => handleRun()
    const handleSubmitEvent = () => handleSubmit()
    window.addEventListener('coding-run', handleRunEvent)
    window.addEventListener('coding-submit', handleSubmitEvent)
    return () => {
      window.removeEventListener('coding-run', handleRunEvent)
      window.removeEventListener('coding-submit', handleSubmitEvent)
    }
  }, [code, language, problem])

  const handleRun = async () => {
    if (running || !problem) return
    setRunning(true)
    setRunResult(null)
    setBottomTab('testcases')
    try {
      const res = await api.post('/coding/run', {
        language,
        code,
        problem_id: problem.id,
        test_case_index: selectedTestCase,
      })
      setRunResult(res.data)
    } catch (err) {
      setRunResult({ status: 'error', stderr: err.response?.data?.detail || 'Run failed' })
    } finally {
      setRunning(false)
    }
  }

  const handleSubmit = async () => {
    if (submitting || !problem) return
    setSubmitting(true)
    setSubmitResult(null)
    setBottomTab('result')
    try {
      const res = await api.post('/coding/submit', {
        problem_id: problem.id,
        language,
        code,
      })
      setSubmitResult(res.data)
      loadSubmissions()
    } catch (err) {
      setSubmitResult({ status: 'error', error: err.response?.data?.detail || 'Submit failed' })
    } finally {
      setSubmitting(false)
    }
  }

  const loadSubmissions = async () => {
    if (!problem) return
    try {
      const res = await api.get(`/coding/submissions/${problem.id}`)
      setSubmissions(res.data || [])
    } catch (err) {
      console.error('Failed to load submissions')
    }
  }

  const handleBookmark = async () => {
    if (!problem) return
    try {
      const res = await api.post('/coding/bookmark', { problem_id: problem.id })
      setProblem(prev => ({ ...prev, bookmarked: res.data.bookmarked }))
    } catch (err) {
      console.error('Bookmark failed')
    }
  }

  const handleReset = () => {
    setCode(DEFAULT_TEMPLATES[language] || DEFAULT_TEMPLATES.python)
    setRunResult(null)
    setSubmitResult(null)
  }

  const handleDragStart = (e) => {
    e.preventDefault()
    setIsDragging(true)
    const startX = e.clientX
    const startRatio = splitRatio
    const container = document.getElementById('workspace-container')
    const containerWidth = container?.offsetWidth || window.innerWidth

    const handleMouseMove = (e) => {
      const delta = e.clientX - startX
      const newRatio = Math.max(25, Math.min(70, startRatio + (delta / containerWidth) * 100))
      setSplitRatio(newRatio)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <Loader2 className="animate-spin text-primary-500" size={40} />
      </div>
    )
  }

  if (error || !problem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 gap-4">
        <AlertCircle className="text-red-500" size={48} />
        <p className="text-lg text-gray-700 dark:text-gray-200">{error || 'Problem not found'}</p>
        <button onClick={() => navigate('/skill-assessment')} className="btn-primary">
          Back to Assessment
        </button>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <CodingHeader
        problem={problem}
        language={language}
        languages={LANGUAGES}
        onLanguageChange={setLanguage}
        onBookmark={handleBookmark}
        onShowSubmissions={() => { loadSubmissions(); setShowSubmissions(!showSubmissions) }}
        onBack={() => navigate('/skill-assessment')}
        nextProblem={nextProblem}
        prevProblem={prevProblem}
        onNavigate={(id) => navigate(`/coding/problem/${id}`)}
      />

      <div id="workspace-container" className="flex-1 flex overflow-hidden">
        <div style={{ width: `${splitRatio}%` }} className="flex flex-col border-r border-gray-200 dark:border-gray-800 overflow-hidden">
          <ProblemDescription
            problem={problem}
            showHints={showHints}
            onToggleHints={() => setShowHints(!showHints)}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        <div
          className={`w-1.5 cursor-col-resize hover:bg-primary-400 transition-colors flex-shrink-0 ${isDragging ? 'bg-primary-400' : 'bg-gray-200 dark:bg-gray-800'}`}
          onMouseDown={handleDragStart}
        />

        <div style={{ width: `${100 - splitRatio}%` }} className="flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              code={code}
              onChange={setCode}
              language={LANGUAGES.find(l => l.id === language)?.monaco || 'python'}
              isDark={isDark}
            />
          </div>

          <div className="h-80 border-t border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex gap-1">
                <button
                  onClick={() => setBottomTab('testcases')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    bottomTab === 'testcases'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Test Cases
                </button>
                <button
                  onClick={() => { setBottomTab('result'); if (!submitResult) loadSubmissions() }}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    bottomTab === 'result'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Result
                </button>
                <button
                  onClick={() => { setBottomTab('submissions'); loadSubmissions() }}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    bottomTab === 'submissions'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Submissions ({submissions.length})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded"
                  title="Reset code"
                >
                  <RotateCcw size={12} /> Reset
                </button>
                <button
                  onClick={handleRun}
                  disabled={running}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md transition-colors disabled:opacity-50"
                >
                  {running ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                  Run <span className="text-[10px] opacity-60">(Ctrl+Enter)</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  Submit <span className="text-[10px] opacity-60">(Ctrl+Shift+Enter)</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {bottomTab === 'testcases' && (
                <TestcasePanel
                  testCases={problem.testCases || []}
                  selectedTestCase={selectedTestCase}
                  onSelectTestCase={setSelectedTestCase}
                  runResult={runResult}
                />
              )}
              {bottomTab === 'result' && (
                <SubmissionResult result={submitResult || runResult} />
              )}
              {bottomTab === 'submissions' && (
                <SubmissionHistory submissions={submissions} />
              )}
            </div>
          </div>
        </div>

        {showSubmissions && (
          <SubmissionHistory
            submissions={submissions}
            onClose={() => setShowSubmissions(false)}
            isOverlay
          />
        )}
      </div>
    </div>
  )
}
