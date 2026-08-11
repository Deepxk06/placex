import { useState, useEffect, createContext, useContext } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

const AUTH_KEYS = ['placex_token', 'placex_uid', 'placex_email', 'placex_name']

function clearSession() {
  AUTH_KEYS.forEach((k) => sessionStorage.removeItem(k))
}

function readSession(keys) {
  return keys.map((k) => sessionStorage.getItem(k))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const [token, uid, email, name] = readSession(AUTH_KEYS)
    if (token && uid) {
      api.get('/auth/me').then((res) => {
        setUser({ uid, email, name: res.data?.name || name, profile: res.data })
      }).catch((err) => {
        if (err.response?.status === 401) {
          clearSession()
          setUser(null)
        } else {
          setUser({ uid, email, name })
        }
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/dev-login', { email, password })
    sessionStorage.setItem('placex_token', res.data.token)
    sessionStorage.setItem('placex_uid', res.data.uid)
    sessionStorage.setItem('placex_email', res.data.email)
    sessionStorage.setItem('placex_name', res.data.name)
    setUser({
      uid: res.data.uid,
      email: res.data.email,
      name: res.data.name,
    })
    return res.data
  }

  const register = async (email, password, name) => {
    const res = await api.post('/auth/dev-login', { email, password })
    sessionStorage.setItem('placex_token', res.data.token)
    sessionStorage.setItem('placex_uid', res.data.uid)
    sessionStorage.setItem('placex_email', res.data.email)
    sessionStorage.setItem('placex_name', name || res.data.name)
    setUser({
      uid: res.data.uid,
      email: res.data.email,
      name: name || res.data.name,
    })
    return res.data
  }

  const logout = () => {
    clearSession()
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
