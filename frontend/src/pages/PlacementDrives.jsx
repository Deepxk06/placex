import { useState, useEffect } from 'react'
import { Briefcase, MapPin, Calendar, Users, CheckCircle2, Clock, Building2, IndianRupee, GraduationCap, ChevronDown } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../store/authStore'
import { cn } from '../utils/helpers'

export default function PlacementDrives() {
  const { user } = useAuth()
  const [drives, setDrives] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    company_name: '', role: '', description: '', location: '', salary_range: '',
    eligibility_cgpa: 0, eligible_branches: '', required_skills: '',
    total_positions: 0, drive_date: '', application_deadline: '',
  })

  useEffect(() => {
    Promise.all([
      api.get('/placement-drives/').catch(() => ({ data: [] })),
      api.get('/placement-drives/my-registrations').catch(() => ({ data: [] })),
    ]).then(([d, r]) => {
      setDrives(d.data)
      setRegistrations(r.data)
      setLoading(false)
    })
  }, [])

  async function registerDrive(id) {
    try {
      await api.post(`/placement-drives/${id}/register`)
      setDrives((prev) => prev.map((d) => d.id === id ? { ...d, is_registered: true, registrations: d.registrations + 1 } : d))
      const rRes = await api.get('/placement-drives/my-registrations').catch(() => ({ data: [] }))
      setRegistrations(rRes.data)
    } catch {}
  }

  async function createDrive(e) {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        eligible_branches: form.eligible_branches ? form.eligible_branches.split(',').map((s) => s.trim()) : [],
        required_skills: form.required_skills ? form.required_skills.split(',').map((s) => s.trim()) : [],
        eligibility_cgpa: parseFloat(form.eligibility_cgpa) || 0,
        total_positions: parseInt(form.total_positions) || 0,
      }
      await api.post('/placement-drives/', payload)
      setShowCreate(false)
      const dRes = await api.get('/placement-drives/').catch(() => ({ data: [] }))
      setDrives(dRes.data)
      setForm({ company_name: '', role: '', description: '', location: '', salary_range: '', eligibility_cgpa: 0, eligible_branches: '', required_skills: '', total_positions: 0, drive_date: '', application_deadline: '' })
    } catch {}
  }

  const filtered = tab === 'registered'
    ? drives.filter((d) => d.is_registered)
    : tab === 'eligible'
    ? drives.filter((d) => d.eligible && !d.is_registered)
    : drives

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ongoing: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    completed: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Briefcase className="text-indigo-600" size={28} />
            Placement Drives
          </h1>
          <p className="text-sm text-gray-500 mt-1">Register for upcoming campus placement drives</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors"
          >
            {showCreate ? 'Cancel' : '+ New Drive'}
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreate && (
        <form onSubmit={createDrive} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-800/70 p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input placeholder="Company Name *" required value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="input-field" />
            <input placeholder="Role *" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field" />
            <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" />
            <input placeholder="Salary Range (e.g. 8-12 LPA)" value={form.salary_range} onChange={(e) => setForm({ ...form, salary_range: e.target.value })} className="input-field" />
            <input type="number" step="0.1" placeholder="Min CGPA" value={form.eligibility_cgpa} onChange={(e) => setForm({ ...form, eligibility_cgpa: e.target.value })} className="input-field" />
            <input type="number" placeholder="Total Positions" value={form.total_positions} onChange={(e) => setForm({ ...form, total_positions: e.target.value })} className="input-field" />
            <input type="datetime-local" value={form.drive_date} onChange={(e) => setForm({ ...form, drive_date: e.target.value })} className="input-field" />
            <input type="datetime-local" value={form.application_deadline} onChange={(e) => setForm({ ...form, application_deadline: e.target.value })} className="input-field" />
          </div>
          <input placeholder="Eligible Branches (comma-separated)" value={form.eligible_branches} onChange={(e) => setForm({ ...form, eligible_branches: e.target.value })} className="input-field w-full" />
          <input placeholder="Required Skills (comma-separated)" value={form.required_skills} onChange={(e) => setForm({ ...form, required_skills: e.target.value })} className="input-field w-full" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field w-full h-20" />
          <button type="submit" className="px-6 py-2 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors">
            Create Drive
          </button>
        </form>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All Drives' },
          { key: 'eligible', label: 'Eligible' },
          { key: 'registered', label: 'My Registrations' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              tab === t.key
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Drive Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Briefcase size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No placement drives found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((d) => (
            <div
              key={d.id}
              className={cn(
                'bg-white dark:bg-gray-900 rounded-2xl border p-5 hover:shadow-md transition-shadow',
                d.is_registered ? 'border-green-200 dark:border-green-800/50' : 'border-gray-200/70 dark:border-gray-800/70'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Building2 size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{d.company_name}</h3>
                    <p className="text-xs text-gray-500">{d.role}</p>
                  </div>
                </div>
                <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase', statusColors[d.status])}>
                  {d.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                {d.location && (
                  <span className="flex items-center gap-1"><MapPin size={12} /> {d.location}</span>
                )}
                {d.salary_range && (
                  <span className="flex items-center gap-1"><IndianRupee size={12} /> {d.salary_range}</span>
                )}
                {d.drive_date && (
                  <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(d.drive_date).toLocaleDateString()}</span>
                )}
                <span className="flex items-center gap-1"><Users size={12} /> {d.registrations} registered</span>
                {d.total_positions > 0 && (
                  <span className="flex items-center gap-1"><Briefcase size={12} /> {d.total_positions} positions</span>
                )}
                {d.eligibility_cgpa > 0 && (
                  <span className="flex items-center gap-1"><GraduationCap size={12} /> Min CGPA: {d.eligibility_cgpa}</span>
                )}
              </div>

              {d.required_skills?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {d.required_skills.slice(0, 5).map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-500">{s}</span>
                  ))}
                  {d.required_skills.length > 5 && (
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-400">+{d.required_skills.length - 5}</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                {!d.eligible && !d.is_registered && (
                  <span className="text-[10px] text-rose-500 font-medium">Not eligible</span>
                )}
                {d.is_registered ? (
                  <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                    <CheckCircle2 size={14} /> Registered
                  </span>
                ) : d.eligible ? (
                  <button
                    onClick={() => registerDrive(d.id)}
                    className="px-4 py-1.5 rounded-xl bg-primary-600 text-white text-xs font-bold hover:bg-primary-700 transition-colors"
                  >
                    Register
                  </button>
                ) : (
                  <span />
                )}
                {d.application_deadline && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock size={10} /> Deadline: {new Date(d.application_deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
