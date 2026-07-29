import { useState, useEffect } from 'react'
import api from '../services/api'
import { Map, Target, BookOpen, CheckCircle, ChevronRight, Calendar } from 'lucide-react'

export default function CareerRoadmap() {
  const [roadmap, setRoadmap] = useState(null)
  const [dailyGoals, setDailyGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/roadmap/generate'),
      api.get('/roadmap/daily-goals'),
    ]).then(([road, goals]) => {
      setRoadmap(road.data)
      setDailyGoals(goals.data?.dailyGoals || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">Career Roadmap</h1>
      <p className="text-gray-500">Personalized learning path to achieve your career goals</p>

      <div className="card">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Target size={18} className="text-primary-500" />
          Daily Goals
        </h2>
        <div className="space-y-2">
          {dailyGoals.map((goal, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle size={16} className="text-gray-300" />
              {goal}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Map size={18} className="text-primary-500" />
          Monthly Timeline
        </h2>
        {roadmap?.timeline?.map((month, i) => (
          <div key={i} className="card relative">
            <div className="flex items-start gap-4">
              <div className="bg-primary-50 text-primary-700 font-bold rounded-full w-10 h-10 flex items-center justify-center shrink-0">
                M{month.month}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{month.focus}</h3>
                <ul className="mt-2 space-y-1">
                  {month.goals?.map((goal, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <ChevronRight size={14} className="text-primary-400 mt-0.5 shrink-0" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-primary-500" />
            Recommended Certifications
          </h2>
          {roadmap?.certifications?.map((cert, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium">{cert.name}</p>
                <p className="text-xs text-gray-500">{cert.platform}</p>
              </div>
              <span className="badge bg-gray-100 text-gray-600 text-xs">{cert.platform}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-primary-500" />
            Suggested Projects
          </h2>
          {roadmap?.projects?.map((proj, i) => (
            <div key={i} className="py-2 border-b border-gray-100 last:border-0">
              <p className="text-sm font-medium">{proj.title}</p>
              <p className="text-xs text-gray-500 mt-1">{proj.description}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {proj.techStack?.map((t, j) => (
                  <span key={j} className="badge bg-gray-100 text-gray-600 text-xs">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
