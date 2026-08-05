import { useState, useEffect } from 'react'
import api from '../services/api'
import { Briefcase, MapPin, Building2, ExternalLink, Search, Filter, ChevronRight } from 'lucide-react'
import { formatSalary, getScoreBg } from '../utils/helpers'

export default function JobRecommendations() {
  const [tab, setTab] = useState('recommended')
  const [recommended, setRecommended] = useState([])
  const [scraped, setScraped] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState({ query: '', location: '', type: '' })

  useEffect(() => {
    setLoading(true)
    if (tab === 'recommended') {
      api.get('/jobs/recommended').then(r => { setRecommended(r.data); setLoading(false) }).catch(() => setLoading(false))
    } else if (tab === 'internships') {
      api.get('/jobs/internships').then(r => { setRecommended(r.data); setLoading(false) }).catch(() => setLoading(false))
    } else {
      api.get('/jobs/scraped/recommended').then(r => { setScraped(r.data); setLoading(false) }).catch(() => setLoading(false))
    }
  }, [tab])

  const jobs = tab === 'scraped' ? scraped : recommended

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold">Job Recommendations</h1>
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        <button onClick={() => setTab('recommended')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'recommended' ? 'bg-primary-50 text-primary-700' : 'text-gray-500'}`}>
          Recommended Jobs
        </button>
        <button onClick={() => setTab('scraped')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'scraped' ? 'bg-primary-50 text-primary-700' : 'text-gray-500'}`}>
          Live Jobs (Scraped)
        </button>
        <button onClick={() => setTab('internships')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'internships' ? 'bg-primary-50 text-primary-700' : 'text-gray-500'}`}>
          Internships
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input className="input-field pl-9" placeholder="Search jobs..." value={search.query}
            onChange={(e) => setSearch({...search, query: e.target.value})} />
        </div>
        <input className="input-field w-full sm:w-48" placeholder="Location" value={search.location}
          onChange={(e) => setSearch({...search, location: e.target.value})} />
        <select className="input-field w-full sm:w-36" value={search.type} onChange={(e) => setSearch({...search, type: e.target.value})}>
          <option value="">All Types</option>
          <option value="fulltime">Full Time</option>
          <option value="internship">Internship</option>
          <option value="remote">Remote</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
      ) : (
        <div className="space-y-3">
          {jobs.filter(j => {
            if (search.query && !j.title?.toLowerCase().includes(search.query.toLowerCase())) return false
            if (search.location && !j.location?.toLowerCase().includes(search.location.toLowerCase())) return false
            if (search.type && j.type !== search.type) return false
            return true
          }).map((job) => (
            <div key={job.id ?? job._id} className="card hover:border-primary-200 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="bg-gray-100 p-2 rounded-lg shrink-0">
                    <Building2 size={20} className="text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold break-words">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.company}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                      <span className="flex items-center gap-1"><Briefcase size={12} /> {job.type}</span>
                      {job.salaryRange && <span>{formatSalary(job.salaryRange?.min, job.salaryRange?.max)}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {job.matchScore !== undefined && (
                    <span className={`badge ${job.matchScore >= 50 ? 'badge-success' : 'badge-warning'}`}>
                      {Math.round(job.matchScore)}% match
                    </span>
                  )}
                  {job.source && job.source !== 'internal' && (
                    <span className="badge bg-blue-100 text-blue-800">{job.source}</span>
                  )}
                  {job.applyUrl && (
                    <a href={job.applyUrl} target="_blank" rel="noreferrer" className="btn-primary text-sm flex items-center gap-1">
                      Apply <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {job.requiredSkills?.slice(0, 8).map((s, i) => (
                  <span key={i} className="badge bg-gray-100 text-gray-600">{s}</span>
                ))}
                {(job.requiredSkills?.length || 0) > 8 && (
                  <span className="badge bg-gray-100 text-gray-400">+{job.requiredSkills.length - 8}</span>
                )}
              </div>
            </div>
          ))}
          {jobs.length === 0 && <p className="text-gray-400 text-center py-10">No jobs found. Check back later!</p>}
        </div>
      )}
    </div>
  )
}
