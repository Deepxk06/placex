import { useState, useEffect } from 'react'
import api from '../services/api'
import { Users, Search, Linkedin, MessageCircle, Award, ChevronRight, UserPlus } from 'lucide-react'

export default function AlumniNetwork() {
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [connectMsg, setConnectMsg] = useState({})
  const [sent, setSent] = useState({})

  useEffect(() => {
    api.get('/alumni/recommended').then(r => {
      setAlumni(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const connect = async (alumniId) => {
    try {
      await api.post(`/alumni/connect-request?alumni_id=${alumniId}&message=${encodeURIComponent(connectMsg[alumniId] || '')}`)
      setSent({...sent, [alumniId]: true})
    } catch {}
  }

  const filtered = alumni.filter(a =>
    a.alumni?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.alumni?.currentCompany?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Alumni Network</h1>
          <p className="text-gray-500">Connect with alumni from your college</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input className="input-field pl-9" placeholder="Search alumni..." aria-label="Search alumni" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <div key={item.alumni._id} className="card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="bg-primary-100 p-3 rounded-full shrink-0">
                  <Users size={24} className="text-primary-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold break-words">{item.alumni.name}</h3>
                  <p className="text-sm text-gray-600 break-words">
                    {item.alumni.currentRole} @ {item.alumni.currentCompany}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{item.alumni.branch}</span>
                    <span>Batch of {item.alumni.gradYear}</span>
                    {item.alumni.mentorshipAvailable && (
                      <span className="badge-success flex items-center gap-1">
                        <Award size={10} /> Mentor Available
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-center">
                  <div className={`text-lg font-bold ${
                    item.matchScore >= 70 ? 'text-green-600' : item.matchScore >= 40 ? 'text-yellow-600' : 'text-gray-400'
                  }`}>
                    {Math.round(item.matchScore)}%
                  </div>
                  <div className="text-xs text-gray-400">Match</div>
                </div>
                {item.alumni.linkedIn && (
                  <a href={item.alumni.linkedIn} target="_blank" rel="noreferrer"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Linkedin size={18} />
                  </a>
                )}
              </div>
            </div>

            {item.commonSkills?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {item.commonSkills.map((s, i) => (
                  <span key={i} className="badge bg-green-100 text-green-700">{s}</span>
                ))}
              </div>
            )}

            {!sent[item.alumni._id] ? (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <textarea className="input-field text-sm mb-2" rows={2} aria-label="Message to alumni" placeholder="Write a message..."
                  value={connectMsg[item.alumni._id] || ''}
                  onChange={(e) => setConnectMsg({...connectMsg, [item.alumni._id]: e.target.value})} />
                <button onClick={() => connect(item.alumni._id)} className="btn-primary text-sm flex items-center gap-1">
                  <UserPlus size={14} /> Send Connect Request
                </button>
              </div>
            ) : (
              <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-green-600 flex items-center gap-2">
                <Award size={16} /> Request sent!
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card text-center text-gray-400 py-10">
            <Users size={48} className="mx-auto mb-3 opacity-50" />
            <p>No alumni found. Check back later!</p>
          </div>
        )}
      </div>
    </div>
  )
}
