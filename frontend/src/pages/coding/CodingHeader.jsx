import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck,
  History, ExternalLink, Tag, Building2
} from 'lucide-react'

const difficultyColors = {
  easy: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  hard: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
}

export default function CodingHeader({
  problem, language, languages, onLanguageChange,
  onBookmark, onShowSubmissions, onBack, nextProblem, prevProblem, onNavigate
}) {
  return (
    <div className="h-12 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center px-4 gap-4 flex-shrink-0">
      <button onClick={onBack} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
        <ArrowLeft size={18} />
      </button>

      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
          {problem.title}
        </h1>
        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${difficultyColors[problem.difficulty] || ''}`}>
          {problem.difficulty}
        </span>
      </div>

      <div className="flex items-center gap-1 ml-2">
        {(problem.topics || []).slice(0, 2).map(t => (
          <span key={t} className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded capitalize">
            {t.replace(/-/g, ' ')}
          </span>
        ))}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button
          onClick={onBookmark}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={problem.bookmarked ? 'Remove bookmark' : 'Bookmark problem'}
        >
          {problem.bookmarked ? (
            <BookmarkCheck size={16} className="text-primary-500" />
          ) : (
            <Bookmark size={16} className="text-gray-400" />
          )}
        </button>

        <button
          onClick={onShowSubmissions}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="View submissions"
        >
          <History size={16} className="text-gray-400" />
        </button>

        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded px-2 py-1 border-0 outline-none cursor-pointer"
        >
          {languages.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>

        <div className="flex items-center gap-0.5 ml-2">
          <button
            onClick={() => prevProblem && onNavigate(prevProblem.id)}
            disabled={!prevProblem}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous problem"
          >
            <ChevronLeft size={16} className="text-gray-500" />
          </button>
          <button
            onClick={() => nextProblem && onNavigate(nextProblem.id)}
            disabled={!nextProblem}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next problem"
          >
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  )
}
