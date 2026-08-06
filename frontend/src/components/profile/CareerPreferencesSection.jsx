import { useState } from 'react'
import { Target, Save, RotateCcw } from 'lucide-react'
import SectionCard from './SectionCard'
import { Field, TextInput, SelectInput } from './FormField'
import { useProfileStore } from '../../store/profileStore'
import { useToast } from '../ui/ToastProvider'
import { cn } from '../../utils/helpers'

const DOMAINS = ['Software Development', 'Data Science', 'AI / Machine Learning', 'Cloud Computing', 'DevOps', 'Web Development', 'Mobile Development', 'Cyber Security', 'Product / Analytics', 'Other']
const SALARY_RANGES = ['₹3–5 LPA', '₹5–8 LPA', '₹8–12 LPA', '₹12–18 LPA', '₹18+ LPA', 'Not specified']
const WORK_TYPES = ['on-site', 'hybrid', 'remote']

export default function CareerPreferencesSection() {
  const { ext, saveField } = useProfileStore()
  const { toast } = useToast()
  const prefs = ext?.careerPrefs || {}
  const [draft, setDraft] = useState(null)
  const [dirty, setDirty] = useState(false)

  const open = draft !== null
  const start = () => setDraft({ ...prefs })
  const set = (k, v) => {
    setDraft((d) => ({ ...d, [k]: v }))
    setDirty(true)
  }

  const cancel = () => {
    setDraft(null)
    setDirty(false)
  }

  const save = () => {
    saveField('careerPrefs', draft, 'Career preferences updated')
    setDraft(null)
    setDirty(false)
    toast({ type: 'success', message: 'Career preferences saved' })
  }

  const pinned = {
    role: prefs.role,
    domain: prefs.domain,
    location: prefs.location,
    salary: prefs.expectedSalary,
  }
  const hasPinned = Object.values(pinned).some(Boolean)

  return (
    <SectionCard
      id="sec-career"
      icon={Target}
      title="Career Preferences"
      subtitle="What roles and companies should PlaceX match you with"
    >
      {!open ? (
        <div>
          {!hasPinned && (
            <p className="mb-4 text-xs text-gray-400">
              Telling us your target role helps our AI match you with the right companies and learning paths.
            </p>
          )}
          {hasPinned && (
            <div className="mb-4 flex flex-wrap gap-2">
              {prefs.role && <Chip label={`Role: ${prefs.role}`} />}
              {prefs.domain && <Chip label={prefs.domain} />}
              {prefs.location && <Chip label={`📍 ${prefs.location}`} />}
              {prefs.expectedSalary && <Chip label={prefs.expectedSalary} />}
              <Chip label={prefs.workType?.toUpperCase()} />
              {prefs.immediateJoining && <Chip label="Immediate joining" tone="emerald" />}
            </div>
          )}
          <button onClick={start} className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            <Target size={14} /> {hasPinned ? 'Edit career preferences' : 'Set career preferences'}
          </button>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Preferred role">
              <SelectInput value={draft?.role} onChange={(e) => set('role', e.target.value)} placeholder="Select role">
                {['Software Engineer', 'Data Scientist', 'ML Engineer', 'Full Stack Developer', 'DevOps Engineer', 'Cloud Engineer', 'Frontend Developer', 'Backend Developer', 'Data Analyst', 'Product Manager'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Preferred domain">
              <SelectInput value={draft?.domain} onChange={(e) => set('domain', e.target.value)} placeholder="Select domain" options={DOMAINS} />
            </Field>
            <Field label="Preferred location">
              <SelectInput value={draft?.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Bengaluru (or Remote)" options={['Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Chennai', 'Remote', 'Anywhere in India', 'Abroad']} />
            </Field>
            <Field label="Expected salary">
              <SelectInput value={draft?.expectedSalary} onChange={(e) => set('expectedSalary', e.target.value)} placeholder="Select range" options={SALARY_RANGES} />
            </Field>
          </div>

          <Field label="Work type">
            <div className="flex rounded-xl border border-gray-200 p-1 dark:border-gray-700">
              {WORK_TYPES.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => set('workType', w)}
                  className={cn('flex-1 rounded-lg px-3 py-2 text-xs font-semibold capitalize transition-colors', draft?.workType === w ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200')}
                >
                  {w}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Backlogs (current)">
              <SelectInput value={String(draft?.backlogs ?? 0)} onChange={(e) => set('backlogs', Number(e.target.value))} options={['0', '1', '2', '3+']} />
            </Field>
            <Field label="Available for immediate joining">
              <button
                type="button"
                onClick={() => set('immediateJoining', !draft?.immediateJoining)}
                className={cn('mt-1.5 flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition-colors', draft?.immediateJoining ? 'border-emerald-400 bg-emerald-500/10 text-emerald-600' : 'border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400')}
              >
                <span className={cn('relative h-5 w-9 rounded-full transition-colors', draft?.immediateJoining ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600')}>
                  <span className={cn('absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', draft?.immediateJoining && 'translate-x-4')} />
                </span>
                {draft?.immediateJoining ? 'Yes — available now' : 'No / After notice period'}
              </button>
            </Field>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button onClick={cancel} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
              <RotateCcw size={13} /> Cancel
            </button>
            <button onClick={save} disabled={!dirty} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary-600 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-glass transition-all hover:-translate-y-px active:scale-95 disabled:opacity-50 disabled:pointer-events-none">
              <Save size={14} /> Save preferences
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  )
}

function Chip({ label, tone }) {
  return (
    <span className={cn('rounded-full px-3 py-1 text-[11px] font-semibold', tone === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-primary-600/10 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400')}>
      {label}
    </span>
  )
}