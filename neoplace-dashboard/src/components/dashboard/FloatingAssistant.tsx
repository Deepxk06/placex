import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, X, Send, Bot, User, Mic } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { AssistantMessage } from '../../types'
import { cn } from '../../utils/cn'

const capabilities = [
  'Analyze Resume',
  'Career Guidance',
  'Generate Interview Questions',
  'Placement Queries',
  'Suggest Courses',
  'Resume Review',
  'Roadmap Generator',
]

const responses: Record<string, string> = {
  resume: 'I can review your resume. Key gaps I found: 3 missing keywords (Kubernetes, CI/CD, Microservices) and no certifications section. Add a "Certifications" section and quantify your project impact with numbers.',
  career: 'Based on your profile (CGPA 8.6, strong Java/Python, 6 projects), you are best aligned with Software Engineer roles. Focus next on System Design basics and cloud fundamentals to expand your options.',
  interview: 'Here are 3 likely interview questions for your target role: 1) Explain how you would design a URL shortener. 2) Difference between REST and GraphQL. 3) How do you handle conflicting deadlines? Practice with the STAR method.',
  placement: 'Your placement probability is 84%. Completing Docker + AWS could raise it to 92% and unlock 6 more companies (Amazon, Google eligibility at 90%+).',
  course: 'Recommended next courses: 1) Docker Mastery (Udemy) 2) AWS Cloud Practitioner (freeCodeCamp) 3) System Design Primer (GitHub) — total ~40 hours.',
  roadmap: 'Your 4-month roadmap is ready: Month 1: DSA + SQL · Month 2: Docker/AWS + 2 projects · Month 3: System Design + mock interviews · Month 4: Applications + final prep.',
}

function getResponse(input: string) {
  const lower = input.toLowerCase()
  if (lower.includes('resume')) return responses.resume
  if (lower.includes('interview')) return responses.interview
  if (lower.includes('course') || lower.includes('learn')) return responses.course
  if (lower.includes('roadmap')) return responses.roadmap
  if (lower.includes('placement') || lower.includes('probability') || lower.includes('job')) return responses.placement
  if (lower.includes('career') || lower.includes('guidance')) return responses.career
  return 'I can help with resume analysis, career guidance, interview prep, placement queries, courses, and roadmap generation. Try asking about your resume or placement probability!'
}

const initialMessages: AssistantMessage[] = [
  {
    id: 'm0',
    role: 'ai',
    text: 'Hi Deepak! I\'m Neo, your AI career assistant. Ask me anything about your placements, resume, or interview prep. 🚀',
  },
]

export default function FloatingAssistant({
  open,
  onToggle,
}: {
  open: boolean
  onToggle: (open: boolean) => void
}) {
  const [messages, setMessages] = useState<AssistantMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  const send = (text: string) => {
    const clean = text.trim()
    if (!clean || typing) return
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: 'user', text: clean }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setMessages((m) => [...m, { id: `a${Date.now()}`, role: 'ai', text: getResponse(clean) }])
      setTyping(false)
    }, 900)
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => onToggle(!open)}
        aria-label="Toggle AI assistant"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 via-violet-600 to-purple-600 text-white shadow-glass animate-pulse-ring"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {open ? <X size={22} /> : <Sparkles size={22} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 flex h-[560px] max-h-[calc(100vh-120px)] w-[calc(100vw-48px)] max-w-sm flex-col overflow-hidden rounded-2xl glass shadow-soft-lg"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-200/70 dark:border-slate-800/70 bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-3 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <Bot size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Neo AI Assistant</p>
                <p className="flex items-center gap-1.5 text-[10px] text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" /> Online · Instant answers
                </p>
              </div>
              <button onClick={() => onToggle(false)} aria-label="Close assistant" className="rounded-lg p-1.5 hover:bg-white/15 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn('flex items-start gap-2', m.role === 'user' && 'flex-row-reverse')}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                      m.role === 'ai'
                        ? 'bg-gradient-to-br from-brand-600 to-violet-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    )}
                  >
                    {m.role === 'ai' ? <Bot size={13} /> : <User size={13} />}
                  </span>
                  <p
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed',
                      m.role === 'ai'
                        ? 'bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 rounded-tl-sm'
                        : 'bg-gradient-to-r from-brand-600 to-violet-600 text-white rounded-tr-sm'
                    )}
                  >
                    {m.text}
                  </p>
                </motion.div>
              ))}
              {typing && (
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-violet-600 text-white">
                    <Bot size={13} />
                  </span>
                  <div className="flex gap-1 rounded-2xl rounded-tl-sm bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 px-3.5 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                        className="h-1.5 w-1.5 rounded-full bg-slate-400"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Capabilities */}
            <div className="flex gap-1.5 overflow-x-auto px-3 pb-2 pt-1">
              {capabilities.map((c) => (
                <button
                  key={c}
                  onClick={() => send(c)}
                  className="shrink-0 rounded-full border border-brand-500/30 bg-brand-500/5 px-2.5 py-1 text-[10px] font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-500/15 transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="flex items-center gap-2 border-t border-slate-200/70 dark:border-slate-800/70 p-3"
            >
              <button type="button" aria-label="Voice input" className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Mic size={16} />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Neo anything…"
                className="flex-1 rounded-xl border border-transparent bg-slate-100 dark:bg-slate-800/70 px-3 py-2.5 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/60 transition"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!input.trim() || typing}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-glass disabled:opacity-40 transition"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
