import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/authStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = async (testEmail) => {
    setEmail(testEmail)
    setPassword('test123')
    setLoading(true)
    try {
      await login(testEmail, 'test123')
      navigate('/dashboard')
    } catch { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
      <div className="card w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">PlaceX</h1>
          <p className="text-gray-500 mt-1">AI-Powered Placement Platform</p>
        </div>
        <h2 className="text-xl font-semibold mb-6">Sign In</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="input-field" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" className="input-field" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center mb-3">Quick Demo Login (no password needed)</p>
          <div className="space-y-2">
            {['student@placex.com', 'admin@placex.com', 'priya@placex.com'].map((e) => (
              <button key={e} onClick={() => quickLogin(e)}
                className="w-full text-left text-sm px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">
                Login as {e}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account? <Link to="/register" className="text-primary-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}
