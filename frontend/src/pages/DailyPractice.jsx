import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Zap, Target, Calendar, CheckCircle2, Code2, Brain, Award, ChevronRight, Star } from 'lucide-react'
import api from '../services/api'
import { cn } from '../utils/helpers'

export default function DailyPractice() {
  const [daily, setDaily] = useState(null)
  const [streak, setStreak] = useState(null)
  const [calendar, setCalendar] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/daily-practice/daily').catch(() => ({ data: null })),
      api.get('/daily-practice/streak').catch(() => ({ data: null })),
      api.get('/daily-practice/calendar').catch(() => ({ data: { practice_dates: [] } })),
    ]).then(([d, s, c]) => {
      setDaily(d.data)
      setStreak(s.data)
      setCalendar(c.data.practice_dates || [])
      setLoading(false)
    })
  }, [])

  async function completeItem(type, id) {
    try {
      await api.post('/daily-practice/complete', { type, id })
      setDaily((prev) => {
        if (!prev) return prev
        const key = `completed_${type}`
        const done = prev[key] || []
        if (done.includes(id)) return prev
        return { ...prev, [key]: [...done, id] }
      })
      const sRes = await api.get('/daily-practice/streak').catch(() => ({ data: null }))
      setStreak(sRes.data)
    } catch {}
  }

  const progressPct = daily?.progress?.pct || 0
  const totalDone = daily?.progress?.completed || 0
  const totalItems = daily?.progress?.total || 0

  const level = streak?.level || 1
  const xp = streak?.xp || 0
  const xpForNext = level * 100
  const xpProgress = ((xp % 100) / 100) * 100

  const badgeConfig = {
    '7_day_streak': { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20', label: '7-Day Streak' },
    '30_day_streak': { icon: Flame, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20', label: '30-Day Streak' },
    'centurion': { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/20', label: 'Centurion (100 days)' },
  }

  function generateCalendarDays() {
    const today = new Date()
    const days = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      days.push({ date: dateStr, practiced: calendar.includes(dateStr), isToday: i === 0 })
    }
    return days
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <Target className="text-primary-600" size={28} />
          Daily Practice
        </h1>
        <p className="text-sm text-gray-500 mt-1">Complete today's challenges and maintain your streak</p>
      </div>

      {/* Streak + XP + Calendar */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Streak Card */}
        <div className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={20} />
            <span className="text-sm font-bold">Current Streak</span>
          </div>
          <p className="text-4xl font-extrabold">{streak?.current_streak || 0} <span className="text-lg font-medium">days</span></p>
          <p className="text-xs opacity-80 mt-1">Best: {streak?.longest_streak || 0} days</p>
        </div>

        {/* XP Card */}
        <div className="bg-gradient-to-br from-primary-600 to-sky-500 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={20} />
            <span className="text-sm font-bold">Level {level}</span>
          </div>
          <p className="text-4xl font-extrabold">{xp} <span className="text-lg font-medium">XP</span></p>
          <div className="mt-2 h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${xpProgress}%` }} />
          </div>
          <p className="text-[10px] opacity-80 mt-1">{100 - (xp % 100)} XP to next level</p>
        </div>

        {/* Progress Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-800/70 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target size={20} className="text-green-500" />
            <span className="text-sm font-bold text-gray-800 dark:text-white">Today's Progress</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{progressPct}%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{totalDone}/{totalItems} completed</p>
          <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* 30-Day Calendar Heatmap */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-800/70 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-gray-500" />
          <h2 className="text-sm font-bold text-gray-800 dark:text-white">30-Day Activity</h2>
        </div>
        <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5">
          {generateCalendarDays().map((day) => (
            <div
              key={day.date}
              className={cn(
                'aspect-square rounded-md transition-colors',
                day.practiced
                  ? 'bg-green-500'
                  : day.isToday
                  ? 'bg-primary-200 dark:bg-primary-800 ring-2 ring-primary-400'
                  : 'bg-gray-100 dark:bg-gray-800'
              )}
              title={day.date}
            />
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800" /> No practice</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500" /> Practiced</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary-400" /> Today</span>
        </div>
      </div>

      {/* Badges */}
      {streak?.badges?.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-800/70 p-5">
          <h2 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <Award size={18} className="text-amber-500" /> Badges Earned
          </h2>
          <div className="flex flex-wrap gap-2">
            {streak.badges.map((b) => {
              const config = badgeConfig[b]
              if (!config) return null
              return (
                <span key={b} className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold', config.bg, config.color)}>
                  <config.icon size={14} />
                  {config.label}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Daily Tasks */}
      {daily && (
        <div className="space-y-4">
          {/* Coding */}
          {daily.coding?.length > 0 && (
            <TaskSection
              title="Coding Problems"
              icon={Code2}
              color="text-blue-500"
              items={daily.coding}
              type="coding"
              onComplete={completeItem}
            />
          )}

          {/* Aptitude */}
          {daily.aptitude?.length > 0 && (
            <TaskSection
              title="Aptitude Questions"
              icon={Brain}
              color="text-purple-500"
              items={daily.aptitude}
              type="aptitude"
              onComplete={completeItem}
            />
          )}

          {/* MCQ */}
          {daily.mcq?.length > 0 && (
            <TaskSection
              title="Technical MCQs"
              icon={Award}
              color="text-green-500"
              items={daily.mcq}
              type="mcq"
              onComplete={completeItem}
            />
          )}
        </div>
      )}
    </div>
  )
}

function TaskSection({ title, icon: Icon, color, items, type, onComplete }) {
  const diffColors = {
    easy: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    hard: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-800/70 overflow-hidden">
      <div className="px-5 py-3 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800">
        <Icon size={18} className={color} />
        <h3 className="text-sm font-bold text-gray-800 dark:text-white">{title}</h3>
        <span className="ml-auto text-[10px] text-gray-400">
          {items.filter((i) => i.completed).length}/{items.length} done
        </span>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
            <button
              onClick={() => !item.completed && onComplete(type, item.id)}
              className={cn(
                'shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors',
                item.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
              )}
            >
              {item.completed && <CheckCircle2 size={14} />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-medium',
                item.completed ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-white'
              )}>
                {item.title || item.topic || `Problem #${item.id}`}
              </p>
            </div>
            <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase', diffColors[item.difficulty])}>
              {item.difficulty}
            </span>
            {!item.completed && (
              <Link
                to={type === 'coding' ? `/coding/problem/${item.id}` : `/skill-assessment?tab=${type}`}
                className="shrink-0 p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                <ChevronRight size={16} />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
