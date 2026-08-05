import { useState, useEffect } from 'react'
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
import { FileText, Plus, Eye, Download, Sparkles, RotateCcw, Trash2, Check } from 'lucide-react'
import { Link } from 'react-router-dom'

const SECTION_META = {
  personalInfo: { label: 'Personal Info', icon: '👤', required: true },
  education: { label: 'Education', icon: '🎓', required: true },
  skills: { label: 'Skills', icon: '⚡', required: true },
  experience: { label: 'Experience', icon: '💼', required: true },
  projects: { label: 'Projects', icon: '🚀', required: true },
  certifications: { label: 'Certifications', icon: '📜', required: false },
  achievements: { label: 'Achievements', icon: '🏆', required: false },
  languages: { label: 'Languages', icon: '🌐', required: false },
}

const SECTION_ORDER = ['personalInfo', 'education', 'skills', 'experience', 'projects', 'certifications', 'achievements', 'languages']

export default function ResumeBuilder() {
  const [resumes, setResumes] = useState([])
  const [currentId, setCurrentId] = useState(null)
  const [sections, setSections] = useState([])
  const [activeSection, setActiveSection] = useState('personalInfo')
  const [showPreview, setShowPreview] = useState(false)
  const [atsScore, setAtsScore] = useState(null)
  const [saving, setSaving] = useState(false)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [showNameModal, setShowNameModal] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { loadResumes() }, [])

  const loadResumes = async () => {
    try {
      const { data } = await api.get('/resume-builder/user')
      setResumes(data || [])
    } catch { /* ignore */ }
  }

  const loadResume = async (id) => {
    try {
      const { data } = await api.get(`/resume-builder/${id}`)
      setCurrentId(id)
      setSections(data.sections || [])
      checkATS(data.sections || [])
    } catch { /* ignore */ }
  }

  const createResume = async () => {
    const defaultSections = [
      { name: 'personalInfo', data: {} },
      { name: 'education', data: { entries: [] } },
      { name: 'skills', data: { items: [] } },
      { name: 'experience', data: { entries: [] } },
      { name: 'projects', data: { entries: [] } },
    ]
    try {
      const { data } = await api.post('/resume-builder/create', { sections: defaultSections })
      setCurrentId(data.id)
      setSections(defaultSections)
      checkATS(defaultSections)
      setActiveSection('personalInfo')
      await loadResumes()
    } catch { /* ignore */ }
  }

  const updateSection = (name, sectionData) => {
    const updated = [...sections]
    const idx = updated.findIndex(s => s.name === name)
    if (idx >= 0) {
      updated[idx] = { name, data: sectionData }
    } else {
      updated.push({ name, data: sectionData })
    }
    setSections(updated)
    checkATS(updated)
  }

  const checkATS = async (secs) => {
    try {
      const { data } = await api.post('/resume-builder/ats-score', { sections: secs })
      setAtsScore(data)
    } catch { /* ignore */ }
  }

  const saveResume = async () => {
    if (!currentId) return
    setSaving(true)
    try {
      await api.put(`/resume-builder/${currentId}`, { sections })
    } catch { /* ignore */ }
    setSaving(false)
  }

  const deleteResume = async (id) => {
    try {
      await api.delete(`/resume-builder/${id}`)
      if (currentId === id) { setCurrentId(null); setSections([]); setAtsScore(null) }
      await loadResumes()
    } catch { /* ignore */ }
  }

  const exportPDF = async () => {
    if (!currentId) return
    try {
      const resp = await api.post(`/resume-builder/${currentId}/export`, {}, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([resp.data], { type: 'application/pdf' }))
      const a = document.createElement('a'); a.href = url; a.download = 'resume.pdf'; a.click()
    } catch { /* ignore */ }
  }

  const generateAISummary = async () => {
    setGeneratingSummary(true)
    try {
      const { data } = await api.post('/resume-builder/ai-summary', { sections })
      if (data.summary && !data.summary.includes('unavailable')) {
        const personal = sections.find(s => s.name === 'personalInfo')
        if (personal) {
          updateSection('personalInfo', { ...personal.data, summary: data.summary })
        }
      }
    } catch { /* ignore */ }
    setGeneratingSummary(false)
  }

  const getData = (name) => {
    const s = sections.find(sec => sec.name === name)
    return s?.data || {}
  }

  const getSectionProgress = () => {
    if (sections.length === 0) return { completed: 0, total: 5 }
    const required = ['personalInfo', 'education', 'skills', 'experience', 'projects']
    let completed = 0
    required.forEach(name => {
      const data = getData(name)
      if (name === 'personalInfo' && data.fullName && data.email) completed++
      else if (name === 'education' && data.entries?.length > 0) completed++
      else if (name === 'skills' && data.items?.length > 0) completed++
      else if (name === 'experience' && data.entries?.length > 0) completed++
      else if (name === 'projects' && data.entries?.length > 0) completed++
    })
    return { completed, total: 5 }
  }

  const activeSections = SECTION_ORDER.filter(name => {
    const meta = SECTION_META[name]
    if (!meta.required) {
      const data = getData(name)
      const hasContent = data.entries?.length > 0 || data.items?.length > 0
      if (!hasContent) return false
    }
    return meta.label.toLowerCase().includes(search.toLowerCase())
  })

  const progress = getSectionProgress()

  if (!currentId) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">ATS-Friendly Resume Builder</h1>
            <p className="text-gray-500">Build, optimize, and export ATS-compliant resumes</p>
          </div>
          <button onClick={createResume} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Resume
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {resumes.map((r) => {
            const data = {}
            ;(r.sections || []).forEach(s => { data[s.name] = s.data })
            const personal = data.personalInfo || {}
            return (
              <div key={r.id} className="card cursor-pointer hover:border-primary-400 transition-all group relative" onClick={() => loadResume(r.id)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FileText size={20} className="text-primary-600" />
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteResume(r.id) }} className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Delete resume">
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="font-semibold">{personal.fullName || 'Untitled Resume'}</h3>
                <p className="text-sm text-gray-500">{personal.targetRole || 'No target role set'}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(r.sections || []).map(s => (
                    <span key={s.name} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{SECTION_META[s.name]?.icon}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Updated {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : 'never'}</p>
              </div>
            )
          })}
        </div>

        {resumes.length === 0 && (
          <div className="text-center py-16">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-400 mb-2">No resumes yet</h2>
            <p className="text-gray-400 mb-4">Create your first ATS-optimized resume</p>
            <button onClick={createResume} className="btn-primary">Create Resume</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentId(null)} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
          <div>
            <h1 className="text-xl font-bold">{getData('personalInfo')?.fullName || 'Resume Builder'}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{progress.completed}/{progress.total} sections filled</span>
              {progress.completed === progress.total && <Check size={14} className="text-green-500" />}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={generateAISummary} disabled={generatingSummary} className="btn-secondary text-sm flex items-center gap-1">
            <Sparkles size={14} /> {generatingSummary ? 'Generating...' : 'AI Summary'}
          </button>
          <button onClick={() => setShowPreview(!showPreview)} className="btn-secondary text-sm flex items-center gap-1">
            <Eye size={14} /> {showPreview ? 'Editor' : 'Preview'}
          </button>
          <button onClick={exportPDF} className="btn-secondary text-sm flex items-center gap-1">
            <Download size={14} /> PDF
          </button>
          <button onClick={saveResume} disabled={saving} className="btn-primary text-sm flex items-center gap-1">
            {saving ? <RotateCcw size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {showPreview ? (
        <div className="max-w-3xl mx-auto">
          <ResumePreview sections={sections} />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-56 lg:shrink-0 space-y-1">
            <input className="input-field text-xs mb-2" placeholder="Search sections..." value={search} onChange={e => setSearch(e.target.value)} />
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-1 px-1 lg:mx-0 lg:px-0">
              {SECTION_ORDER.map(name => {
                const meta = SECTION_META[name]
                if (search && !meta.label.toLowerCase().includes(search.toLowerCase())) return null
                const data = getData(name)
                const hasContent = name === 'personalInfo' ? data.fullName || data.email
                  : data.entries?.length > 0 || data.items?.length > 0
                return (
                  <button key={name} onClick={() => setActiveSection(name)}
                    className={`whitespace-nowrap lg:whitespace-normal w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${activeSection === name ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}>
                    <span>{meta.icon}</span>
                    <span className="flex-1">{meta.label}</span>
                    {hasContent && <Check size={12} className="text-green-500 shrink-0" />}
                    {meta.required && <span className="text-xs text-red-300">*</span>}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="card">
              <h2 className="font-semibold mb-4">{SECTION_META[activeSection]?.label}</h2>
              {activeSection === 'personalInfo' && <PersonalInfo data={getData('personalInfo')} onChange={updateSection} />}
              {activeSection === 'education' && <Education data={getData('education')} onChange={updateSection} />}
              {activeSection === 'skills' && <Skills data={getData('skills')} onChange={updateSection} />}
              {activeSection === 'projects' && <Projects data={getData('projects')} onChange={updateSection} />}
              {activeSection === 'experience' && <Experience data={getData('experience')} onChange={updateSection} />}
              {activeSection === 'certifications' && <Certifications data={getData('certifications')} onChange={updateSection} />}
              {activeSection === 'achievements' && <Achievements data={getData('achievements')} onChange={updateSection} />}
              {activeSection === 'languages' && <Languages data={getData('languages')} onChange={updateSection} />}
            </div>
          </div>

          <div className="w-full lg:w-72 lg:shrink-0">
            <ATSScore score={atsScore} />
          </div>
        </div>
      )}
    </div>
  )
}
