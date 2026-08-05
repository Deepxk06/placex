import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://placex-bff8.onrender.com'

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('placex_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('placex_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
