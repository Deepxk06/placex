import { useState } from 'react'

export default function Achievements({ data, onChange }) {
  const items = data?.items || []
  const [input, setInput] = useState('')

  const add = () => {
    const text = input.trim()
    if (!text) return
    onChange('achievements', { items: [...items, { id: Date.now(), text }] })
    setInput('')
  }

  const remove = (id) => onChange('achievements', { items: items.filter(a => a.id !== id) })

  return (
    <div className="space-y-3">
      {items.map((a) => (
        <div key={a.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-start">
          <p className="text-sm">{a.text}</p>
          <button onClick={() => remove(a.id)} className="text-red-500 text-sm hover:text-red-700 ml-2">×</button>
        </div>
      ))}
      <div className="flex gap-2">
        <input className="input-field text-sm flex-1" placeholder="e.g. Ranked top 5% in coding competition" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() }}} />
        <button onClick={add} className="btn-secondary text-sm">Add</button>
      </div>
    </div>
  )
}
