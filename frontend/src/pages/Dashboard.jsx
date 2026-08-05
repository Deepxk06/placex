import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../store/authStore'
import { FileText, Code2, Brain, Mic, TrendingUp, Award } from 'lucide-react'
import { getScoreColor } from '../utils/helpers'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/student').then((res) => {
      setData(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>

  const scores = [
    { label: 'Resume Score', value: data?.resumeScore || 0, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Coding Progress', value: data?.codingProgress?.avgScore || 0, icon: Code2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Aptitude Progress', value: data?.aptitudeProgress?.avgScore || 0, icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Interview Score', value: data?.interviewScore || 0, icon: Mic, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.profile?.name || user?.email?.split('@')[0]}!</h1>
          <p className="text-gray-500">Your placement journey at a glance</p>
        </div>
        <div className="flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-lg">
          <Award className="text-primary-600" size={20} />
          <div>
            <div className="text-sm text-gray-500">Readiness Score</div>
            <div className={`text-xl font-bold ${getScoreColor(data?.placementReadiness || 0)}`}>
              {data?.placementReadiness || 0}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scores.map((item) => (
          <div key={item.label} className="card flex items-center gap-4">
            <div className={`${item.bg} p-3 rounded-lg`}>
              <item.icon className={item.color} size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-500">{item.label}</div>
              <div className={`text-xl font-bold ${getScoreColor(item.value)}`}>
                {Math.round(item.value)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {data?.recentActivity?.slice(0, 5).map((activity, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'resume' ? 'bg-blue-500' :
                  activity.type === 'aptitude' ? 'bg-purple-500' :
                  activity.type === 'interview' ? 'bg-orange-500' : 'bg-green-500'
                }`} />
                <span className="text-gray-700">{activity.message}</span>
                <span className="text-gray-400 ml-auto text-xs">
                  {activity.time ? new Date(activity.time).toLocaleDateString() : ''}
                </span>
              </div>
            ))}
            {(!data?.recentActivity || data.recentActivity.length === 0) && (
              <p className="text-gray-400 text-sm">No activity yet. Start by uploading your resume!</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Coding Progress</h2>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Problems Attempted</span>
              <span className="font-medium">{data?.codingProgress?.attempted || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Average Score</span>
              <span className={`font-medium ${getScoreColor(data?.codingProgress?.avgScore || 0)}`}>
                {Math.round(data?.codingProgress?.avgScore || 0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all" style={{
                width: `${Math.min(data?.codingProgress?.avgScore || 0, 100)}%`
              }} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Aptitude Tests</span>
              <span className="font-medium">{data?.aptitudeProgress?.attempted || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Average Score</span>
              <span className={`font-medium ${getScoreColor(data?.aptitudeProgress?.avgScore || 0)}`}>
                {Math.round(data?.aptitudeProgress?.avgScore || 0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full transition-all" style={{
                width: `${Math.min(data?.aptitudeProgress?.avgScore || 0, 100)}%`
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
