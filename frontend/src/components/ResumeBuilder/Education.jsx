import { useState } from 'react'

export default function Education({ data, onChange }) {
  const entries = data?.entries || []
  const [current, setCurrent] = useState({ degree: '', institute: '', year: '', gpa: '' })

  const add = () => {
    if (!current.degree || !current.institute) return
    onChange('education', { entries: [...entries, { ...current, id: Date.now() }] })
    setCurrent({ degree: '', institute: '', year: '', gpa: '' })
  }

  const remove = (id) => onChange('education', { entries: entries.filter(e => e.id !== id) })

  return (
    <div className="space-y-3">
      {entries.map((e) => (
        <div key={e.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-start">
          <div><p className="font-medium">{e.degree}</p><p className="text-sm text-gray-500">{e.institute} {e.year && `• ${e.year}`}{e.gpa && ` • GPA: ${e.gpa}`}</p></div>
          <button onClick={() => remove(e.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
        </div>
      ))}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input className="input-field text-sm" placeholder="Degree *" value={current.degree} onChange={e => setCurrent(p => ({ ...p, degree: e.target.value }))} />
        <input className="input-field text-sm" placeholder="Institute *" value={current.institute} onChange={e => setCurrent(p => ({ ...p, institute: e.target.value }))} />
        <input className="input-field text-sm" placeholder="Year of Graduation" value={current.year} onChange={e => setCurrent(p => ({ ...p, year: e.target.value }))} />
        <input className="input-field text-sm" placeholder="GPA (optional)" value={current.gpa} onChange={e => setCurrent(p => ({ ...p, gpa: e.target.value }))} />
      </div>
      <button onClick={add} className="btn-secondary text-sm w-full">Add Education</button>
    </div>
  )
}
