import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2, Circle, ArrowRight, User, Phone, GraduationCap, FileText,
  Code2, FolderGit2, BadgeCheck, Link2, Target, Sparkles,
} from 'lucide-react'
import SectionCard from './SectionCard'
import { Progress } from '../ui/Progress'
import { useProfileStore } from '../../store/profileStore'
import { cn } from '../../utils/helpers'

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function ProfileCompletion() {
  const { profile, hasResume, ext } = useProfileStore()
  const [open, setOpen] = useState(true)
  if (!profile || !ext) return null

  const basic = Boolean(profile.personal?.date_of_birth || profile.personal?.gender || profile.personal?.bio)
  const contact = Boolean(profile.contact?.phone || profile.contact?.personal_email)
  const education = Boolean(profile.college?.college_name && profile.college?.degree && profile.college?.cgpa)
  const resume = hasResume
  const skills = ext.skills.length > 0
  const projects = ext.projects.length > 0
  const certificates = ext.certifications.length > 0
  const social = Object.values(ext.socialLinks).some(Boolean)
  const career = Boolean(ext.careerPrefs.role)

  const items = [
    { label: 'Basic Information', done: basic, icon: User, anchor: 'sec-basic' },
    { label: 'Contact Details', done: contact, icon: Phone, anchor: 'sec-contact' },
    { label: 'Education', done: education, icon: GraduationCap, anchor: 'sec-college' },
    { label: 'Resume', done: resume, icon: FileText, anchor: 'sec-profile' },
    { label: 'Skills', done: skills, icon: Code2, anchor: 'sec-skills' },
    { label: 'Projects', done: projects, icon: FolderGit2, anchor: 'sec-projects' },
    { label: 'Certificates', done: certificates, icon: BadgeCheck, anchor: 'sec-certifications' },
    { label: 'Social Links', done: social, icon: Link2, anchor: 'sec-social' },
    { label: 'Career Preferences', done: career, icon: Target, anchor: 'sec-career' },
  ]

  const doneCount = items.filter((i) => i.done).length
  const pct = Math.round((doneCount / items.length) * 100)

  return (
    <SectionCard
      id="sec-completion"
      icon={Sparkles}
      title="Profile Completion"
      subtitle={`${doneCount} of ${items.length} sections completed — ${pct}% overall`}
      action={
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-xl px-3 py-1.5 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-500/10"
        >
          {open ? 'Hide checklist' : 'Show checklist'}
        </button>
      }
    >
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
            <circle cx="32" cy="32" r="27" fill="none" strokeWidth="7" className="stroke-gray-200 dark:stroke-gray-800" />
            <motion.circle
              cx="32" cy="32" r="27" fill="none" strokeWidth="7" strokeLinecap="round"
              className={cn(pct >= 80 ? 'stroke-emerald-500' : 'stroke-primary-600')}
              strokeDasharray={2 * Math.PI * 27}
              initial={{ strokeDashoffset: 2 * Math.PI * 27 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 27 * (1 - pct / 100) }}
              transition={{ duration: 1 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-primary-700 dark:text-primary-300">{pct}%</div>
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300">ATS Profile Score</span>
            <span className="font-bold text-primary-600">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
          <p className="mt-1.5 text-xs text-gray-400">
            {pct >= 80 ? 'Outstanding! Your profile is placement-ready.' : pct >= 50 ? 'Good progress — complete the missing sections below.' : "Let's build a placement-ready profile step by step."}
          </p>
        </div>
      </div>

      {open && (
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-2.5 rounded-xl border border-gray-200/80 px-3 py-2.5 dark:border-gray-800"
            >
              {item.done ? (
                <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
              ) : (
                <Circle size={18} className="shrink-0 text-gray-300 dark:text-gray-600" />
              )}
              <span className={cn('flex-1 text-sm', item.done ? 'text-gray-600 dark:text-gray-300' : 'text-gray-700 dark:text-gray-200')}>{item.label}</span>
              {!item.done && (
                <button
                  onClick={() => scrollTo(item.anchor)}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary-600/10 px-2 py-1 text-[11px] font-semibold text-primary-600 transition-colors hover:bg-primary-600/20 dark:bg-primary-500/15 dark:text-primary-400"
                >
                  Add <ArrowRight size={11} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </SectionCard>
  )
}