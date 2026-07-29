import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import api from '../services/api'
import { getScoreBg } from '../utils/helpers'
import { Link } from 'react-router-dom'

export default function ResumePage() {
  const [uploading, setUploading] = useState(false)
  const [resume, setResume] = useState(null)
  const [atsScore, setAtsScore] = useState(null)
  const [jdText, setJdText] = useState('')
  const [jdResult, setJdResult] = useState(null)
  const [error, setError] = useState('')

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    setUploading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResume(res.data)
    } catch (err) {
      setError('Failed to upload resume. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
  })

  const checkATS = async () => {
    if (!resume) return
    try {
      const res = await api.post(`/resume/${resume.id}/ats-score`)
      setAtsScore(res.data)
    } catch { setError('Failed to check ATS score') }
  }

  const matchJD = async () => {
    if (!resume || !jdText) return
    try {
      const res = await api.post(`/resume/${resume.id}/match-jd?jd_text=${encodeURIComponent(jdText)}`)
      setJdResult(res.data)
    } catch { setError('Failed to match JD') }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resume Analysis</h1>
          <p className="text-gray-500">Upload your resume for ATS scoring and JD matching</p>
        </div>
        <Link to="/resume-builder" className="btn-primary flex items-center gap-2">
          Build Resume <ArrowRight size={16} />
        </Link>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

      <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
      }`}>
        <input {...getInputProps()} />
        <Upload className="mx-auto text-gray-400 mb-4" size={40} />
        {uploading ? (
          <p className="text-gray-500">Uploading...</p>
        ) : resume ? (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle size={20} />
            <span>Resume uploaded successfully!</span>
          </div>
        ) : (
          <div>
            <p className="font-medium text-gray-700">Drop your resume here, or click to browse</p>
            <p className="text-sm text-gray-400 mt-1">Supports PDF format only</p>
          </div>
        )}
      </div>

      {resume && !atsScore && (
        <button onClick={checkATS} className="btn-primary">Check ATS Score</button>
      )}

      {atsScore && (
        <div className="card">
          <h2 className="font-semibold mb-4">ATS Score</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className={`text-3xl font-bold ${atsScore.overall >= 80 ? 'text-green-600' : atsScore.overall >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {atsScore.overall}%
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div className={`h-3 rounded-full transition-all ${
                atsScore.overall >= 80 ? 'bg-green-500' : atsScore.overall >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`} style={{ width: `${atsScore.overall}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div><div className="text-xs text-gray-500">Keywords</div><div className="font-medium">{atsScore.keywordScore}%</div></div>
            <div><div className="text-xs text-gray-500">Format</div><div className="font-medium">{atsScore.formatScore}%</div></div>
            <div><div className="text-xs text-gray-500">Length</div><div className="font-medium">{atsScore.lengthScore}%</div></div>
            <div><div className="text-xs text-gray-500">Action Verbs</div><div className="font-medium">{atsScore.verbScore}%</div></div>
            <div><div className="text-xs text-gray-500">Sections</div><div className="font-medium">{atsScore.sectionScore}%</div></div>
          </div>
          <div className="space-y-2">
            {atsScore.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <AlertCircle size={14} className="text-yellow-500 mt-0.5 shrink-0" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold mb-4">Resume vs Job Description</h2>
        <textarea className="input-field mb-3" rows={4} placeholder="Paste job description here..."
          value={jdText} onChange={(e) => setJdText(e.target.value)} />
        <button onClick={matchJD} disabled={!resume || !jdText} className="btn-primary">Match Resume</button>
        {jdResult && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-medium">Match Score:</span>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreBg(jdResult.matchScore)}`}>
                {jdResult.matchScore}%
              </span>
            </div>
            {jdResult.matchingSkills?.length > 0 && (
              <div>
                <span className="text-sm text-gray-500">Matching Skills:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {jdResult.matchingSkills.map((s, i) => (
                    <span key={i} className="badge-success">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {jdResult.missingSkills?.length > 0 && (
              <div>
                <span className="text-sm text-gray-500">Missing Skills:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {jdResult.missingSkills.map((s, i) => (
                    <span key={i} className="badge-warning">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {jdResult.suggestions?.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <AlertCircle size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
