import { useState, useEffect } from 'react'
import api from '../services/api'
import { Building2, Search, DollarSign, Users, HelpCircle, ChevronRight } from 'lucide-react'
import { formatSalary } from '../utils/helpers'

export default function CompanyInsights() {
  const [companies, setCompanies] = useState([])
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/company').then(r => { setCompanies(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const selectCompany = async (name) => {
    try {
      const res = await api.get(`/company/insights/${encodeURIComponent(name)}`)
      setSelected(Array.isArray(res.data) ? res.data[0] : res.data)
    } catch {}
  }

  const filtered = companies.filter(c => c.companyName?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold">Company Insights</h1>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        <input className="input-field pl-9" placeholder="Search company..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          {filtered.map((c) => (
            <div key={c.id} className={`card cursor-pointer py-3 px-4 hover:border-primary-300 transition-colors ${selected?.companyName === c.companyName ? 'border-primary-500' : ''}`}
              onClick={() => selectCompany(c.companyName)}>
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-gray-400" />
                <span className="font-medium">{c.companyName}</span>
              </div>
              {c.industry && <span className="text-xs text-gray-400 ml-6">{c.industry}</span>}
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              <div className="card">
                <h2 className="text-xl font-bold mb-2">{selected.companyName}</h2>
                {selected.industry && <p className="text-sm text-gray-500">{selected.industry}</p>}
              </div>
              {selected.salaries?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><DollarSign size={18} className="text-green-500" /> Salary Details</h3>
                  <div className="space-y-2">
                    {selected.salaries.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-gray-100">
                        <span>{s.role}</span>
                        <span className="font-medium">{formatSalary(s.minSalary, s.maxSalary)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selected.interviewExperiences?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><Users size={18} className="text-blue-500" /> Interview Experiences</h3>
                  {selected.interviewExperiences.map((exp, i) => (
                    <div key={i} className="mb-3 pb-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{exp.role}</span>
                        <span className={`badge ${exp.difficulty === 'hard' ? 'badge-danger' : exp.difficulty === 'medium' ? 'badge-warning' : 'badge-success'}`}>{exp.difficulty}</span>
                        {exp.offers && <span className="badge-success">Offers Made</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{exp.process}</p>
                      {exp.questions?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-400 mb-1">Questions asked:</p>
                          {exp.questions.map((q, j) => <p key={j} className="text-xs text-gray-600">• {q}</p>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {selected.faqs?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><HelpCircle size={18} className="text-purple-500" /> FAQs</h3>
                  {selected.faqs.map((faq, i) => (
                    <div key={i} className="mb-2">
                      <p className="text-sm font-medium text-gray-700">Q: {faq.question}</p>
                      <p className="text-sm text-gray-500 ml-4">A: {faq.answer}</p>
                    </div>
                  ))}
                </div>
              )}
              {selected.requiredSkills?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-1">
                    {selected.requiredSkills.map((s, i) => (
                      <span key={i} className="badge bg-blue-100 text-blue-800">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card text-center text-gray-400 py-10">
              <Building2 size={48} className="mx-auto mb-3 opacity-50" />
              <p>Select a company to view insights</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
