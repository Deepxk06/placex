import { useState, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import api from '../services/api'
import { getScoreColor } from '../utils/helpers'
import {
  Target, TrendingUp, CheckCircle2, XCircle, ChevronRight, Loader2,
  BookOpen, Zap, Award, BarChart3, AlertTriangle, ArrowRight
} from 'lucide-react'

export default function SkillGapAssessment() {
  const { theme } = useTheme()
  const [skillGap, setSkillGap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/assessment/skill-gap')
        setSkillGap(res.data)
      } catch (err) {
        console.error('Failed to fetch skill gap:', err)
        setError('Failed to load skill gap analysis. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target size={22} className="text-primary-600" /> Skill Gap Analysis
          </h2>
        </div>
        <div className="card text-center py-12">
          <AlertTriangle className="mx-auto text-amber-500 mb-3" size={40} />
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!skillGap || (!skillGap.currentSkills?.length && !skillGap.targetSkills?.length)) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target size={22} className="text-primary-600" /> Skill Gap Analysis
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Compare your skills with your target role requirements
          </p>
        </div>
        <div className="card text-center py-12">
          <Target className="mx-auto text-gray-400 mb-3" size={40} />
          <p className="text-gray-500 dark:text-gray-400 mb-2">No skill gap data available yet</p>
          <p className="text-sm text-gray-400">Complete your profile and set a target role to see your skill gap analysis</p>
        </div>
      </div>
    )
  }

  const { currentSkills = [], targetSkills = [], missingSkills = [], recommendations = [], matchPercentage = 0 } = skillGap || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Target size={22} className="text-primary-600" /> Skill Gap Analysis
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Compare your skills with your target role requirements
        </p>
      </div>

      {/* Match Score Card */}
      <div className="card">
        <div className="flex items-center gap-6">
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none"
                className="text-gray-200 dark:text-gray-700" />
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - matchPercentage / 100)}`}
                strokeLinecap="round"
                className={matchPercentage >= 70 ? 'text-emerald-500' : matchPercentage >= 40 ? 'text-amber-500' : 'text-red-500'} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xl font-bold ${getScoreColor(matchPercentage)}`}>{matchPercentage}%</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Skill Match Score</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {matchPercentage >= 70 ? 'Great match! You have most required skills.' :
               matchPercentage >= 40 ? 'Good progress. Focus on the missing skills.' :
               'Keep learning! Focus on building the missing skills.'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card flex items-center gap-3 rounded-xl p-4">
          <div className="rounded-lg p-2.5 bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Your Skills</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{currentSkills.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 rounded-xl p-4">
          <div className="rounded-lg p-2.5 bg-primary-100 dark:bg-primary-900/30">
            <Target size={20} className="text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Target Skills</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{targetSkills.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 rounded-xl p-4">
          <div className="rounded-lg p-2.5 bg-amber-100 dark:bg-amber-900/30">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Missing Skills</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{missingSkills.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 rounded-xl p-4">
          <div className="rounded-lg p-2.5 bg-purple-100 dark:bg-purple-900/30">
            <BookOpen size={20} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Recommendations</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{recommendations.length}</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Skills */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
            <CheckCircle2 size={16} className="text-emerald-500" /> Your Current Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {currentSkills.map((s, i) => (
              <span key={i} className="badge bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                {s}
              </span>
            ))}
            {currentSkills.length === 0 && (
              <p className="text-sm text-gray-400">No skills added yet</p>
            )}
          </div>
        </div>

        {/* Target Skills */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
            <Target size={16} className="text-primary-500" /> Target Role Skills ({targetSkills.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {targetSkills.map((s, i) => {
              const hasSkill = currentSkills.includes(s)
              return (
                <span key={i} className={`badge ${
                  hasSkill
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {hasSkill && <CheckCircle2 size={10} className="inline mr-1" />}
                  {!hasSkill && <XCircle size={10} className="inline mr-1" />}
                  {s}
                </span>
              )
            })}
          </div>
        </div>

        {/* Missing Skills */}
        {missingSkills.length > 0 && (
          <div className="card lg:col-span-2">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-amber-500" /> Missing Skills to Acquire
            </h3>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((s, i) => (
                <span key={i} className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="card lg:col-span-2">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
              <Zap size={16} className="text-primary-500" /> Learning Recommendations
            </h3>
            <div className="space-y-3">
              {recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <ArrowRight size={14} className="text-primary-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-200">{r}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
