import { useState } from 'react'
import api from '../../services/api'

export default function Experience({ data, onChange }) {
  const entries = data?.entries || []
  const [current, setCurrent] = useState({ company: '', role: '', duration: '', description: '' })
  const [improving, setImproving] = useState(null)

  const add = () => {
    if (!current.company || !current.role) return
    onChange('experience', { entries: [...entries, { ...current, id: Date.now() }] })
    setCurrent({ company: '', role: '', duration: '', description: '' })
  }

  const remove = (id) => onChange('experience', { entries: entries.filter(e => e.id !== id) })

  const improveDesc = async (entry) => {
    setImproving(entry.id)
    try {
      const { data: res } = await api.post('/api/resume-builder/improve-experience', { description: entry.description })
      const improved = res.improved.replace(/^\d+[\.\)]\s*/gm, '').split('\n').filter(Boolean).join(' ')
      const updated = entries.map(e => e.id === entry.id ? { ...e, description: improved || e.description } : e)
      onChange('experience', { entries: updated })
    } catch (err) { console.error(err) }
    setImproving(null)
  }

  return (
    <div className="space-y-3">
      {entries.map((e) => (
        <div key={e.id} className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-start mb-1">
            <div><p className="font-medium">{e.role}</p><p className="text-sm text-gray-500">{e.company} • {e.duration}</p></div>
            <button onClick={() => remove(e.id)} className="text-red-500 text-sm hover:text-red-700">Remove</button>
          </div>
          <p className="text-xs text-gray-600">{e.description}</p>
          <button onClick={() => improveDesc(e)} disabled={improving === e.id} className="text-xs text-primary-500 hover:underline mt-1">
            {improving === e.id ? 'Improving...' : '✨ Improve with AI'}
          </button>
        </div>
      ))}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input className="input-field text-sm" placeholder="Company *" value={current.company} onChange={e => setCurrent(p => ({ ...p, company: e.target.value }))} />
        <input className="input-field text-sm" placeholder="Role *" value={current.role} onChange={e => setCurrent(p => ({ ...p, role: e.target.value }))} />
        <input className="input-field text-sm" placeholder="Duration (e.g. Jan 2024 - Present)" value={current.duration} onChange={e => setCurrent(p => ({ ...p, duration: e.target.value }))} />
      </div>
      <textarea className="input-field text-sm" rows={2} placeholder="Describe your responsibilities and achievements..." value={current.description} onChange={e => setCurrent(p => ({ ...p, description: e.target.value }))} />
      <button onClick={add} className="btn-secondary text-sm w-full">Add Experience</button>
    </div>
  )
}
