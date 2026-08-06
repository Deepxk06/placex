import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import useSidebar from '../../hooks/useSidebar'

export default function Layout() {
  const { collapsed, toggle, mobileOpen, openMobile, closeMobile, isMobile } = useSidebar()
  const offset = isMobile ? 0 : collapsed ? 72 : 260

  return (
    <div className="min-h-screen">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      {/* Desktop / tablet sidebar */}
      <div className="fixed inset-y-0 left-0 z-30 hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={toggle} />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobile}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              className="absolute inset-y-0 left-0"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar onNavigate={closeMobile} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div
        className="flex min-h-screen flex-col transition-[margin-left] duration-300 ease-in-out"
        style={{ marginLeft: offset }}
      >
        <Navbar onMenuClick={openMobile} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-6 sm:py-8">
          <Outlet />
        </main>
        <footer className="border-t border-gray-200/70 dark:border-gray-800/70 py-4 text-center text-xs text-gray-400">
          PlaceX — AI-Powered Placement Portal for Students
        </footer>
      </div>
    </div>
  )
}