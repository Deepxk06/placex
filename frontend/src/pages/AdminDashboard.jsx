import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../store/authStore'
import { Shield, Users, FileText, Brain, TrendingUp, BarChart3, RefreshCw } from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [placementStats, setPlacementStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/analytics'),
      api.get('/admin/placement-stats'),
    ]).then(([a, p]) => {
      setAnalytics(a.data)
      setPlacementStats(p.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const triggerScrape = async () => {
    try {
      await api.post('/admin/jobs/trigger-scrape')
      alert('Job scraping started!')
    } catch {}
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
  if (user?.profile?.role !== 'admin') return <div className="card text-center text-red-500 py-10">Admin access required</div>

  const statsCards = [
    { label: 'Total Students', value: analytics?.totalStudents || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Avg CGPA', value: analytics?.averageCgpa || 0, icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Avg Placement %', value: analytics?.averagePlacementProbability || 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Resumes', value: analytics?.totalResumes || 0, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button onClick={triggerScrape} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={16} /> Scrape Jobs Now
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((item) => (
          <div key={item.label} className="card flex items-center gap-4">
            <div className={`${item.bg} p-3 rounded-lg`}>
              <item.icon className={item.color} size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-500">{item.label}</div>
              <div className="text-xl font-bold">{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Placement Distribution</h2>
          {placementStats && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-600">High Chance (&gt;70%)</span>
                  <span className="font-bold">{placementStats.highChance || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{
                    width: `${((placementStats.highChance || 0) / Math.max(placementStats.totalPredictions || 1, 1)) * 100}%`
                  }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-yellow-600">Medium Chance (40-70%)</span>
                  <span className="font-bold">{placementStats.mediumChance || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{
                    width: `${((placementStats.mediumChance || 0) / Math.max(placementStats.totalPredictions || 1, 1)) * 100}%`
                  }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-red-600">Low Chance (&lt;40%)</span>
                  <span className="font-bold">{placementStats.lowChance || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{
                    width: `${((placementStats.lowChance || 0) / Math.max(placementStats.totalPredictions || 1, 1)) * 100}%`
                  }} />
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Average Salary</span>
                  <span className="font-bold">₹{Math.round((placementStats.averageSalary || 0) / 100000)}L</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Branch-wise Stats</h2>
          <div className="space-y-3">
            {analytics?.branchWiseStats?.map((b, i) => (
              <div key={i} className="flex flex-wrap items-center justify-between gap-3 text-sm py-1 border-b border-gray-100">
                <span className="font-medium">{b.branch}</span>
                <span className="text-gray-500">{b.count} students</span>
              </div>
            ))}
            {(!analytics?.branchWiseStats || analytics.branchWiseStats.length === 0) && (
              <p className="text-gray-400 text-sm">No branch data available</p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div><div className="text-2xl font-bold text-primary-600">{analytics?.totalAssessments || 0}</div><div className="text-xs text-gray-500">Assessments</div></div>
          <div><div className="text-2xl font-bold text-green-600">{analytics?.totalInterviews || 0}</div><div className="text-xs text-gray-500">Interviews</div></div>
          <div><div className="text-2xl font-bold text-purple-600">{placementStats?.totalPredictions || 0}</div><div className="text-xs text-gray-500">Predictions</div></div>
          <div><div className="text-2xl font-bold text-orange-600">{placementStats?.highChance || 0}</div><div className="text-xs text-gray-500">High Chance</div></div>
        </div>
      </div>
    </div>
  )
}
