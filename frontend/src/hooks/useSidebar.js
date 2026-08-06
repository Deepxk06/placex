import { useEffect, useState } from 'react'

const STORAGE_KEY = 'placex-sidebar-collapsed'

const MOBILE_QUERY = '(max-width: 767px)'
const TABLET_QUERY = '(min-width: 768px) and (max-width: 1023px)'

function matches(query) {
  return typeof window !== 'undefined' && window.matchMedia(query).matches
}

export default function useSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    if (matches(TABLET_QUERY)) return true
    return localStorage.getItem(STORAGE_KEY) === '1'
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => matches(MOBILE_QUERY))

  useEffect(() => {
    const mobileMq = window.matchMedia(MOBILE_QUERY)
    const tabletMq = window.matchMedia(TABLET_QUERY)
    const onChange = () => {
      setIsMobile(mobileMq.matches)
      if (tabletMq.matches) setCollapsed(true)
    }
    mobileMq.addEventListener('change', onChange)
    tabletMq.addEventListener('change', onChange)
    return () => {
      mobileMq.removeEventListener('change', onChange)
      tabletMq.removeEventListener('change', onChange)
    }
  }, [])

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      return next
    })
  }

  return {
    collapsed,
    toggle,
    mobileOpen,
    openMobile: () => setMobileOpen(true),
    closeMobile: () => setMobileOpen(false),
    isMobile,
  }
}
