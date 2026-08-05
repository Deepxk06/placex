import type { ReactNode } from 'react'
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopNavbar } from './TopNavbar'

export default function Layout({
  children,
  assistantOpen,
  onToggleAssistant,
}: {
  children: ReactNode
  assistantOpen: boolean
  onToggleAssistant: (open: boolean) => void
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar
            onOpenSidebar={() => setSidebarOpen(true)}
            onOpenAssistant={() => onToggleAssistant(!assistantOpen)}
          />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-6 sm:py-8">{children}</main>
          <footer className="border-t border-slate-200/70 dark:border-slate-800/70 py-4 text-center text-xs text-slate-400">
            NeoPlace — AI-Powered Placement &amp; Career Assistant · Final Year Project
          </footer>
        </div>
      </div>
    </div>
  )
}
