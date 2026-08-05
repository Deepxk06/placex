import { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '../../utils/helpers'

const ToastContext = createContext(null)

const STYLES = {
  success: { icon: CheckCircle2, wrap: 'bg-green-600' },
  error: { icon: AlertCircle, wrap: 'bg-red-600' },
  info: { icon: Info, wrap: 'bg-gray-800' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(({ type = 'success', message, duration = 3500 }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts((prev) => [...prev.slice(-3), { id, type, message }])
    setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const { icon: Icon, wrap } = STYLES[t.type] || STYLES.info
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.2 }}
                className={cn('flex items-center gap-3 pl-3 pr-2 py-2.5 rounded-xl text-white shadow-lg max-w-sm', wrap)}
                role="status"
              >
                <Icon size={18} className="shrink-0" />
                <span className="text-sm">{t.message}</span>
                <button onClick={() => dismiss(t.id)} className="p-1 rounded hover:bg-white/20 ml-1" aria-label="Dismiss">
                  <X size={14} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
