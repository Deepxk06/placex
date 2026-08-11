import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../store/authStore'
import { dashboardMock } from '../data/dashboardMock'
import { Code2, ClipboardList, FileUp, Mic } from 'lucide-react'
import WelcomeHeader from '../components/dashboard/WelcomeHeader'
import StatsGrid from '../components/dashboard/StatsGrid'
import PlacementDrives from '../components/dashboard/PlacementDrives'
import AIRoleRecommendations from '../components/dashboard/AIRoleRecommendations'
import DailyGoals from '../components/dashboard/DailyGoals'
import SkillProgress from '../components/dashboard/SkillProgress'
import RecentActivity from '../components/dashboard/RecentActivity'
import NotificationsPanel from '../components/dashboard/NotificationsPanel'
import PlacementAnalytics from '../components/dashboard/PlacementAnalytics'
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton'

const activityMeta = {
  resume: { icon: FileUp, color: 'bg-sky-500' },
  coding: { icon: Code2, color: 'bg-emerald-500' },
  application: { icon: FileUp, color: 'bg-primary-500' },
  aptitude: { icon: ClipboardList, color: 'bg-amber-500' },
  interview: { icon: Mic, color: 'bg-violet-500' },
}

function mergeStatsFromApi(apiData) {
  const patches = {
    s1: apiData?.resumeScore,
    s2: apiData?.codingProgress?.avgScore,
    s3: apiData?.aptitudeProgress?.avgScore,
    s4: apiData?.interviewScore,
  }
  return dashboardMock.statCards.map((card) => {
    if (patches[card.id] != null) return { ...card, value: Math.round(patches[card.id]) }
    return { ...card }
  })
}

function mapRecentActivity(apiActivity) {
  if (!Array.isArray(apiActivity) || apiActivity.length === 0) return dashboardMock.recentActivity
  return apiActivity.slice(0, 5).map((a, i) => {
    const meta = activityMeta[a.type] || { icon: Code2, color: 'bg-emerald-500' }
    return {
      id: `act-${i}`,
      title: a.message || 'Activity',
      description: '',
      time: a.time ? new Date(a.time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Just now',
      icon: meta.icon,
      color: meta.color,
    }
  })
}

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(dashboardMock)

  useEffect(() => {
    api
      .get('/dashboard/student')
      .then((res) => {
        const d = res?.data || {}
        setData({
          readinessScore: d.placementReadiness ?? dashboardMock.readinessScore,
          statCards: mergeStatsFromApi(d),
          recentActivity: mapRecentActivity(d.recentActivity),
        })
      })
      .catch(() => {
        setData(dashboardMock)
      })
      .finally(() => setLoading(false))
  }, [])

  const name =
    user?.profile?.name || user?.name || user?.email?.split('@')[0] || dashboardMock.student.name

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-6">
      <WelcomeHeader name={name} readiness={data.readinessScore} statCards={data.statCards} />
      <StatsGrid statCards={data.statCards} />

      <PlacementDrives />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIRoleRecommendations />
        <DailyGoals />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkillProgress />
        <RecentActivity items={data.recentActivity} />
      </div>

      <PlacementAnalytics />
      <NotificationsPanel />
    </div>
  )
}