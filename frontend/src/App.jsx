import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'

const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ResumePage = lazy(() => import('./pages/ResumePage'))
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'))
const SkillAssessment = lazy(() => import('./pages/SkillAssessment'))
const MockInterview = lazy(() => import('./pages/MockInterview'))
const PlacementPrediction = lazy(() => import('./pages/PlacementPrediction'))
const JobRecommendations = lazy(() => import('./pages/JobRecommendations'))
const CareerRoadmap = lazy(() => import('./pages/CareerRoadmap'))
const CareerCounsellor = lazy(() => import('./pages/CareerCounsellor'))
const CompanyInsights = lazy(() => import('./pages/CompanyInsights'))
const AlumniNetwork = lazy(() => import('./pages/AlumniNetwork'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const CodePlayground = lazy(() => import('./pages/CodePlayground'))

const TITLES = {
  '/login': 'Sign In - PlaceX',
  '/register': 'Register - PlaceX',
  '/dashboard': 'Dashboard - PlaceX',
  '/profile': 'Profile - PlaceX',
  '/settings': 'Settings - PlaceX',
  '/resume': 'Resume Analysis - PlaceX',
  '/resume-builder': 'Resume Builder - PlaceX',
  '/skill-assessment': 'Skill Assessment - PlaceX',
  '/code-playground': 'Code Playground - PlaceX',
  '/mock-interview': 'Mock Interview - PlaceX',
  '/placement-prediction': 'Placement Prediction - PlaceX',
  '/jobs': 'Job Recommendations - PlaceX',
  '/career-roadmap': 'Career Roadmap - PlaceX',
  '/career-counsellor': 'AI Career Counsellor - PlaceX',
  '/company-insights': 'Company Insights - PlaceX',
  '/alumni': 'Alumni Network - PlaceX',
  '/admin': 'Admin Dashboard - PlaceX',
}

function PageTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.title = TITLES[pathname] || 'PlaceX - AI Placement Platform'
  }, [pathname])
  return null
}

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <>
      <PageTitle />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
            <Route path="/skill-assessment" element={<SkillAssessment />} />
            <Route path="/code-playground" element={<CodePlayground />} />
            <Route path="/mock-interview" element={<MockInterview />} />
            <Route path="/placement-prediction" element={<PlacementPrediction />} />
            <Route path="/jobs" element={<JobRecommendations />} />
            <Route path="/career-roadmap" element={<CareerRoadmap />} />
            <Route path="/career-counsellor" element={<CareerCounsellor />} />
            <Route path="/company-insights" element={<CompanyInsights />} />
            <Route path="/alumni" element={<AlumniNetwork />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
