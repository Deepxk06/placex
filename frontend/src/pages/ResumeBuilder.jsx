import { useState, useEffect } from 'react'
import api from '../services/api'
import { ArrowLeft, ArrowRight, Save, Plus, Trash2, Eye } from 'lucide-react'

export default function ResumeBuilder() {
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [step, setStep] = useState('template') // template | edit | preview
  const [sections, setSections] = useState({})
  const [atsScore, setAtsScore] = useState(null)

  useEffect(() => {
    api.get('/resume-builder/templates').then(r => setTemplates(r.data)).catch(() => {})
  }, [])

  const selectTemplate = (t) => {
    setSelectedTemplate(t)
    const initial = {}
    t.sections.forEach(s => { initial[s.name] = s.name === 'skills' ? { items: [] } : { text: '' } })
    setSections(initial)
    setStep('edit')
  }

  const updateSection = (name, data) => {
    const updated = { ...sections, [name]: data }
    setSections(updated)
    const sectionsList = Object.entries(updated).map(([name, data]) => ({ name, data }))
    api.post('/resume-builder/ats-score', { sections: sectionsList }).then(r => setAtsScore(r.data)).catch(() => {})
  }

  const addSkill = (skill) => {
    const current = sections.skills?.items || []
    if (!current.includes(skill)) {
      updateSection('skills', { items: [...current, skill] })
    }
  }

  const removeSkill = (skill) => {
    const current = sections.skills?.items || []
    updateSection('skills', { items: current.filter(s => s !== skill) })
  }

  const renderSectionEditor = (section) => {
    switch (section.name) {
      case 'summary':
        return (
          <textarea className="input-field" rows={3} placeholder="2-3 line professional summary..."
            value={sections[section.name]?.text || ''}
            onChange={(e) => updateSection(section.name, { text: e.target.value })} />
        )
      case 'education':
        return <SectionForm fields={['degree', 'institute', 'year', 'gpa']} data={sections[section.name]?.entries || []}
          onChange={(entries) => updateSection(section.name, { entries })} />
      case 'experience':
        return <SectionForm fields={['company', 'role', 'duration', 'description']} data={sections[section.name]?.entries || []}
          onChange={(entries) => updateSection(section.name, { entries })} />
      case 'projects':
        return <SectionForm fields={['title', 'description', 'techStack', 'link']} data={sections[section.name]?.entries || []}
          onChange={(entries) => updateSection(section.name, { entries })} />
      case 'skills':
        return <SkillEditor skills={sections.skills?.items || []} onAdd={addSkill} onRemove={removeSkill} />
      case 'certifications':
        return <SectionForm fields={['name', 'issuer']} data={sections[section.name]?.entries || []}
          onChange={(entries) => updateSection(section.name, { entries })} />
      default:
        return <p className="text-gray-400">Editor for {section.name}</p>
    }
  }

  if (step === 'template') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Resume Builder</h1>
        <p className="text-gray-500">Choose a template to get started</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="card cursor-pointer hover:border-primary-400 transition-colors"
              onClick={() => selectTemplate(t)}>
              <h3 className="font-semibold">{t.name}</h3>
              <p className="text-sm text-gray-500">{t.targetRole}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {t.sections?.map((s, i) => (
                  <span key={i} className="badge bg-gray-100 text-gray-600">{s.name}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => setStep('template')} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2">
            <ArrowLeft size={16} /> Back to templates
          </button>
          <h1 className="text-2xl font-bold">{selectedTemplate?.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setStep('preview')} className="btn-secondary flex items-center gap-2">
            <Eye size={16} /> Preview
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {selectedTemplate?.sections?.map((section) => (
            <div key={section.name} className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold capitalize">{section.name}</h3>
                {!section.required && (
                  <button className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-2">{section.hint}</p>
              {renderSectionEditor(section)}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-3">ATS Live Score</h3>
            {atsScore ? (
              <>
                <div className={`text-3xl font-bold text-center ${atsScore.overall >= 80 ? 'text-green-600' : atsScore.overall >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {atsScore.overall}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className={`h-2 rounded-full ${atsScore.overall >= 80 ? 'bg-green-500' : atsScore.overall >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${atsScore.overall}%` }} />
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Keywords</span><span>{atsScore.keywordScore}%</span></div>
                  <div className="flex justify-between"><span>Format</span><span>{atsScore.formatScore}%</span></div>
                  <div className="flex justify-between"><span>Length</span><span>{atsScore.lengthScore}%</span></div>
                  <div className="flex justify-between"><span>Verbs</span><span>{atsScore.verbScore}%</span></div>
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-sm">Start editing to see your ATS score</p>
            )}
          </div>
          <div className="card">
            <h3 className="font-semibold mb-3">Suggestions</h3>
            {atsScore?.suggestions?.map((s, i) => (
              <div key={i} className="text-xs text-gray-500 mb-2">• {s}</div>
            )) || <p className="text-gray-400 text-sm">Suggestions will appear as you edit</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionForm({ fields, data, onChange }) {
  const addEntry = () => {
    const entry = {}
    fields.forEach(f => { entry[f] = '' })
    onChange([...data, entry])
  }
  const updateEntry = (index, key, value) => {
    const updated = [...data]
    updated[index] = { ...updated[index], [key]: value }
    onChange(updated)
  }
  const removeEntry = (index) => {
    onChange(data.filter((_, i) => i !== index))
  }
  return (
    <div className="space-y-3">
      {data.map((entry, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {fields.map((f) => (
              <input key={f} className="input-field text-sm" placeholder={f}
                value={entry[f] || ''} onChange={(e) => updateEntry(i, f, e.target.value)} />
            ))}
          </div>
          <button onClick={() => removeEntry(i)} className="text-red-500 text-xs hover:underline">Remove</button>
        </div>
      ))}
      <button onClick={addEntry} className="btn-secondary text-sm flex items-center gap-1">
        <Plus size={14} /> Add {fields[0] || 'Entry'}
      </button>
    </div>
  )
}

function SkillEditor({ skills, onAdd, onRemove }) {
  const [input, setInput] = useState('')
  const commonSkills = ['Python', 'Java', 'JavaScript', 'React', 'Node.js', 'SQL', 'MongoDB', 'Docker', 'AWS', 'Git']
  const add = () => {
    if (input.trim()) { onAdd(input.trim()); setInput('') }
  }
  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-2">
        {skills.map((s, i) => (
          <span key={i} className="badge bg-primary-100 text-primary-700 flex items-center gap-1">
            {s} <button onClick={() => onRemove(s)} className="hover:text-red-500">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="input-field flex-1" placeholder="Add a skill" value={input}
          onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <button onClick={add} className="btn-primary text-sm">Add</button>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {commonSkills.filter(s => !skills.includes(s)).slice(0, 8).map((s) => (
          <button key={s} onClick={() => onAdd(s)} className="badge bg-gray-100 text-gray-600 hover:bg-gray-200">{s}</button>
        ))}
      </div>
    </div>
  )
}
