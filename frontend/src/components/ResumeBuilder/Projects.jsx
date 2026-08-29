import { useState } from 'react'
import api from '../../services/api'

export default function Projects({ data, onChange }) {
  const entries = data?.entries || []
  const [current, setCurrent] = useState({ title: '', description: '', techStack: [], techInput: '', link: '' })
  const [improving, setImproving] = useState(null)

  const add = () => {
    if (!current.title) return
    onChange('projects', { entries: [...entries, { ...current, id: Date.now(), techStack: current.techStack || [] }] })
    setCurrent({ title: '', description: '', techStack: [], techInput: '', link: '' })
  }

  const remove = (id) => onChange('projects', { entries: entries.filter(e => e.id !== id) })

  const addTech = () => {
    const tech = current.techInput.trim()
    if (!tech) return
    setCurrent(p => ({ ...p, techStack: [...(p.techStack || []), tech], techInput: '' }))
  }

  const improveDesc = async (entry) => {
    setImproving(entry.id)
    try {
      const { data: res } = await api.post('/resume-builder/improve-project', { description: entry.description })
      const improved = res.improved.replace(/^\d+[\.\)]\s*/gm, '').split('\n').filter(Boolean).join(' ')
      const updated = entries.map(e => e.id === entry.id ? { ...e, description: improved || e.description } : e)
      onChange('projects', { entries: updated })
    } catch (err) { console.error(err) }
    setImproving(null)
  }

  return (
    <div className="space-y-3">
      {entries.map((e) => (
        <div key={e.id} className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-start mb-1">
            <p className="font-medium">{e.title}</p>
            <button onClick={() => remove(e.id)} className="text-red-500 text-sm hover:text-red-700">Remove</button>
          </div>
          <p className="text-xs text-gray-500 mb-1">{e.description}</p>
          {e.techStack?.length > 0 && <p className="text-xs text-primary-600">{e.techStack.join(', ')}</p>}
          {e.link && <a href={e.link} target="_blank" className="text-xs text-blue-500 hover:underline">{e.link}</a>}
        </div>
      ))}
      <div className="space-y-2">
        <input className="input-field text-sm" placeholder="Project Title *" aria-label="Project title" value={current.title} onChange={e => setCurrent(p => ({ ...p, title: e.target.value }))} />
        <textarea className="input-field text-sm" rows={2} aria-label="Project description" placeholder="Brief description of your project" value={current.description} onChange={e => setCurrent(p => ({ ...p, description: e.target.value }))} />
        <div className="flex gap-2">
          <input className="input-field text-sm flex-1" placeholder="Tech used (e.g. React, Node.js)" aria-label="Technologies used" value={current.techInput} onChange={e => setCurrent(p => ({ ...p, techInput: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech() }}} />
          <button onClick={addTech} className="btn-secondary text-xs">Add Tech</button>
        </div>
        {current.techStack?.length > 0 && (
          <div className="flex flex-wrap gap-1">{current.techStack.map(t => <span key={t} className="bg-gray-100 text-xs px-2 py-0.5 rounded-full">{t}</span>)}</div>
        )}
        <input className="input-field text-sm" placeholder="Project link (optional)" aria-label="Project link" value={current.link} onChange={e => setCurrent(p => ({ ...p, link: e.target.value }))} />
      </div>
      <div className="flex gap-2">
        <button onClick={add} className="btn-secondary text-sm flex-1">Add Project</button>
      </div>
      {entries.length > 0 && (
        <div className="text-center">
          <button onClick={() => entries.forEach(e => improveDesc(e))} disabled={improving} className="text-xs text-primary-500 hover:underline">
            {improving ? 'Improving...' : '✨ AI Improve All Descriptions'}
          </button>
        </div>
      )}
    </div>
  )
}
