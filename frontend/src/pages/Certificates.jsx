import { useState, useEffect } from 'react'
import api from '../services/api'
import { Award, Plus, Trash2, ExternalLink, Calendar, Building2, X } from 'lucide-react'

export default function Certificates() {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    issuing_org: '',
    issue_date: '',
    expiry_date: '',
    credential_id: '',
    verification_url: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCerts()
  }, [])

  async function fetchCerts() {
    setLoading(true)
    try {
      const res = await api.get('/certificates/')
      setCerts(res.data)
    } catch {
      setError('Failed to load certificates')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        ...form,
        issue_date: form.issue_date || null,
        expiry_date: form.expiry_date || null,
      }
      const res = await api.post('/certificates/', payload)
      setCerts((prev) => [res.data, ...prev])
      setForm({ name: '', issuing_org: '', issue_date: '', expiry_date: '', credential_id: '', verification_url: '' })
      setShowForm(false)
    } catch {
      setError('Failed to add certificate')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/certificates/${id}/`)
      setCerts((prev) => prev.filter((c) => c.id !== id))
    } catch {
      setError('Failed to delete certificate')
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Certificates</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your professional certifications and credentials.
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Certificate
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="card dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Add New Certificate</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Certificate Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input-field w-full"
                placeholder="e.g. AWS Solutions Architect"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Issuing Organization <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input-field w-full"
                placeholder="e.g. Amazon Web Services"
                value={form.issuing_org}
                onChange={(e) => setForm({ ...form, issuing_org: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Credential ID
              </label>
              <input
                type="text"
                className="input-field w-full"
                placeholder="e.g. AWS-SAA-12345"
                value={form.credential_id}
                onChange={(e) => setForm({ ...form, credential_id: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Issue Date
              </label>
              <input
                type="date"
                className="input-field w-full"
                value={form.issue_date}
                onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                className="input-field w-full"
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Verification URL
              </label>
              <input
                type="url"
                className="input-field w-full"
                placeholder="https://verify.example.com/cert/..."
                value={form.verification_url}
                onChange={(e) => setForm({ ...form, verification_url: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Add Certificate
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : certs.length === 0 ? (
        <div className="card dark:bg-gray-900 dark:border-gray-800 flex flex-col items-center gap-4 py-16 text-center">
          <div className="p-4 rounded-full bg-primary-50 dark:bg-primary-900/20">
            <Award size={32} className="text-primary-500" />
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">No certificates yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Add your professional certifications to showcase your skills.
            </p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Add Your First Certificate
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {certs.map((cert) => (
            <div key={cert.id} className="card dark:bg-gray-900 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 shrink-0">
                    <Award size={24} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white break-words">
                      {cert.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <Building2 size={14} className="shrink-0" />
                      <span className="truncate">{cert.issuing_org}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {cert.issue_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Issued {formatDate(cert.issue_date)}
                        </span>
                      )}
                      {cert.expiry_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Expires {formatDate(cert.expiry_date)}
                        </span>
                      )}
                      {cert.credential_id && (
                        <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          ID: {cert.credential_id}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {cert.verification_url && (
                    <a
                      href={cert.verification_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary text-sm flex items-center gap-1"
                    >
                      Verify <ExternalLink size={14} />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(cert.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete certificate"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
