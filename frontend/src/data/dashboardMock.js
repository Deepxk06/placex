import {
  FileText,
  Code2,
  ClipboardList,
  Mic,
  Send,
  Award,
  FileUp,
  Briefcase,
  UserCog,
  CalendarPlus,
  TrendingUp,
  CalendarCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react'

export const student = {
  name: 'Deepak',
  college: 'B.Tech CSE — 4th Year',
  targetRole: 'Software Engineer',
}

export const dashboardMock = {
  readinessScore: 82,

  statCards: [
    { id: 's1', label: 'Resume Score', value: 78, suffix: '%', icon: FileText, gradient: 'from-sky-500 to-cyan-500', trend: 4 },
    { id: 's2', label: 'Coding Progress', value: 68, suffix: '%', icon: Code2, gradient: 'from-emerald-500 to-teal-500', trend: 7 },
    { id: 's3', label: 'Aptitude Progress', value: 72, suffix: '%', icon: ClipboardList, gradient: 'from-amber-500 to-orange-500', trend: 5 },
    { id: 's4', label: 'Interview Readiness', value: 74, suffix: '%', icon: Mic, gradient: 'from-violet-500 to-purple-500', trend: 3 },
    { id: 's5', label: 'Applications', value: 12, suffix: '', icon: Send, gradient: 'from-primary-600 to-sky-500', trend: 2 },
    { id: 's6', label: 'Offers Received', value: 2, suffix: '', icon: Award, gradient: 'from-rose-500 to-pink-500', trend: 1 },
  ],

  quickActions: [
    { id: 'qa1', label: 'Upload Resume', desc: 'PDF · DOCX', icon: FileUp, gradient: 'from-sky-500 to-cyan-500' },
    { id: 'qa2', label: 'Apply for Jobs', desc: '12 matches', icon: Briefcase, gradient: 'from-primary-600 to-sky-500' },
    { id: 'qa3', label: 'Practice Coding', desc: '142 solved', icon: Code2, gradient: 'from-emerald-500 to-teal-500' },
    { id: 'qa4', label: 'Start Aptitude Test', desc: '30 min test', icon: ClipboardList, gradient: 'from-amber-500 to-orange-500' },
    { id: 'qa5', label: 'Take Mock Interview', desc: 'AI interviewer', icon: Mic, gradient: 'from-rose-500 to-pink-500' },
    { id: 'qa6', label: 'Edit Profile', desc: 'Keep it updated', icon: UserCog, gradient: 'from-violet-500 to-purple-500' },
  ],

  drives: [
    { id: 'd1', company: 'TCS', initials: 'TC', color: 'bg-blue-600', date: '2026-08-12', role: 'System Engineer Trainee', eligibility: 'CGPA ≥ 6.5 · No backlogs', package: '₹3.6 LPA', deadline: '2026-08-10' },
    { id: 'd2', company: 'Infosys', initials: 'IN', color: 'bg-indigo-600', date: '2026-08-18', role: 'System Engineer', eligibility: 'CGPA ≥ 6.0 · 2026 Batch', package: '₹3.6 LPA', deadline: '2026-08-15' },
    { id: 'd3', company: 'Wipro', initials: 'WI', color: 'bg-rose-600', date: '2026-08-25', role: 'Project Engineer', eligibility: 'CGPA ≥ 6.5 · Any branch', package: '₹3.5 LPA', deadline: '2026-08-22' },
    { id: 'd4', company: 'Accenture', initials: 'AC', color: 'bg-slate-700', date: '2026-09-05', role: 'Associate Software Engineer', eligibility: 'CGPA ≥ 7.0 · No backlogs', package: '₹4.5 LPA', deadline: '2026-09-02' },
    { id: 'd5', company: 'Capgemini', initials: 'CA', color: 'bg-teal-600', date: '2026-09-12', role: 'Analyst', eligibility: 'CGPA ≥ 6.5 · 2026 Batch', package: '₹4.0 LPA', deadline: '2026-09-09' },
  ],

  roleRecommendations: [
    { id: 'r1', role: 'Data Scientist', match: 92, demand: 'High demand' },
    { id: 'r2', role: 'Machine Learning Engineer', match: 88, demand: 'High demand' },
    { id: 'r3', role: 'Data Analyst', match: 85, demand: 'Medium demand' },
    { id: 'r4', role: 'Python Developer', match: 80, demand: 'High demand' },
  ],

  dailyGoals: [
    { id: 'g1', label: 'Solve 2 Coding Problems', done: true },
    { id: 'g2', label: 'Complete 1 Aptitude Test', done: true },
    { id: 'g3', label: 'Update Resume', done: false },
    { id: 'g4', label: 'Practice Interview', done: false },
  ],

  skillProgress: [
    { id: 'sp1', name: 'Python', value: 85, color: 'bg-sky-500' },
    { id: 'sp2', name: 'Java', value: 78, color: 'bg-orange-500' },
    { id: 'sp3', name: 'SQL', value: 90, color: 'bg-emerald-500' },
    { id: 'sp4', name: 'Data Structures', value: 68, color: 'bg-primary-500' },
    { id: 'sp5', name: 'Machine Learning', value: 55, color: 'bg-violet-500' },
    { id: 'sp6', name: 'Communication', value: 74, color: 'bg-rose-500' },
  ],

  recentActivity: [
    { id: 'ra1', title: 'Resume Uploaded', description: 'resume-deepak.pdf added to your profile', time: '10m ago', icon: FileUp, color: 'bg-sky-500' },
    { id: 'ra2', title: 'Coding Test Completed', description: 'Solved 5 problems in the weekly contest', time: '2h ago', icon: Code2, color: 'bg-emerald-500' },
    { id: 'ra3', title: 'Applied for Zoho', description: 'Software Developer — application submitted', time: '5h ago', icon: Send, color: 'bg-primary-500' },
    { id: 'ra4', title: 'Profile Updated', description: 'Skills and education details refreshed', time: 'Yesterday', icon: UserCheck, color: 'bg-amber-500' },
    { id: 'ra5', title: 'Certificate Added', description: 'AWS Cloud Practitioner — 2026', time: '2 days ago', icon: Award, color: 'bg-violet-500' },
  ],

  notifications: [
    { id: 'n1', text: 'TCS drive opens tomorrow — apply before the deadline', time: '10m ago', icon: CalendarPlus, color: 'bg-blue-600' },
    { id: 'n2', text: 'Resume score increased to 78% — great improvement', time: '1h ago', icon: TrendingUp, color: 'bg-sky-500' },
    { id: 'n3', text: 'Interview scheduled: Deloitte — Aug 15, 10:00 AM', time: '3h ago', icon: CalendarCheck, color: 'bg-violet-500' },
    { id: 'n4', text: 'New AI feedback is available on your resume', time: '5h ago', icon: Sparkles, color: 'bg-primary-500' },
    { id: 'n5', text: 'Application submitted to Infosys', time: 'Yesterday', icon: Send, color: 'bg-emerald-500' },
  ],

  monthlyAnalytics: [
    { month: 'Feb', applications: 2, coding: 35, resume: 52, interview: 55 },
    { month: 'Mar', applications: 4, coding: 42, resume: 58, interview: 60 },
    { month: 'Apr', applications: 5, coding: 48, resume: 63, interview: 62 },
    { month: 'May', applications: 7, coding: 52, resume: 66, interview: 66 },
    { month: 'Jun', applications: 8, coding: 58, resume: 71, interview: 70 },
    { month: 'Jul', applications: 10, coding: 62, resume: 74, interview: 72 },
    { month: 'Aug', applications: 12, coding: 68, resume: 78, interview: 74 },
  ],

  interviewPerformance: [
    { attempt: 'R1', score: 62 },
    { attempt: 'R2', score: 68 },
    { attempt: 'R3', score: 71 },
    { attempt: 'R4', score: 74 },
  ],

  timelineSteps: [
    { id: 't1', label: 'Resume Uploaded', date: 'Jul 10', status: 'completed', icon: FileUp },
    { id: 't2', label: 'Applied', date: 'Jul 18', status: 'completed', icon: Send },
    { id: 't3', label: 'Shortlisted', date: 'Jul 28', status: 'current', icon: UserCheck },
    { id: 't4', label: 'Interview', date: 'Aug 15', status: 'upcoming', icon: Mic },
    { id: 't5', label: 'Offer', date: 'TBD', status: 'upcoming', icon: Award },
  ],

  atsKeywords: ['React Hooks', 'REST APIs', 'CI/CD', 'Agile', 'SQL Joins'],

  resumeSuggestions: [
    'Reordered sections — achievements now appear first',
    'Rewrote the summary with 3 quantified highlights',
    'Added project outcomes with measurable metrics',
  ],

  resumeImprovementTips: [
    'Add measurable impact to project descriptions',
    'Include your GitHub and LinkedIn profile links',
    'Move certifications above the projects section',
    'Quantify achievements with numbers and %',
  ],

  interviewQuestion: {
    question: 'Explain the difference between a process and a thread.',
    topic: 'Operating Systems',
  },

  careerRecommendation: {
    role: 'Data Scientist',
    summary: 'Your ML projects and strong statistics background make Data Scientist roles your best match — focus on model deployment and SQL this month.',
  },
}
