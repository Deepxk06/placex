import { useState, useCallback } from 'react'
import api from '../services/api'

export function useApi(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(url, { params })
      setData(res.data)
      return res.data
    } catch (err) {
      setError(err.response?.data?.detail || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [url])

  const post = useCallback(async (body = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post(url, body)
      setData(res.data)
      return res.data
    } catch (err) {
      setError(err.response?.data?.detail || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [url])

  return { data, loading, error, fetch, post }
}
