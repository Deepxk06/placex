import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from './useTheme'

export default function useKeyboardShortcuts() {
  const navigate = useNavigate()
  const { toggle } = useTheme()

  useEffect(() => {
    function handler(e) {
      const key = e.key.toLowerCase()
      const ctrl = e.ctrlKey || e.metaKey

      if (ctrl && key === 'k') {
        e.preventDefault()
        const el = document.querySelector('[data-search-input]')
        if (el) el.focus()
      }

      if (ctrl && key === 'd') {
        e.preventDefault()
        toggle()
      }

      if (ctrl && key === '1') { e.preventDefault(); navigate('/dashboard') }
      if (ctrl && key === '2') { e.preventDefault(); navigate('/daily-practice') }
      if (ctrl && key === '3') { e.preventDefault(); navigate('/skill-assessment?tab=coding') }
      if (ctrl && key === '4') { e.preventDefault(); navigate('/contests') }
      if (ctrl && key === '5') { e.preventDefault(); navigate('/placement-drives') }

      if (ctrl && key === 'j') { e.preventDefault(); navigate('/jobs') }
      if (ctrl && key === 'r') { e.preventDefault(); navigate('/resume') }
      if (ctrl && key === 'p') { e.preventDefault(); navigate('/profile') }

      if (key === 'g' && !ctrl) {
        let timeout
        const handler2 = (e2) => {
          clearTimeout(timeout)
          const key2 = e2.key.toLowerCase()
          if (key2 === 'd') navigate('/dashboard')
          else if (key2 === 'j') navigate('/jobs')
          else if (key2 === 'r') navigate('/resume')
          else if (key2 === 'c') navigate('/skill-assessment?tab=coding')
          else if (key2 === 'p') navigate('/profile')
          document.removeEventListener('keydown', handler2)
        }
        timeout = setTimeout(() => document.removeEventListener('keydown', handler2), 1000)
        document.addEventListener('keydown', handler2)
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [navigate, toggle])
}
