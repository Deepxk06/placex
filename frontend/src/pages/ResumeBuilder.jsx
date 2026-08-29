import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import api from '../services/api'
import PersonalInfo from '../components/ResumeBuilder/PersonalInfo'
import Education from '../components/ResumeBuilder/Education'
import Skills from '../components/ResumeBuilder/Skills'
import Projects from '../components/ResumeBuilder/Projects'
import Experience from '../components/ResumeBuilder/Experience'
import Certifications from '../components/ResumeBuilder/Certifications'
import Achievements from '../components/ResumeBuilder/Achievements'
import Languages from '../components/ResumeBuilder/Languages'
import ResumePreview from '../components/ResumeBuilder/ResumePreview'
import ATSScore from '../components/ResumeBuilder/ATSScore'
import { useToast } from '../components/ui/ToastProvider'
import {
  FileText, Plus, Eye, Download, Sparkles, Trash2, Check,
  Printer, LayoutTemplate, Users, Target, ScanSearch, ArrowUp, ArrowDown,
  Copy, PencilLine, X, RefreshCw, Loader2, Briefcase, ChevronRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const SECTION_META = {
  personalInfo: { label: 'Personal Info', icon: 'personal', required: true },
  summary: { label: 'Summary', icon: 'summary', required: false },
  education: { label: 'Education', icon: 'education', required: true },
  skills: { label: 'Skills', icon: 'skills', required: true },
  experience: { label: 'Experience', icon: 'experience', required: true },
  internships: { label: 'Internships', icon: 'internships', required: false },
  projects: { label: 'Projects', icon: 'projects', required: true },
  certifications: { label: 'Certifications', icon: 'certifications', required: false },
  achievements: { label: 'Achievements', icon: 'achievements', required: false },
  languages: { label: 'Languages', icon: 'languages', required: false },
}

const SECTION_ICONS = { personal: '👤', summary: '📝', education: '🎓', skills: '⚡', experience: '💼', internships: '🧑‍💻', projects: '🚀', certifications: '📜', achievements: '🏆', languages: '🌐' }

const DEFAULT_ORDER = ['personalInfo', 'summary', 'education', 'skills', 'experience', 'internships', 'projects', 'certifications', 'achievements', 'languages']

const TEMPLATE_CARDS = [
  { id: 'classic', name: 'Classic', desc: 'Simple single-column, maximum ATS compatibility' },
  { id: 'modern', name: 'Modern Professional', desc: 'Clean visual hierarchy with blue accents' },
  { id: 'minimal', name: 'Minimal', desc: 'Very clean, compact and light' },
  { id: 'technical', name: 'Technical', desc: 'Optimized for engineering / AI / software roles' },
]

const SECTION_COMPONENTS = { personalInfo: PersonalInfo, education: Education, skills: Skills, experience: Experience, internships: null, projects: Projects, certifications: Certifications, achievements: Achievements, languages: Languages }

const SUMMARY_ACTIONS = [
  { id: 'improve', label: 'Improve' },
  { id: 'concise', label: 'Make concise' },
  { id: 'professional', label: 'Make professional' },
  { id: 'ats', label: 'Make ATS-friendly' },
  { id: 'target', label: 'Target my role' },
]

const IMPORTABLE_SECTIONS = [
  { name: 'personalInfo', label: 'Personal Information', desc: 'Name, email, phone, LinkedIn, location, target role' },
  { name: 'education', label: 'Education', desc: 'Degree, college, branch, CGPA, year from your profile' },
  { name: 'skills', label: 'Skills', desc: 'Merged from your PlaceX profile skills' },
  { name: 'projects', label: 'Projects', desc: 'Projects stored in your PlaceX profile' },
  { name: 'experience', label: 'Experience', desc: 'Current company & role from your profile' },
]

const TARGET_ROLES = ['Data Scientist', 'Data Analyst', 'ML Engineer', 'AI Engineer', 'Software Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Cloud Engineer', 'DevOps Engineer']
const SAVE_DEBOUNCE = 1200

const getSectionData = (sections, name) => sections.find((s) => s.name === name)?.data || {}
const setSectionData = (sections, name, data) => {
  const idx = sections.findIndex((s) => s.name === name)
  if (idx >= 0) {
    const next = [...sections]
    next[idx] = { name, data }
    return next
  }
  return [...sections, { name, data }]
}

export default function ResumeBuilder() {
  const { toast } = useToast()
  const [resumes, setResumes] = useState([])
  const [currentId, setCurrentId] = useState(null)
  const [meta, setMeta] = useState({ name: '', targetRole: '', experienceLevel: 'fresher', templateId: 'classic', version: 1 })
  const [sections, setSections] = useState([])
  const [sectionOrder, setSectionOrder] = useState(DEFAULT_ORDER)
  const [activeSection, setActiveSection] = useState('personalInfo')
  const [mobileView, setMobileView] = useState('editor')
  const [atsScore, setAtsScore] = useState(null)
  const [saveState, setSaveState] = useState('idle')
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [templateOpen, setTemplateOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState(null)
  const [createForm, setCreateForm] = useState({ name: '', targetRole: '', experienceLevel: 'fresher' })
  const [importSelected, setImportSelected] = useState(IMPORTABLE_SECTIONS.map((s) => s.name))
  const [importing, setImporting] = useState(false)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState(null)
  const [jdOpen, setJdOpen] = useState(false)
  const [jdText, setJdText] = useState('')
  const [jdLoading, setJdLoading] = useState(false)
  const [jdResult, setJdResult] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [printData, setPrintData] = useState(null)
  const [search, setSearch] = useState('')

  const savingTimer = useRef(null)
  const dirtyRef = useRef(false)

  const loadResumes = useCallback(async () => {
    try {
      const { data } = await api.get('/resume-builder/user')
      setResumes(data || [])
    } catch {
      toast({ type: 'error', message: 'Could not load your resumes' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { loadResumes() }, [loadResumes])

  const loadResume = useCallback(async (id) => {
    try {
      const { data } = await api.get(`/resume-builder/${id}`)
      setCurrentId(id)
      setMeta(m => ({ ...m, name: data.name, targetRole: data.targetRole, experienceLevel: data.experienceLevel, templateId: data.templateId || 'classic', version: data.version || 1 }))
      setSectionOrder([...new Set([...(data.sections || []).map((s) => s.name), ...DEFAULT_ORDER])])
      setSections(data.sections || [])
      setActiveSection((data.sections || [])[0]?.name || 'personalInfo')
      checkATS(data.sections || [])
      return data
    } catch {
      toast({ type: 'error', message: 'Could not open this resume' })
      return null
    }
  }, [toast])

  const checkATS = useCallback(async (secs) => {
    try {
      const { data } = await api.post('/resume-builder/ats-score', { sections: secs })
      setAtsScore(data)
    } catch { /* keep previous score */ }
  }, [])

  const saveNow = useCallback(async (payload = {}) => {
    if (!currentId) return
    setSaveState('saving')
    try {
      const body = {
        sections: payload.sections !== undefined ? payload.sections : sections,
        name: meta.name || 'Untitled Resume',
        targetRole: meta.targetRole,
        experienceLevel: meta.experienceLevel,
        templateId: meta.templateId,
      }
      const { data } = await api.put(`/resume-builder/${currentId}`, body)
      setMeta((m) => ({ ...m, version: data.version || m.version }))
      setSaveState('saved')
      dirtyRef.current = false
      if (payload.refreshList) loadResumes()
    } catch {
      setSaveState('error')
      toast({ type: 'error', message: 'Failed to save. Check your connection.' })
    }
  }, [currentId, sections, meta, loadResumes, toast])

  const scheduleSave = useCallback(() => {
    if (!currentId) return
    dirtyRef.current = true
    clearTimeout(savingTimer.current)
    savingTimer.current = setTimeout(() => saveNow(), SAVE_DEBOUNCE)
  }, [currentId, saveNow])

  useEffect(() => () => {
    clearTimeout(savingTimer.current)
    if (dirtyRef.current) saveNow()
  }, [saveNow])

  const updateSection = useCallback((name, data) => {
    setSections((prev) => {
      const next = setSectionData(prev, name, data)
      checkATS(next)
      scheduleSave()
      return next
    })
  }, [checkATS, scheduleSave])

  const createResume = async (form) => {
    try {
      const { data } = await api.post('/resume-builder/create', {
        name: form.name || 'Untitled Resume',
        targetRole: form.targetRole,
        experienceLevel: form.experienceLevel,
      })
      toast({ type: 'success', message: 'Resume created' })
      setCreateOpen(false)
      await loadResume(data.id)
      await loadResumes()
      setImportOpen(true)
    } catch (err) {
      console.error('Create resume failed:', err.response?.data || err.message)
      toast({ type: 'error', message: err.response?.data?.detail || 'Could not create resume' })
    }
  }

  const syncProfile = async (include) => {
    if (!currentId) return
    setImporting(true)
    try {
      const { data } = await api.post(`/resume-builder/${currentId}/sync-profile`, { include })
      if (data.resume) {
        setSections(data.resume.sections || [])
        setSectionOrder([...new Set([...(data.resume.sections || []).map((s) => s.name), ...DEFAULT_ORDER])])
        setMeta((m) => ({ ...m, version: data.resume.version || m.version }))
        checkATS(data.resume.sections || [])
      }
      toast({ type: 'success', message: data.imported.length ? `Imported: ${data.imported.join(', ')}` : 'Nothing new to import' })
      setImportOpen(false)
      dirtyRef.current = false
    } catch {
      toast({ type: 'error', message: 'Could not import profile data' })
    } finally {
      setImporting(false)
    }
  }

  const duplicateResume = async (id) => {
    try {
      const { data } = await api.post(`/resume-builder/${id}/duplicate`)
      toast({ type: 'success', message: 'Resume duplicated' })
      await loadResumes()
      await loadResume(data.id)
    } catch {
      toast({ type: 'error', message: 'Could not duplicate resume' })
    }
  }

  const renameResume = async () => {
    if (!renameTarget) return
    try {
      await api.put(`/resume-builder/${renameTarget.id}`, { name: renameTarget.name })
      toast({ type: 'success', message: 'Renamed' })
      setRenameTarget(null)
      await loadResumes()
      if (currentId === renameTarget.id) setMeta((m) => ({ ...m, name: renameTarget.name }))
    } catch {
      toast({ type: 'error', message: 'Could not rename resume' })
    }
  }

  const deleteResume = async (id) => {
    try {
      await api.delete(`/resume-builder/${id}`)
      if (currentId === id) { setCurrentId(null); setSections([]); setAtsScore(null); setAnalysis(null) }
      await loadResumes()
      toast({ type: 'success', message: 'Resume deleted' })
    } catch {
      toast({ type: 'error', message: 'Could not delete resume' })
    }
  }

  const moveSection = (name, dir) => {
    setSectionOrder((prev) => {
      const idx = prev.indexOf(name)
      const target = idx + dir
      if (idx < 0 || target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      scheduleSave()
      return next
    })
  }

  const applyTemplate = async (id) => {
    setMeta((m) => ({ ...m, templateId: id }))
    setTemplateOpen(false)
    scheduleSave()
    toast({ type: 'success', message: `Template applied: ${TEMPLATE_CARDS.find((t) => t.id === id)?.name}` })
  }

  const generateAISummary = async (action) => {
    const personal = getSectionData(sections, 'personalInfo')
    const text = personal.summary || ''
    if (!text) {
      toast({ type: 'error', message: 'Write a draft summary first, then improve it with AI' })
      return
    }
    setGeneratingSummary(true)
    try {
      const { data } = await api.post('/resume-builder/ai-summary', { action, text, targetRole: meta.targetRole || personal.targetRole || '', sections })
      setAiSuggestion({ type: 'summary', text: data.summary, original: text })
    } catch {
      toast({ type: 'error', message: 'AI service unavailable. Try again later.' })
    }
    setGeneratingSummary(false)
  }

  const applySuggestion = () => {
    if (!aiSuggestion) return
    if (aiSuggestion.type === 'summary') {
      const personal = getSectionData(sections, 'personalInfo')
      updateSection('personalInfo', { ...personal, summary: aiSuggestion.text })
      toast({ type: 'success', message: 'Summary updated' })
    }
    setAiSuggestion(null)
  }

  const runJDAnalysis = async () => {
    if (!jdText.trim() || !currentId) return
    setJdLoading(true)
    setJdResult(null)
    try {
      const { data } = await api.post(`/resume-builder/${currentId}/optimize-jd`, { jdText })
      setJdResult(data.jobMatch)
    } catch {
      toast({ type: 'error', message: 'Could not analyze the job description' })
    }
    setJdLoading(false)
  }

  const runAnalyze = async () => {
    if (!currentId) return
    setAnalyzing(true)
    try {
      const { data } = await api.post(`/resume-builder/${currentId}/analyze`)
      setAnalysis(data)
      toast({ type: 'success', message: `Resume score: ${data.resumeScore}/100 · ATS: ${data.atsScore}/100` })
    } catch {
      toast({ type: 'error', message: 'Could not analyze resume' })
    }
    setAnalyzing(false)
  }

  const exportResume = async (type) => {
    if (!currentId) return
    try {
      const { data } = await api.post(`/resume-builder/${currentId}/export${type === 'docx' ? '-docx' : ''}`, {}, { responseType: 'blob' })
      const mime = type === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf'
      const url = URL.createObjectURL(new Blob([data], { type: mime }))
      const a = document.createElement('a')
      a.href = url
      a.download = `${(meta.name || 'resume').replace(/\s+/g, '_')}.${type === 'docx' ? 'docx' : 'pdf'}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast({ type: 'error', message: `Could not export ${type.toUpperCase()}` })
    }
  }

  const handlePrint = () => {
    setPrintData({ sections, templateId: meta.templateId })
    setTimeout(() => { window.print(); setPrintData(null) }, 150)
  }

  const data = useMemo(() => {
    const map = {}
    ;(sections || []).forEach((s) => { map[s.name] = s.data })
    return map
  }, [sections])

  const progress = useMemo(() => {
    const required = ['personalInfo', 'education', 'skills', 'experience', 'projects']
    let completed = 0
    required.forEach((name) => {
      const d = data[name]
      if (name === 'personalInfo') { if (d?.fullName && d?.email) completed++ }
      else if (d?.entries?.length > 0 || d?.items?.length > 0) completed++
    })
    return { completed, total: required.length }
  }, [data])

  const filteredResumes = useMemo(() => {
    if (!search.trim()) return resumes
    const q = search.toLowerCase()
    return resumes.filter(r => (r.name || '').toLowerCase().includes(q) || (r.targetRole || '').toLowerCase().includes(q))
  }, [resumes, search])

  const ActiveComponent = SECTION_COMPONENTS[activeSection]

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-[500px] bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="h-[500px] bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="h-[500px] bg-gray-200 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!currentId) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText size={24} /> Resume Builder
          </h1>
          <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Resume
          </button>
        </div>

        {resumes.length === 0 ? (
          <div className="card text-center py-16">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-700">No resumes yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">Create your first resume to get started</p>
            <button onClick={() => setCreateOpen(true)} className="btn-primary inline-flex items-center gap-2">
              <Plus size={16} /> Create Resume
            </button>
          </div>
        ) : (
          <>
            <div className="relative max-w-sm">
              <input type="text" placeholder="Search resumes..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10" />
              <ScanSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResumes.map(r => (
                <div key={r.id} className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => loadResume(r.id)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{r.name || 'Untitled'}</h3>
                      {r.targetRole && <p className="text-sm text-gray-500 mt-1">{r.targetRole}</p>}
                    </div>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => duplicateResume(r.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400" title="Duplicate"><Copy size={14} /></button>
                      <button onClick={() => setRenameTarget({ id: r.id, name: r.name })} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400" title="Rename"><PencilLine size={14} /></button>
                      <button onClick={() => deleteResume(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">{r.experienceLevel || 'Fresher'} · v{r.version || 1}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setCreateOpen(false)}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">New Resume</h2>
              <input type="text" placeholder="Resume name" value={createForm.name} onChange={(e) => setCreateForm(f => ({ ...f, name: e.target.value }))} className="input-field" autoFocus />
              <select value={createForm.targetRole} onChange={(e) => setCreateForm(f => ({ ...f, targetRole: e.target.value }))} className="input-field">
                <option value="">Select target role (optional)</option>
                {TARGET_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <div className="flex gap-2">
                {['fresher', 'experienced'].map(l => (
                  <button key={l} onClick={() => setCreateForm(f => ({ ...f, experienceLevel: l }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border ${createForm.experienceLevel === l ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
                <button onClick={() => createResume(createForm)} className="btn-primary">Create</button>
              </div>
            </div>
          </div>
        )}

        {renameTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setRenameTarget(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Rename Resume</h2>
              <input type="text" value={renameTarget.name} onChange={(e) => setRenameTarget(t => ({ ...t, name: e.target.value }))} className="input-field" autoFocus onKeyDown={(e) => e.key === 'Enter' && renameResume()} />
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setRenameTarget(null)} className="btn-secondary">Cancel</button>
                <button onClick={renameResume} className="btn-primary">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => { setCurrentId(null); setSections([]); setAtsScore(null); setAnalysis(null) }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 shrink-0">
            <X size={20} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">{meta.name || 'Untitled Resume'}</h1>
          {saveState === 'saving' && <span className="text-xs text-gray-400 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Saving</span>}
          {saveState === 'saved' && <span className="text-xs text-green-500 flex items-center gap-1"><Check size={12} /> Saved</span>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setTemplateOpen(true)} className="btn-secondary text-sm flex items-center gap-1.5"><LayoutTemplate size={14} /> Template</button>
          <button onClick={() => setImportOpen(true)} className="btn-secondary text-sm flex items-center gap-1.5"><ArrowDown size={14} /> Import</button>
          <button onClick={handlePrint} className="btn-secondary text-sm flex items-center gap-1.5"><Printer size={14} /> Print</button>
          <div className="relative group">
            <button className="btn-primary text-sm flex items-center gap-1.5"><Download size={14} /> Export</button>
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              <button onClick={() => exportResume('pdf')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">PDF</button>
              <button onClick={() => exportResume('docx')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">DOCX</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-2 space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-1">Sections</p>
          {sectionOrder.filter(name => SECTION_META[name]).map((name, idx) => {
            const meta2 = SECTION_META[name]
            const isActive = activeSection === name
            return (
              <div key={name} className="flex items-center gap-1">
                <button onClick={() => setActiveSection(name)}
                  className={`flex-1 text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}>
                  <span>{SECTION_ICONS[meta2.icon]}</span>
                  <span className="truncate">{meta2.label}</span>
                  {meta2.required && <span className="text-red-400 text-xs">*</span>}
                </button>
                {idx > 0 && <button onClick={() => moveSection(name, -1)} className="p-1 text-gray-300 hover:text-gray-500"><ArrowUp size={12} /></button>}
                {idx < sectionOrder.length - 1 && <button onClick={() => moveSection(name, 1)} className="p-1 text-gray-300 hover:text-gray-500"><ArrowDown size={12} /></button>}
              </div>
            )
          })}

          {atsScore && (
            <div className="mt-4">
              <ATSScore score={atsScore} />
            </div>
          )}

          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <p className="text-xs font-medium text-gray-500 mb-1">Progress</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${(progress.completed / progress.total) * 100}%` }} />
              </div>
              <span className="text-xs font-medium text-gray-600">{progress.completed}/{progress.total}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {SECTION_ICONS[SECTION_META[activeSection]?.icon]} {SECTION_META[activeSection]?.label}
              </h2>
              {activeSection === 'personalInfo' && (
                <div className="relative group">
                  <button onClick={() => generateAISummary('improve')} disabled={generatingSummary}
                    className="btn-secondary text-xs flex items-center gap-1">
                    {generatingSummary ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} AI Summary
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                    {SUMMARY_ACTIONS.map(a => (
                      <button key={a.id} onClick={() => generateAISummary(a.id)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">{a.label}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {ActiveComponent && (
              <ActiveComponent data={data[activeSection] || {}} onChange={updateSection} />
            )}
          </div>

          {aiSuggestion && (
            <div className="mt-4 card border border-primary-200 dark:border-primary-800">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5"><Sparkles size={14} className="text-primary-500" /> AI Suggestion</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 whitespace-pre-wrap">{aiSuggestion.text}</p>
              <div className="flex gap-2">
                <button onClick={applySuggestion} className="btn-primary text-sm">Apply</button>
                <button onClick={() => setAiSuggestion(null)} className="btn-secondary text-sm">Dismiss</button>
              </div>
            </div>
          )}

          <div className="mt-4 card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5"><Target size={14} /> JD Match</h3>
              <button onClick={() => setJdOpen(!jdOpen)} className="text-xs text-primary-600 hover:underline">{jdOpen ? 'Close' : 'Open'}</button>
            </div>
            {jdOpen && (
              <div className="space-y-3">
                <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} rows={4} placeholder="Paste a job description here..."
                  className="input-field text-sm" />
                <button onClick={runJDAnalysis} disabled={jdLoading || !jdText.trim()} className="btn-primary text-sm w-full flex items-center justify-center gap-2">
                  {jdLoading ? <><Loader2 size={14} className="animate-spin" /> Analyzing...</> : <><ScanSearch size={14} /> Analyze JD</>}
                </button>
                {jdResult && (
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between"><span className="text-gray-500">Match Score</span><span className="font-bold">{jdResult.matchScore}%</span></div>
                    {jdResult.missingKeywords?.length > 0 && (
                      <div><p className="text-gray-500 mb-1">Missing keywords:</p>
                        <div className="flex flex-wrap gap-1">{jdResult.missingKeywords.map((k, i) => <span key={i} className="badge bg-red-50 text-red-600">{k}</span>)}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <button onClick={runAnalyze} disabled={analyzing} className="mt-4 btn-secondary w-full text-sm flex items-center justify-center gap-2">
            {analyzing ? <><Loader2 size={14} className="animate-spin" /> Analyzing...</> : <><Sparkles size={14} /> Full Resume Analysis</>}
          </button>
          {analysis && (
            <div className="mt-3 card text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Resume Score</span><span className="font-bold">{analysis.resumeScore}/100</span></div>
              <div className="flex justify-between"><span className="text-gray-500">ATS Score</span><span className="font-bold">{analysis.atsScore}/100</span></div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-20">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><Eye size={14} /> Preview</h2>
              <div className="flex gap-1">
                {TEMPLATE_CARDS.map(t => (
                  <button key={t.id} onClick={() => applyTemplate(t.id)}
                    className={`px-2 py-1 text-xs rounded-lg ${meta.templateId === t.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-400 hover:bg-gray-100'}`}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 overflow-auto max-h-[700px]">
              <ResumePreview sections={sections} templateId={meta.templateId} />
            </div>
          </div>
        </div>
      </div>

      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setImportOpen(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Users size={18} /> Import from Profile</h2>
            <p className="text-sm text-gray-500">Select sections to import from your PlaceX profile.</p>
            <div className="space-y-2">
              {IMPORTABLE_SECTIONS.map(s => (
                <label key={s.name} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input type="checkbox" checked={importSelected.includes(s.name)} onChange={(e) => {
                    setImportSelected(prev => e.target.checked ? [...prev, s.name] : prev.filter(n => n !== s.name))
                  }} className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.label}</p>
                    <p className="text-xs text-gray-400">{s.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setImportOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={() => syncProfile(importSelected)} disabled={importing} className="btn-primary flex items-center gap-2">
                {importing ? <><Loader2 size={14} className="animate-spin" /> Importing...</> : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {templateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setTemplateOpen(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><LayoutTemplate size={18} /> Choose Template</h2>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATE_CARDS.map(t => (
                <button key={t.id} onClick={() => applyTemplate(t.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${meta.templateId === t.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setTemplateOpen(false)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setRenameTarget(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Rename Resume</h2>
            <input type="text" value={renameTarget.name} onChange={(e) => setRenameTarget(t => ({ ...t, name: e.target.value }))} className="input-field" autoFocus onKeyDown={(e) => e.key === 'Enter' && renameResume()} />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setRenameTarget(null)} className="btn-secondary">Cancel</button>
              <button onClick={renameResume} className="btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}