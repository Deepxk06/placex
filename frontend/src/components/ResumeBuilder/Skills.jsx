import { useState } from 'react'

export default function Skills({ data, onChange }) {
  const items = data?.items || []
  const [input, setInput] = useState('')

  const add = () => {
    const skill = input.trim()
    if (!skill || items.includes(skill)) return
    onChange('skills', { items: [...items, skill] })
    setInput('')
  }

  const remove = (skill) => onChange('skills', { items: items.filter(s => s !== skill) })

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); add() }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {items.map((s) => (
          <span key={s} className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
            {s}
            <button onClick={() => remove(s)} className="hover:text-red-600">&times;</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="input-field text-sm flex-1" placeholder="Type a skill and press Enter" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} />
        <button onClick={add} className="btn-secondary text-sm">Add</button>
      </div>
      <div className="flex flex-wrap gap-1">
        {['Python','JavaScript','React','Node.js','SQL','Java','C++','AWS','Docker','TypeScript','Go','Rust','Next.js','Tailwind','MongoDB'].map(s => (
          !items.includes(s) && <button key={s} onClick={() => { onChange('skills', { items: [...items, s] }) }} className="text-xs text-gray-400 hover:text-primary-500 border border-dashed border-gray-300 px-2 py-0.5 rounded">{s}</button>
        ))}
      </div>
    </div>
  )
}
