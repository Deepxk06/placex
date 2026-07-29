import { useState } from 'react'

export default function Languages({ data, onChange }) {
  const items = data?.items || []
  const levels = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic']
  const [current, setCurrent] = useState({ language: '', level: 'Fluent' })

  const add = () => {
    if (!current.language) return
    onChange('languages', { items: [...items, { ...current, id: Date.now() }] })
    setCurrent({ language: '', level: 'Fluent' })
  }

  const remove = (id) => onChange('languages', { items: items.filter(l => l.id !== id) })

  return (
    <div className="space-y-3">
      {items.map((l) => (
        <div key={l.id} className="bg-gray-50 p-2 rounded-lg flex justify-between items-center">
          <span className="text-sm">{l.language} <span className="text-gray-400">({l.level})</span></span>
          <button onClick={() => remove(l.id)} className="text-red-500 text-sm hover:text-red-700">×</button>
        </div>
      ))}
      <div className="flex gap-2">
        <input className="input-field text-sm flex-1" placeholder="Language" value={current.language} onChange={e => setCurrent(p => ({ ...p, language: e.target.value }))} />
        <select className="input-field text-sm w-32" value={current.level} onChange={e => setCurrent(p => ({ ...p, level: e.target.value }))}>
          {levels.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <button onClick={add} className="btn-secondary text-sm">Add</button>
      </div>
    </div>
  )
}
