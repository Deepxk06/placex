import { useState, useEffect } from 'react';
import { Building2, Filter, BookOpen, Code, Brain, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

const difficultyColors = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const typeColors = {
  mcq: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  coding: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

export default function CompanyQuestions() {
  const [questions, setQuestions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [topics, setTopics] = useState([]);
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem('cq-bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedAnswer, setSelectedAnswer] = useState({});
  const [showExplanation, setShowExplanation] = useState({});
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, byCompany: {} });

  const [filters, setFilters] = useState({
    company: '',
    topic: '',
    year: '',
    difficulty: '',
  });

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  useEffect(() => {
    localStorage.setItem('cq-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  async function fetchFilters() {
    try {
      const [companyRes, topicRes] = await Promise.all([
        api.get('/company-questions/companies/list'),
        api.get('/company-questions/topics/list'),
      ]);
      setCompanies(Array.isArray(companyRes.data) ? companyRes.data : companyRes.data.companies || []);
      setTopics(Array.isArray(topicRes.data) ? topicRes.data : topicRes.data.topics || []);
    } catch (err) {
      console.error('Failed to load filters', err);
    }
  }

  async function fetchQuestions() {
    setLoading(true);
    try {
      const params = {};
      if (filters.company) params.company = filters.company;
      if (filters.topic) params.topic = filters.topic;
      if (filters.year) params.year = filters.year;
      if (filters.difficulty) params.difficulty = filters.difficulty;

      const res = await api.get('/company-questions/', { params });
      const data = res.data;
      const list = Array.isArray(data) ? data : data.results || [];
      setQuestions(list);

      const byCompany = {};
      list.forEach((q) => {
        const name = q.company_name || q.company || 'Unknown';
        byCompany[name] = (byCompany[name] || 0) + 1;
      });
      setStats({ total: list.length, byCompany });
    } catch (err) {
      console.error('Failed to load questions', err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function toggleBookmark(id) {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  }

  function handleAnswer(questionId, optionIndex) {
    if (selectedAnswer[questionId] !== undefined) return;
    setSelectedAnswer((prev) => ({ ...prev, [questionId]: optionIndex }));
    setShowExplanation((prev) => ({ ...prev, [questionId]: true }));
  }

  function toggleExpand(id) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Company Questions
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Previous year questions from top companies
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
              <BookOpen className="w-4 h-4" />
              Total Questions
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          {Object.entries(stats.byCompany)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([company, count]) => (
              <div key={company} className="card p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                  <Building2 className="w-4 h-4" />
                  {company}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
              </div>
            ))}
        </div>

        {/* Filter Bar */}
        <div className="card p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter Questions
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              className="input-field"
              value={filters.company}
              onChange={(e) => handleFilterChange('company', e.target.value)}
            >
              <option value="">All Companies</option>
              {companies.map((c) => (
                <option key={c.id || c} value={c.id || c}>
                  {c.name || c}
                </option>
              ))}
            </select>

            <select
              className="input-field"
              value={filters.topic}
              onChange={(e) => handleFilterChange('topic', e.target.value)}
            >
              <option value="">All Topics</option>
              {topics.map((t) => (
                <option key={t.id || t} value={t.id || t}>
                  {t.name || t}
                </option>
              ))}
            </select>

            <select
              className="input-field"
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
            >
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <select
              className="input-field"
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400" />
          </div>
        ) : questions.length === 0 ? (
          <div className="card p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No questions found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => {
              const id = q.id;
              const isBookmarked = bookmarks.includes(id);
              const isExpanded = expanded[id];
              const isMCQ = q.question_type === 'mcq';
              const answered = selectedAnswer[id] !== undefined;
              const isCorrect = answered && Number(selectedAnswer[id]) === Number(q.correct_answer);

              return (
                <div key={id} className="card p-5 transition-all hover:shadow-lg">
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Building2 className="w-3.5 h-3.5" />
                        {q.company_name || q.company}
                      </span>
                      {q.year && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {q.year}
                        </span>
                      )}
                      {q.role && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                          {q.role}
                        </span>
                      )}
                      {q.round && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                          {q.round}
                        </span>
                      )}
                      {q.topic && (
                        <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">
                          {q.topic_name || q.topic}
                        </span>
                      )}
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          difficultyColors[q.difficulty] || difficultyColors.easy
                        }`}
                      >
                        {q.difficulty}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          typeColors[q.question_type] || typeColors.mcq
                        }`}
                      >
                        {isMCQ ? 'MCQ' : 'Coding'}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleBookmark(id)}
                      className="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                    >
                      <svg
                        className={`w-5 h-5 ${
                          isBookmarked
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  </div>

                  {/* Question Text */}
                  <p
                    className="text-gray-800 dark:text-gray-200 mb-4 leading-relaxed cursor-pointer"
                    onClick={() => toggleExpand(id)}
                  >
                    {q.question_text}
                  </p>

                  {/* MCQ Options */}
                  {isMCQ && q.options && (
                    <div className="space-y-2 mb-4">
                      {(Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]')).map(
                        (option, idx) => {
                          const optionText = typeof option === 'string' ? option : option.text || option;
                          const isSelected = selectedAnswer[id] === idx;
                          const showResult = answered;
                          const optionIsCorrect = Number(q.correct_answer) === idx;

                          let optionClass =
                            'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800';
                          if (showResult) {
                            if (optionIsCorrect) {
                              optionClass = 'border-green-500 bg-green-50 dark:bg-green-900/20';
                            } else if (isSelected && !optionIsCorrect) {
                              optionClass = 'border-red-500 bg-red-50 dark:bg-red-900/20';
                            } else {
                              optionClass = 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60';
                            }
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => handleAnswer(id, idx)}
                              disabled={answered}
                              className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${optionClass} ${
                                !answered ? 'hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer' : 'cursor-default'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-gray-400 dark:text-gray-500 w-5">
                                  {String.fromCharCode(65 + idx)}.
                                </span>
                                <span className="text-gray-700 dark:text-gray-300">{optionText}</span>
                                {showResult && optionIsCorrect && (
                                  <CheckCircle className="w-4 h-4 text-green-500 ml-auto shrink-0" />
                                )}
                                {showResult && isSelected && !optionIsCorrect && (
                                  <XCircle className="w-4 h-4 text-red-500 ml-auto shrink-0" />
                                )}
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  )}

                  {/* Coding Question Indicator */}
                  {!isMCQ && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 mb-4">
                      <Code className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                      <span className="text-sm text-purple-700 dark:text-purple-300">
                        Coding problem — solve this in your preferred language
                      </span>
                    </div>
                  )}

                  {/* Explanation */}
                  {showExplanation[id] && isMCQ && q.explanation && (
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          {isCorrect ? 'Correct!' : 'Incorrect'} — Explanation
                        </span>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
