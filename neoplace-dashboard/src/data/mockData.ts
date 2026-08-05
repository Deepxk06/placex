import {
  Target,
  FileText,
  Building2,
  Send,
  CalendarCheck,
  Flame,
  CheckCircle2,
  FolderKanban,
} from 'lucide-react'
import {
  Award,
  FileCheck2,
  Trophy,
  Medal,
  Zap,
  Code2,
  Download,
  TrendingUp,
  CalendarPlus,
  FileUp,
  UserPlus,
  GraduationCap,
} from 'lucide-react'
import type {
  StatCardData,
  RadarDatum,
  LearningItem,
  ReadinessItem,
  CompanyEligibilityData,
  Drive,
  Application,
  ColumnId,
  CodingWeekDatum,
  TrendDatum,
  BadgeData,
  NotificationItem,
  CalendarEvent,
  AlumniData,
  SkillGapFactor,
  PredictorItem,
} from '../types'

export const student = {
  name: 'Deepak',
  fullName: 'Deepak Kumar',
  college: 'B.Tech CSE — 4th Year',
  cgpa: 8.6,
  targetRole: 'Software Engineer',
  streakDays: 23,
}

export const motivationalQuotes = [
  '“Success is the sum of small efforts repeated day in and day out.”',
  '“Your future is created by what you do today, not tomorrow.”',
  '“Hard work beats talent when talent doesn’t work hard.”',
  '“The best way to predict the future is to create it.”',
]

export const todayGoal = 'Complete Docker fundamentals & apply to 3 companies'

export const quickStats: StatCardData[] = [
  { id: 'placement', label: 'Overall Placement Score', value: 84, target: 100, suffix: '', icon: Target, gradient: 'from-brand-500 to-violet-600', barColor: 'bg-brand-500', trend: 6 },
  { id: 'ats', label: 'Resume ATS Score', value: 78, target: 100, suffix: '', icon: FileText, gradient: 'from-sky-500 to-cyan-500', barColor: 'bg-sky-500', trend: 4 },
  { id: 'companies', label: 'Eligible Companies', value: 18, target: 25, suffix: '', icon: Building2, gradient: 'from-emerald-500 to-teal-500', barColor: 'bg-emerald-500', trend: 3 },
  { id: 'applications', label: 'Applications Submitted', value: 12, target: 20, suffix: '', icon: Send, gradient: 'from-amber-500 to-orange-500', barColor: 'bg-amber-500', trend: 2 },
  { id: 'interviews', label: 'Interview Invitations', value: 5, target: 10, suffix: '', icon: CalendarCheck, gradient: 'from-rose-500 to-pink-500', barColor: 'bg-rose-500', trend: 1 },
  { id: 'streak', label: 'Learning Streak', value: 23, target: 30, suffix: ' days', icon: Flame, gradient: 'from-orange-500 to-red-500', barColor: 'bg-orange-500', trend: 7 },
  { id: 'skills', label: 'Skills Completed', value: 14, target: 20, suffix: '', icon: CheckCircle2, gradient: 'from-violet-500 to-purple-600', barColor: 'bg-violet-500', trend: 2 },
  { id: 'projects', label: 'Projects Completed', value: 6, target: 8, suffix: '', icon: FolderKanban, gradient: 'from-cyan-500 to-blue-500', barColor: 'bg-cyan-500', trend: 1 },
]

export const radarData: RadarDatum[] = [
  { skill: 'Java', value: 78 },
  { skill: 'Python', value: 72 },
  { skill: 'React', value: 65 },
  { skill: 'SQL', value: 82 },
  { skill: 'Communication', value: 74 },
  { skill: 'Problem Solving', value: 68 },
  { skill: 'Cloud', value: 42 },
  { skill: 'AI/ML', value: 55 },
]

export const learningRoadmap: LearningItem[] = [
  { id: 'java', title: 'Java', progress: 78, nextLesson: 'Collections & Generics', time: '3h 20m', color: 'bg-orange-500' },
  { id: 'python', title: 'Python', progress: 85, nextLesson: 'File I/O & Exception Handling', time: '2h 10m', color: 'bg-yellow-500' },
  { id: 'react', title: 'React', progress: 62, nextLesson: 'Hooks Deep Dive — useMemo', time: '4h 05m', color: 'bg-cyan-500' },
  { id: 'springboot', title: 'Spring Boot', progress: 45, nextLesson: 'REST Controllers & DTOs', time: '5h 30m', color: 'bg-green-500' },
  { id: 'sql', title: 'SQL', progress: 90, nextLesson: 'Window Functions', time: '1h 45m', color: 'bg-sky-500' },
  { id: 'aws', title: 'AWS', progress: 38, nextLesson: 'EC2 & S3 Essentials', time: '6h 00m', color: 'bg-amber-500' },
  { id: 'docker', title: 'Docker', progress: 52, nextLesson: 'Docker Compose & Volumes', time: '2h 50m', color: 'bg-blue-600' },
  { id: 'communication', title: 'Communication', progress: 70, nextLesson: 'STAR Method Practice', time: '1h 30m', color: 'bg-purple-500' },
]

export const readinessItems: ReadinessItem[] = [
  { label: 'Overall', score: 84, color: 'text-brand-500' },
  { label: 'Resume', score: 78, color: 'text-sky-500' },
  { label: 'Coding', score: 68, color: 'text-emerald-500' },
  { label: 'Projects', score: 75, color: 'text-amber-500' },
  { label: 'Communication', score: 74, color: 'text-rose-500' },
  { label: 'Certifications', score: 52, color: 'text-violet-500' },
]

export const companiesEligibility: CompanyEligibilityData[] = [
  {
    id: 'tcs', name: 'TCS', initials: 'TC', color: 'bg-blue-600', match: 92,
    requiredCgpa: 6.5, eligible: true,
    requiredSkills: ['Java', 'SQL', 'Communication'],
    missingSkills: ['AWS'],
  },
  {
    id: 'infosys', name: 'Infosys', initials: 'IN', color: 'bg-indigo-600', match: 88,
    requiredCgpa: 6.0, eligible: true,
    requiredSkills: ['Python', 'SQL', 'Problem Solving'],
    missingSkills: ['Spring Boot'],
  },
  {
    id: 'wipro', name: 'Wipro', initials: 'WI', color: 'bg-rose-600', match: 85,
    requiredCgpa: 6.5, eligible: true,
    requiredSkills: ['Java', 'React', 'SQL'],
    missingSkills: ['Docker'],
  },
  {
    id: 'accenture', name: 'Accenture', initials: 'AC', color: 'bg-slate-700', match: 80,
    requiredCgpa: 7.0, eligible: true,
    requiredSkills: ['Java', 'Python', 'Cloud'],
    missingSkills: ['AWS', 'Kubernetes'],
  },
  {
    id: 'amazon', name: 'Amazon', initials: 'AM', color: 'bg-amber-600', match: 64,
    requiredCgpa: 7.5, eligible: false,
    requiredSkills: ['DSA', 'System Design', 'AWS'],
    missingSkills: ['System Design', 'DSA Advanced', 'AWS'],
  },
  {
    id: 'google', name: 'Google', initials: 'GO', color: 'bg-emerald-600', match: 58,
    requiredCgpa: 8.0, eligible: false,
    requiredSkills: ['DSA', 'System Design', 'Machine Learning'],
    missingSkills: ['DSA Advanced', 'System Design', 'ML'],
  },
]

export const placementDrives: Drive[] = [
  { id: 'd1', company: 'TCS', initials: 'TC', color: 'bg-blue-600', date: '2026-08-12', role: 'System Engineer Trainee', eligibility: 'CGPA ≥ 6.5 · No backlogs', cgpa: 6.5 },
  { id: 'd2', company: 'Infosys', initials: 'IN', color: 'bg-indigo-600', date: '2026-08-18', role: 'System Engineer', eligibility: 'CGPA ≥ 6.0 · 2026 Batch', cgpa: 6.0 },
  { id: 'd3', company: 'Wipro', initials: 'WI', color: 'bg-rose-600', date: '2026-08-25', role: 'Project Engineer', eligibility: 'CGPA ≥ 6.5 · Any branch', cgpa: 6.5 },
  { id: 'd4', company: 'Accenture', initials: 'AC', color: 'bg-slate-700', date: '2026-09-05', role: 'Associate Software Engineer', eligibility: 'CGPA ≥ 7.0 · No backlogs', cgpa: 7.0 },
  { id: 'd5', company: 'Capgemini', initials: 'CA', color: 'bg-teal-600', date: '2026-09-12', role: 'Analyst', eligibility: 'CGPA ≥ 6.5 · 2026 Batch', cgpa: 6.5 },
]

export const initialApplications: Record<ColumnId, Application[]> = {
  applied: [
    { id: 'a1', company: 'TCS', role: 'System Engineer Trainee', date: 'Aug 1' },
    { id: 'a2', company: 'Infosys', role: 'System Engineer', date: 'Jul 28' },
    { id: 'a3', company: 'Wipro', role: 'Project Engineer', date: 'Jul 25' },
  ],
  assessment: [
    { id: 'a4', company: 'Accenture', role: 'Associate Software Engineer', date: 'Jul 30' },
  ],
  technical: [
    { id: 'a5', company: 'Capgemini', role: 'Analyst', date: 'Jul 22' },
  ],
  hr: [
    { id: 'a6', company: 'Deloitte', role: 'Software Engineer', date: 'Jul 18' },
  ],
  offer: [
    { id: 'a7', company: 'Cognizant', role: 'Programmer Analyst', date: 'Jul 10' },
  ],
  rejected: [
    { id: 'a8', company: 'Zoho', role: 'Software Developer', date: 'Jul 5' },
  ],
}

export const codingWeekly: CodingWeekDatum[] = [
  { day: 'Mon', solved: 4 },
  { day: 'Tue', solved: 6 },
  { day: 'Wed', solved: 3 },
  { day: 'Thu', solved: 7 },
  { day: 'Fri', solved: 5 },
  { day: 'Sat', solved: 9 },
  { day: 'Sun', solved: 6 },
]

export const trends: TrendDatum[] = [
  { month: 'Jan', resume: 52, placement: 61, coding: 35, skills: 40, applications: 2, interviews: 1 },
  { month: 'Feb', resume: 58, placement: 66, coding: 42, skills: 48, applications: 4, interviews: 1 },
  { month: 'Mar', resume: 63, placement: 70, coding: 48, skills: 55, applications: 5, interviews: 2 },
  { month: 'Apr', resume: 66, placement: 73, coding: 52, skills: 60, applications: 7, interviews: 2 },
  { month: 'May', resume: 71, placement: 76, coding: 58, skills: 66, applications: 8, interviews: 3 },
  { month: 'Jun', resume: 74, placement: 79, coding: 62, skills: 70, applications: 10, interviews: 4 },
  { month: 'Jul', resume: 78, placement: 82, coding: 68, skills: 74, applications: 12, interviews: 5 },
]

export const badges: BadgeData[] = [
  { id: 'b1', name: 'Resume Master', description: 'Scored 90+ ATS on a resume', icon: FileCheck2, unlocked: true, color: 'from-sky-500 to-cyan-500' },
  { id: 'b2', name: 'Interview Ready', description: 'Completed 5 mock interviews', icon: Award, unlocked: true, color: 'from-emerald-500 to-teal-500' },
  { id: 'b3', name: 'Top Performer', description: 'Top 10% in coding contest', icon: Trophy, unlocked: true, color: 'from-amber-500 to-orange-500' },
  { id: 'b4', name: 'Skill Champion', description: 'Mastered 10 skills', icon: Medal, unlocked: true, color: 'from-violet-500 to-purple-500' },
  { id: 'b5', name: '30-Day Streak', description: 'Learn 30 days in a row', icon: Zap, unlocked: false, color: 'from-rose-500 to-pink-500' },
  { id: 'b6', name: 'Coding Ninja', description: 'Solved 200+ problems', icon: Code2, unlocked: false, color: 'from-blue-500 to-indigo-500' },
]

export const notifications: NotificationItem[] = [
  { id: 'n1', text: 'Your resume was updated and re-scored — ATS 78%', time: '10m ago', icon: Download, color: 'bg-sky-500' },
  { id: 'n2', text: 'Java roadmap milestone completed (80%)', time: '1h ago', icon: TrendingUp, color: 'bg-emerald-500' },
  { id: 'n3', text: 'Interview scheduled: Deloitte — Aug 15, 10:00 AM', time: '3h ago', icon: CalendarPlus, color: 'bg-violet-500' },
  { id: 'n4', text: 'TCS drive added to upcoming drives', time: '5h ago', icon: FileUp, color: 'bg-amber-500' },
  { id: 'n5', text: 'Application submitted to Infosys', time: 'Yesterday', icon: Send, color: 'bg-brand-500' },
]

export const calendarEvents: CalendarEvent[] = [
  { id: 'e1', title: 'Deloitte Technical Interview', date: '2026-08-15', type: 'interview' },
  { id: 'e2', title: 'TCS Placement Drive', date: '2026-08-12', type: 'drive' },
  { id: 'e3', title: 'Codeforces Round Weekly Contest', date: '2026-08-09', type: 'contest' },
  { id: 'e4', title: 'AWS Cloud Practitioner Exam', date: '2026-09-20', type: 'certification' },
  { id: 'e5', title: 'Mock Interview — HR Round', date: '2026-08-10', type: 'mock' },
  { id: 'e6', title: 'Infosys Placement Drive', date: '2026-08-18', type: 'drive' },
  { id: 'e7', title: 'SQL Window Functions Quiz', date: '2026-08-08', type: 'mock' },
]

export const alumni: AlumniData[] = [
  { id: 'al1', name: 'Priya Sharma', company: 'Google', role: 'Software Engineer II', similarity: 86, initials: 'PS', color: 'bg-emerald-500' },
  { id: 'al2', name: 'Rahul Verma', company: 'Microsoft', role: 'Software Engineer', similarity: 81, initials: 'RV', color: 'bg-sky-600' },
  { id: 'al3', name: 'Ananya Patel', company: 'Amazon', role: 'SDE-I', similarity: 77, initials: 'AP', color: 'bg-amber-600' },
  { id: 'al4', name: 'Siddharth Rao', company: 'TCS', role: 'System Engineer', similarity: 74, initials: 'SR', color: 'bg-indigo-600' },
]

export const skillGapFactors: SkillGapFactor[] = [
  { factor: 'CGPA (8.6)', impact: 'high' },
  { factor: 'Resume ATS Score', impact: 'high' },
  { factor: 'Coding Proficiency', impact: 'high' },
  { factor: 'Project Quality', impact: 'medium' },
  { factor: 'Communication', impact: 'medium' },
  { factor: 'Certifications', impact: 'low' },
]

export const predictorFactors: PredictorItem[] = [
  { label: 'CGPA', value: 8.6, max: 10, color: 'bg-emerald-500' },
  { label: 'Resume', value: 78, max: 100, color: 'bg-sky-500' },
  { label: 'Aptitude', value: 72, max: 100, color: 'bg-amber-500' },
  { label: 'Interview', value: 74, max: 100, color: 'bg-violet-500' },
]

export const strengths = ['Strong CGPA (8.6)', 'Good DSA foundation', '4 real-world projects', 'Active coding streak']

export const weaknesses = ['No cloud certifications yet', 'System design concepts weak', 'Limited React production experience']
