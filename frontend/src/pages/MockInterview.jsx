import { useState } from 'react'
import api from '../services/api'
import { Mic, Square, Play, ChevronRight, Loader } from 'lucide-react'
import { getScoreBg } from '../utils/helpers'

export default function MockInterview() {
  const [interview, setInterview] = useState(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [recording, setRecording] = useState(false)
  const [audioData, setAudioData] = useState(null)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const startInterview = async (type) => {
    setLoading(true)
    try {
      const res = await api.post(`/interview/start?interview_type=${type}`)
      setInterview(res.data)
      setCurrentQ(0)
      setReport(null)
    } catch {} finally { setLoading(false) }
  }

  const startRecording = () => {
    setRecording(true)
    setAudioData(null)
    // In production, use MediaRecorder API
    setTimeout(() => {
      setRecording(false)
      setAudioData('simulated_audio_data')
    }, 3000)
  }

  const submitAudio = async () => {
    if (!interview || !audioData) return
    setLoading(true)
    try {
      await api.post(`/interview/submit-audio?interview_id=${interview.id}&question_index=${currentQ}&audio_data=${encodeURIComponent(audioData)}`)
      if (currentQ < interview.totalQuestions - 1) {
        setCurrentQ(currentQ + 1)
        setAudioData(null)
      }
    } catch {} finally { setLoading(false) }
  }

  const getReport = async () => {
    if (!interview) return
    setLoading(true)
    try {
      const res = await api.get(`/interview/${interview.id}/report`)
      setReport(res.data)
    } catch {} finally { setLoading(false) }
  }

  if (!interview) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold">AI Mock Interview</h1>
        <p className="text-gray-500">Practice with voice-based HR and technical interviews</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <button onClick={() => startInterview('hr')} className="card hover:border-primary-400 transition-colors p-8">
            <Mic size={40} className="mx-auto text-primary-500 mb-3" />
            <h3 className="text-lg font-semibold">HR Interview</h3>
            <p className="text-sm text-gray-500">Practice common HR questions</p>
          </button>
          <button onClick={() => startInterview('technical')} className="card hover:border-primary-400 transition-colors p-8">
            <Play size={40} className="mx-auto text-green-500 mb-3" />
            <h3 className="text-lg font-semibold">Technical Interview</h3>
            <p className="text-sm text-gray-500">Practice technical questions</p>
          </button>
        </div>
        {loading && <div className="flex justify-center"><Loader className="animate-spin" /></div>}
      </div>
    )
  }

  if (report) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">Interview Report</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className={`text-2xl font-bold ${getScoreBg(report.analysis?.confidenceScore * 100 || 0)}`}>
              {Math.round((report.analysis?.confidenceScore || 0) * 100)}%
            </div>
            <div className="text-sm text-gray-500">Confidence</div>
          </div>
          <div className="card text-center">
            <div className={`text-2xl font-bold ${getScoreBg(report.analysis?.fluencyScore * 100 || 0)}`}>
              {Math.round((report.analysis?.fluencyScore || 0) * 100)}%
            </div>
            <div className="text-sm text-gray-500">Fluency</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold">{((report.analysis?.sentimentScore || 0)).toFixed(2)}</div>
            <div className="text-sm text-gray-500">Sentiment</div>
          </div>
          <div className="card text-center">
            <div className={`text-2xl font-bold ${getScoreBg(report.analysis?.overallScore || 0)}`}>
              {Math.round(report.analysis?.overallScore || 0)}%
            </div>
            <div className="text-sm text-gray-500">Overall</div>
          </div>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3">Feedback</h2>
          <ul className="space-y-2">
            {report.analysis?.feedback?.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <ChevronRight size={14} className="text-primary-500 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3">Transcripts</h2>
          {report.questions?.map((q, i) => (
            <div key={i} className="mb-3 text-sm">
              <p className="font-medium text-gray-700">Q{i + 1}: {q.question}</p>
              {q.transcript && <p className="text-gray-500 ml-4 mt-1">→ {q.transcript}</p>}
            </div>
          ))}
        </div>
        <button onClick={() => { setInterview(null); setReport(null) }} className="btn-primary">
          Practice Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Mock Interview</h1>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">Question {currentQ + 1} of {interview.totalQuestions}</span>
          <span className="badge bg-primary-100 text-primary-700">{interview.questions[currentQ]?.category}</span>
        </div>
        <p className="text-lg font-medium mb-6">{interview.questions[currentQ]?.question}</p>
        <div className="flex justify-center gap-4">
          {!recording ? (
            <button onClick={startRecording} className="btn-primary flex items-center gap-2">
              <Mic size={20} /> Start Recording
            </button>
          ) : (
            <button className="btn-danger flex items-center gap-2">
              <Square size={20} /> Recording... (3s)
            </button>
          )}
        </div>
        <div className="flex justify-between mt-6">
          <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
              className="btn-secondary">Previous</button>
          {currentQ < interview.totalQuestions - 1 ? (
            <button onClick={submitAudio} disabled={!audioData || loading} className="btn-primary">
              {loading ? 'Processing...' : 'Next Question'}
            </button>
          ) : (
            <button onClick={getReport} disabled={loading} className="btn-primary">
              Get Report
            </button>
          )}
        </div>
      </div>
      {audioData && (
        <div className="card bg-green-50 border-green-200">
          <p className="text-green-700 text-sm">✓ Audio recorded. Ready for analysis.</p>
        </div>
      )}
    </div>
  )
}
