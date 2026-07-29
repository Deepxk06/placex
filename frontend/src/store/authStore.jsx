import { useState, useEffect, createContext, useContext } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('placex_token')
    const uid = localStorage.getItem('placex_uid')
    const email = localStorage.getItem('placex_email')
    const name = localStorage.getItem('placex_name')
    if (token && uid) {
      api.get('/auth/me').then((res) => {
        setUser({ uid, email, name: res.data?.name || name, profile: res.data })
      }).catch(() => {
        setUser({ uid, email, name })
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/dev-login', { email, password })
    localStorage.setItem('placex_token', res.data.token)
    localStorage.setItem('placex_uid', res.data.uid)
    localStorage.setItem('placex_email', res.data.email)
    localStorage.setItem('placex_name', res.data.name)
    setUser({
      uid: res.data.uid,
      email: res.data.email,
      name: res.data.name,
    })
    return res.data
  }

  const register = async (email, password, name) => {
    const res = await api.post('/auth/dev-login', { email, password })
    localStorage.setItem('placex_token', res.data.token)
    localStorage.setItem('placex_uid', res.data.uid)
    localStorage.setItem('placex_email', res.data.email)
    localStorage.setItem('placex_name', name || res.data.name)
    setUser({
      uid: res.data.uid,
      email: res.data.email,
      name: name || res.data.name,
    })
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('placex_token')
    localStorage.removeItem('placex_uid')
    localStorage.removeItem('placex_email')
    localStorage.removeItem('placex_name')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
