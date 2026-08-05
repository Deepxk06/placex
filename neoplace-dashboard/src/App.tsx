import { useState } from 'react'
import Layout from './components/layout/Layout'
import WelcomeHeader from './components/dashboard/WelcomeHeader'
import StatsGrid from './components/dashboard/StatsGrid'
import AiInsightCard from './components/dashboard/AiInsightCard'
import ReadinessMeter from './components/dashboard/ReadinessMeter'
import ResumeAnalysis from './components/dashboard/ResumeAnalysis'
import JdMatch from './components/dashboard/JdMatch'
import LearningRoadmap from './components/dashboard/LearningRoadmap'
import SkillRadar from './components/dashboard/SkillRadar'
import PlacementPredictor from './components/dashboard/PlacementPredictor'
import CompanyEligibility from './components/dashboard/CompanyEligibility'
import PlacementDrives from './components/dashboard/PlacementDrives'
import ApplicationTracker from './components/dashboard/ApplicationTracker'
import CodingAnalytics from './components/dashboard/CodingAnalytics'
import MonthlyProgress from './components/dashboard/MonthlyProgress'
import Achievements from './components/dashboard/Achievements'
import NotificationsPanel from './components/dashboard/NotificationsPanel'
import CalendarWidget from './components/dashboard/CalendarWidget'
import AlumniRecommendations from './components/dashboard/AlumniRecommendations'
import QuickActions from './components/dashboard/QuickActions'
import FloatingAssistant from './components/dashboard/FloatingAssistant'

export default function App() {
  const [assistantOpen, setAssistantOpen] = useState(false)

  return (
    <Layout assistantOpen={assistantOpen} onToggleAssistant={setAssistantOpen}>
      <div className="space-y-8">
        <WelcomeHeader />
        <StatsGrid />
        <AiInsightCard />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <ResumeAnalysis />
            <JdMatch />
            <SkillRadar />
            <PlacementPredictor />
            <CompanyEligibility />
            <CodingAnalytics />
            <MonthlyProgress />
          </div>
          <div className="space-y-8">
            <ReadinessMeter />
            <LearningRoadmap />
            <Achievements />
            <NotificationsPanel />
            <CalendarWidget />
            <AlumniRecommendations />
          </div>
        </div>
        <PlacementDrives />
        <ApplicationTracker />
        <QuickActions />
      </div>
      <FloatingAssistant open={assistantOpen} onToggle={setAssistantOpen} />
    </Layout>
  )
}
