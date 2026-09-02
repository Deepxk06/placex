import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Code2, Brain, BookOpen, Target } from 'lucide-react'
import CodingAssessment from './CodingAssessment'
import AptitudeAssessment from './AptitudeAssessment'
import TechnicalMCQAssessment from './TechnicalMCQAssessment'
import SkillGapAssessment from './SkillGapAssessment'

const TABS = ['coding', 'aptitude', 'mcq', 'skill-gap']

export default function SkillAssessment() {
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(() => {
    const t = searchParams.get('tab')
    return TABS.includes(t) ? t : 'coding'
  })

  const isCoding = tab === 'coding'

  return (
    <div className={isCoding ? 'space-y-6' : 'space-y-6 max-w-5xl'}>
      <h1 className="text-2xl font-bold">Skill Assessment</h1>
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {[
          { id: 'coding', label: 'Coding', icon: Code2 },
          { id: 'aptitude', label: 'Aptitude', icon: Brain },
          { id: 'mcq', label: 'Technical MCQ', icon: BookOpen },
          { id: 'skill-gap', label: 'Skill Gap', icon: Target },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'
            }`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'coding' && <CodingAssessment />}
      {tab === 'aptitude' && <AptitudeAssessment />}
      {tab === 'mcq' && <TechnicalMCQAssessment />}
      {tab === 'skill-gap' && <SkillGapAssessment />}
    </div>
  )
}
