import type { LucideIcon } from 'lucide-react'

export interface StatCardData {
  id: string
  label: string
  value: number
  target: number
  suffix: string
  icon: LucideIcon
  gradient: string
  barColor: string
  trend: number
}

export interface RadarDatum {
  skill: string
  value: number
}

export interface LearningItem {
  id: string
  title: string
  progress: number
  nextLesson: string
  time: string
  color: string
}

export interface ReadinessItem {
  label: string
  score: number
  color: string
}

export interface CompanyEligibilityData {
  id: string
  name: string
  initials: string
  color: string
  match: number
  requiredCgpa: number
  eligible: boolean
  requiredSkills: string[]
  missingSkills: string[]
}

export interface Drive {
  id: string
  company: string
  initials: string
  color: string
  date: string
  role: string
  eligibility: string
  cgpa: number
}

export type ColumnId = 'applied' | 'assessment' | 'technical' | 'hr' | 'offer' | 'rejected'

export interface Application {
  id: string
  company: string
  role: string
  date: string
}

export interface CodingWeekDatum {
  day: string
  solved: number
}

export interface TrendDatum {
  month: string
  resume: number
  placement: number
  coding: number
  skills: number
  applications: number
  interviews: number
}

export interface BadgeData {
  id: string
  name: string
  description: string
  icon: LucideIcon
  unlocked: boolean
  color: string
}

export interface NotificationItem {
  id: string
  text: string
  time: string
  icon: LucideIcon
  color: string
}

export type EventType = 'interview' | 'drive' | 'contest' | 'certification' | 'mock'

export interface CalendarEvent {
  id: string
  title: string
  date: string
  type: EventType
}

export interface AlumniData {
  id: string
  name: string
  company: string
  role: string
  similarity: number
  initials: string
  color: string
}

export interface SkillGapFactor {
  factor: string
  impact: 'high' | 'medium' | 'low'
}

export interface PredictorItem {
  label: string
  value: number
  max: number
  color: string
}

export interface AssistantMessage {
  id: string
  role: 'user' | 'ai'
  text: string
}
