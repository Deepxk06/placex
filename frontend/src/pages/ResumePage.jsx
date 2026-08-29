import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText, LayoutDashboard } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../components/ui/ToastProvider'
import { Button } from '../components/ui/Button'
import { SkeletonCard } from '../components/ui/Skeleton'
import ResumeUpload, { PROCESSING_STEPS } from '../components/resume/ResumeUpload'
import ScoreCards from '../components/resume/ScoreCards'
import SkillsPanel from '../components/resume/SkillsPanel'
import ATSPanel from '../components/resume/ATSPanel'
import ProjectsPanel from '../components/resume/ProjectsPanel'
import JobMatchPanel from '../components/resume/JobMatchPanel'
import RecommendationsPanel from '../components/resume/RecommendationsPanel'
import HistoryPanel from '../components/resume/HistoryPanel'
import { cn } from '../utils/helpers'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'skills', label: 'Skills' },
  { id: 'ats', label: 'ATS' },
  { id: 'projects', label: 'Projects & Experience' },
  { id: 'jobmatch', label: 'Job Match' },
  { id: 'recommendations', label: 'Recommendations' },
  { id: 'history', label: 'History' },
]

export default function ResumePage() {
  const { toast } = useToast()
  const [tab, setTab] = useState('overview')
  const [resumes, setResumes] = useState([])
  const [active, setActive] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [step, setStep] = useState(0)
  const timerRef = useRef(null)

  const analysis = active?.analysis || null
  const parsedData = active?.parsedData || {}

  const loadResumes = useCallback(async () => {
    try {
      const res = await api.get('/resume/')
      setResumes(res.data || [])
    } catch {
      setResumes([])
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  useEffect(() => {
    loadResumes()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [loadResumes])

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const handleFileSelected = async (file) => {
    setProcessing(true)
    setStep(0)
    timerRef.current = setInterval(() => {
      setStep((s) => Math.min(s + 1, PROCESSING_STEPS.length - 1))
    }, 700)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      })
      const data = res.data
      stopTimer()
      setStep(PROCESSING_STEPS.length)
      setTimeout(() => setProcessing(false), 500)
      setActive(data)
      setTab('overview')
      setResumes((prev) => [{ id: data.id, ...pickHistoryFields(data) }, ...prev.filter((r) => r.id !== data.id)])
      toast({ type: 'success', message: 'Resume analyzed successfully' })
    } catch (err) {
      stopTimer()
      setProcessing(false)
      const detail = err.response?.data?.detail
      toast({ type: 'error', message: detail || 'Failed to analyze resume. Please try again.' })
    }
  }

  const pickHistoryFields = (data) => ({
    id: data.id,
    originalFile: data.originalFile,
    createdAt: data.createdAt,
    resumeScore: data.resumeScore,
    atsScore: data.atsScore,
    jdMatchScore: data.jdMatchScore,
  })

  const openResume = async (id) => {
    try {
      const res = await api.get(`/resume/${id}`)
      setActive(res.data)
      setTab('overview')
    } catch {
      toast({ type: 'error', message: 'Could not open this analysis' })
    }
  }

  const deleteResume = async (id) => {
    try {
      await api.delete(`/resume/${id}`)
      setResumes((prev) => prev.filter((r) => r.id !== id))
      if (active?.id === id) setActive(null)
      toast({ type: 'success', message: 'Resume deleted' })
    } catch {
      toast({ type: 'error', message: 'Could not delete this resume' })
    }
  }

  const handleMatchResult = (jobMatch) => {
    setActive((prev) => (prev ? { ...prev, analysis: { ...(prev.analysis || {}), jobMatch } } : prev))
    toast({ type: 'success', message: `Job match: ${Math.round(jobMatch.score)}%` })
  }

  const reanalyze = async () => {
    if (!active) return
    setProcessing(true)
    setStep(0)
    timerRef.current = setInterval(() => {
      setStep((s) => Math.min(s + 1, PROCESSING_STEPS.length - 1))
    }, 700)
    try {
      const res = await api.post(`/resume/${active.id}/analyze`, {}, { timeout: 120000 })
      stopTimer()
      setStep(PROCESSING_STEPS.length)
      setTimeout(() => setProcessing(false), 500)
      setActive((prev) => ({ ...prev, analysis: res.data, resumeScore: res.data.resumeScore, atsScore: res.data.atsScore }))
      setResumes((prev) =>
        prev.map((r) => (r.id === active.id ? { ...r, resumeScore: res.data.resumeScore, atsScore: res.data.atsScore } : r))
      )
      toast({ type: 'success', message: 'Analysis refreshed' })
    } catch {
      stopTimer()
      setProcessing(false)
      toast({ type: 'error', message: 'Re-analysis failed' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Resume Analysis</h1>
          <p className="text-gray-500">Upload your resume to analyze skills, ATS compatibility and job readiness</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={reanalyze} disabled={!active || processing}>
            Re-analyze
          </Button>
          <Link to="/resume-builder">
            <Button size="sm">
              Build Resume <ArrowRight size={15} />
            </Button>
          </Link>
        </div>
      </div>

      <ResumeUpload processing={processing} step={step} onFileSelected={handleFileSelected} />

      {/* Result tabs */}
      {active && (
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors',
                tab === t.id
                  ? 'bg-gradient-to-r from-primary-600 to-sky-500 text-white shadow-glass'
                  : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              )}
              aria-label={`${t.label} tab`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {active && tab === 'overview' && (
        <div className="space-y-6">
          <ScoreCards analysis={analysis} />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <ATSPanel analysis={analysis} />
            </div>
          </div>
          <RecommendationsPanel analysis={analysis} />
        </div>
      )}

      {active && tab === 'skills' && (
        <SkillsPanel analysis={analysis} parsedData={parsedData} jobMatch={analysis?.jobMatch} />
      )}

      {active && tab === 'ats' && <ATSPanel analysis={analysis} />}

      {active && tab === 'projects' && <ProjectsPanel analysis={analysis} parsedData={parsedData} />}

      {active && tab === 'jobmatch' && (
        <JobMatchPanel resumeId={active.id} analysis={analysis} onMatchResult={handleMatchResult} />
      )}

      {active && tab === 'recommendations' && <RecommendationsPanel analysis={analysis} />}

      {active && tab === 'history' && (
        <HistoryPanel
          resumes={resumes}
          activeId={active.id}
          onSelect={openResume}
          onDelete={deleteResume}
        />
      )}

      {!active && !processing && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl border border-gray-200 p-5 dark:border-gray-700">
            <FileText size={18} className="mt-0.5 shrink-0 text-primary-500" />
            <div>
              <p className="font-semibold">What you get</p>
              <p className="mt-1 text-sm text-gray-500">
                Resume quality score, estimated ATS compatibility with warnings, skill levels and categories,
                project &amp; experience analysis, and prioritized improvement recommendations.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-gray-200 p-5 dark:border-gray-700">
            <LayoutDashboard size={18} className="mt-0.5 shrink-0 text-sky-500" />
            <div>
              <p className="font-semibold">Job matching (optional)</p>
              <p className="mt-1 text-sm text-gray-500">
                Paste a job description to get a weighted job match score, matched and missing skills, and
                semantic similarity.
              </p>
            </div>
          </div>
        </div>
      )}

      {loadingHistory && !active ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        resumes.length > 0 && (
          <HistoryPanel resumes={resumes} activeId={active?.id} onSelect={openResume} onDelete={deleteResume} />
        )
      )}
    </div>
  )
}