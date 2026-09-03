import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Clock, Users, ChevronRight, Medal, Star, Zap } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../store/authStore'
import { cn } from '../utils/helpers'

export default function ContestsPage() {
  const { user } = useAuth()
  const [contests, setContests] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('contests')

  useEffect(() => {
    Promise.all([
      api.get('/contests/').catch(() => ({ data: [] })),
      api.get('/contests/leaderboard/global').catch(() => ({ data: [] })),
    ]).then(([c, l]) => {
      setContests(c.data)
      setLeaderboard(l.data)
      setLoading(false)
    })
  }, [])

  async function registerContest(id) {
    try {
      await api.post(`/contests/register/${id}`)
      setContests((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_registered: true, participants: c.participants + 1 } : c))
      )
    } catch {}
  }

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    live: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    ended: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  }

  const diffColors = {
    easy: 'text-green-600',
    medium: 'text-amber-600',
    hard: 'text-rose-600',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="text-amber-500" size={28} />
            Contests & Leaderboards
          </h1>
          <p className="text-sm text-gray-500 mt-1">Compete, earn XP, and climb the ranks</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'contests', label: 'Contests', icon: Trophy },
          { key: 'leaderboard', label: 'Leaderboard', icon: Medal },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              tab === t.key
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : tab === 'contests' ? (
        <div className="grid gap-4 md:grid-cols-2">
          {contests.length === 0 ? (
            <div className="col-span-2 text-center py-16 text-gray-400">
              <Trophy size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No contests yet. Check back soon!</p>
            </div>
          ) : (
            contests.map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-800/70 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{c.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description}</p>
                  </div>
                  <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase', statusColors[c.status])}>
                    {c.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> {c.duration_minutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={13} /> {c.participants} joined
                  </span>
                  <span className={cn('font-medium', diffColors[c.difficulty])}>{c.difficulty}</span>
                  {c.prize && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <Zap size={13} /> {c.prize}
                    </span>
                  )}
                </div>

                {c.problem_ids?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {c.problem_ids.map((pid, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-500 font-mono">
                        P{i + 1}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  {c.start_time && (
                    <p className="text-[10px] text-gray-400">
                      {c.status === 'upcoming'
                        ? `Starts ${new Date(c.start_time).toLocaleDateString()}`
                        : c.status === 'live'
                        ? `Ends ${new Date(c.end_time).toLocaleString()}`
                        : `Ended ${new Date(c.end_time).toLocaleDateString()}`}
                    </p>
                  )}
                  {c.status === 'upcoming' && !c.is_registered && (
                    <button
                      onClick={() => registerContest(c.id)}
                      className="px-4 py-1.5 rounded-xl bg-primary-600 text-white text-xs font-bold hover:bg-primary-700 transition-colors"
                    >
                      Register
                    </button>
                  )}
                  {c.is_registered && (
                    <span className="px-3 py-1 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold">
                      Registered
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-800/70 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/70 dark:border-gray-800/70">
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Rank</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">User</th>
                <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase">Score</th>
                <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase">Submissions</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-400 text-sm">
                    No submissions yet. Be the first!
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry, i) => (
                  <tr
                    key={entry.user_id}
                    className={cn(
                      'border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors',
                      entry.user_id === user?.uid && 'bg-primary-50/50 dark:bg-primary-900/10'
                    )}
                  >
                    <td className="px-6 py-3">
                      <span className={cn(
                        'inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                        i === 0 ? 'bg-yellow-100 text-yellow-700' :
                        i === 1 ? 'bg-gray-100 text-gray-600' :
                        i === 2 ? 'bg-orange-100 text-orange-700' :
                        'text-gray-500'
                      )}>
                        {i < 3 ? ['🥇', '🥈', '🥉'][i] : entry.rank}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {entry.user_id.replace(/_/g, ' ').replace(/@/g, '')}
                        {entry.user_id === user?.uid && <span className="ml-1 text-[10px] text-primary-600">(you)</span>}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{entry.total_score}</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="text-xs text-gray-500">{entry.total_submissions}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
