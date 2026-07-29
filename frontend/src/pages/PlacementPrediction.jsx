import { useState, useEffect } from 'react'
import api from '../services/api'
import { TrendingUp, DollarSign, UserCheck, Lightbulb, ChevronRight } from 'lucide-react'
import { getScoreBg, getScoreColor } from '../utils/helpers'

export default function PlacementPrediction() {
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/prediction/placement').then(r => {
      setPrediction(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">Placement Prediction</h1>
      <p className="text-gray-500">AI-powered analysis of your placement chances</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <TrendingUp size={32} className="mx-auto text-primary-500 mb-2" />
          <div className={`text-3xl font-bold ${getScoreColor((prediction?.placementProbability || 0) * 100)}`}>
            {Math.round((prediction?.placementProbability || 0) * 100)}%
          </div>
          <div className="text-sm text-gray-500">Placement Probability</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className={`h-2 rounded-full ${
              (prediction?.placementProbability || 0) >= 0.7 ? 'bg-green-500' :
              (prediction?.placementProbability || 0) >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
            }`} style={{ width: `${(prediction?.placementProbability || 0) * 100}%` }} />
          </div>
        </div>
        <div className="card text-center">
          <DollarSign size={32} className="mx-auto text-green-500 mb-2" />
          <div className="text-3xl font-bold text-green-600">
            ₹{Math.round((prediction?.expectedSalary || 0) / 100000)}L
          </div>
          <div className="text-sm text-gray-500">Expected Salary</div>
        </div>
        <div className="card text-center">
          <UserCheck size={32} className="mx-auto text-purple-500 mb-2" />
          <div className="text-xl font-bold text-purple-600">{prediction?.predictedRole || 'N/A'}</div>
          <div className="text-sm text-gray-500">Predicted Role</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Features Used</h2>
          <div className="space-y-3">
            {prediction?.featuresUsed && Object.entries(prediction.featuresUsed).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-medium">{typeof value === 'number' ? (key.includes('Score') || key.includes('cgpa') ? value.toFixed(2) : value) : value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Lightbulb size={18} className="text-yellow-500" /> Skill Recommendations
          </h2>
          <ul className="space-y-2">
            {prediction?.skillRecommendations?.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <ChevronRight size={14} className="text-primary-500 mt-0.5 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
