import { useState } from 'react'

export default function Certifications({ data, onChange }) {
  const entries = data?.entries || []
  const [current, setCurrent] = useState({ name: '', issuer: '', date: '', link: '' })

  const add = () => {
    if (!current.name) return
    onChange('certifications', { entries: [...entries, { ...current, id: Date.now() }] })
    setCurrent({ name: '', issuer: '', date: '', link: '' })
  }

  const remove = (id) => onChange('certifications', { entries: entries.filter(e => e.id !== id) })

  return (
    <div className="space-y-3">
      {entries.map((e) => (
        <div key={e.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-start">
          <div><p className="font-medium text-sm">{e.name}</p><p className="text-xs text-gray-500">{e.issuer} {e.date && `• ${e.date}`}</p></div>
          <button onClick={() => remove(e.id)} className="text-red-500 text-sm hover:text-red-700">Remove</button>
        </div>
      ))}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input className="input-field text-sm" placeholder="Certification Name *" value={current.name} onChange={e => setCurrent(p => ({ ...p, name: e.target.value }))} />
        <input className="input-field text-sm" placeholder="Issuer" value={current.issuer} onChange={e => setCurrent(p => ({ ...p, issuer: e.target.value }))} />
        <input className="input-field text-sm" placeholder="Date" value={current.date} onChange={e => setCurrent(p => ({ ...p, date: e.target.value }))} />
        <input className="input-field text-sm" placeholder="Credential URL" value={current.link} onChange={e => setCurrent(p => ({ ...p, link: e.target.value }))} />
      </div>
      <button onClick={add} className="btn-secondary text-sm w-full">Add Certification</button>
    </div>
  )
}
