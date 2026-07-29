import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ResumePage from './pages/ResumePage'
import ResumeBuilder from './pages/ResumeBuilder'
import SkillAssessment from './pages/SkillAssessment'
import MockInterview from './pages/MockInterview'
import PlacementPrediction from './pages/PlacementPrediction'
import JobRecommendations from './pages/JobRecommendations'
import CareerRoadmap from './pages/CareerRoadmap'
import CareerCounsellor from './pages/CareerCounsellor'
import CompanyInsights from './pages/CompanyInsights'
import AlumniNetwork from './pages/AlumniNetwork'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/layout/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        <Route path="/skill-assessment" element={<SkillAssessment />} />
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
  )
}
