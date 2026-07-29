import { useState, useRef, useEffect } from 'react'
import api from '../services/api'
import { Send, MessageCircle, Bot, User, Sparkles } from 'lucide-react'

export default function CareerCounsellor() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm PlaceX AI Career Counsellor. I can help you with resume tips, interview prep, career guidance, and more. What would you like to know?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEnd = useRef(null)

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const res = await api.post(`/chatbot/message?message=${encodeURIComponent(userMsg)}`)
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    'How can I improve my resume?',
    'Tips for technical interviews',
    'What skills should I learn?',
    'How to prepare for placements?',
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="text-primary-600" size={24} />
        <div>
          <h1 className="text-2xl font-bold">AI Career Counsellor</h1>
          <p className="text-sm text-gray-500">Powered by Groq AI — 24/7 Career Guidance</p>
        </div>
      </div>

      <div className="card h-[600px] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                  <div className="bg-primary-100 p-2 rounded-full"><Bot size={16} className="text-primary-600" /></div>
              )}
              <div className={`max-w-[75%] rounded-xl p-3 text-sm ${
                msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'
              }`}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="bg-gray-200 p-2 rounded-full"><User size={16} className="text-gray-600" /></div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="bg-primary-100 p-2 rounded-full"><Bot size={16} className="text-primary-600" /></div>
              <div className="bg-gray-100 rounded-xl p-3 text-sm text-gray-500">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatEnd} />
        </div>

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {quickActions.map((action, i) => (
              <button key={i} onClick={() => { setInput(action) }}
                className="badge bg-primary-50 text-primary-700 hover:bg-primary-100 cursor-pointer text-sm py-2">
                <Sparkles size={12} className="inline mr-1" />{action}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 border-t border-gray-100 pt-4">
          <input className="input-field flex-1" placeholder="Ask anything about your career..."
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
          <button onClick={sendMessage} disabled={!input.trim() || loading} className="btn-primary">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
