const ScoreBar = ({ label, score, max = 100 }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs w-28 text-gray-600">{label}</span>
    <div className="flex-1 bg-gray-200 rounded-full h-2">
      <div className={`h-2 rounded-full transition-all duration-500 ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(score / max * 100, 100)}%` }} />
    </div>
    <span className="text-xs font-medium w-8 text-right">{score}</span>
  </div>
)

export default function ATSScore({ score }) {
  if (!score) return null
  const { overall, suggestions } = score

  const getGrade = (s) => s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Average' : 'Needs Improvement'
  const getColor = (s) => s >= 80 ? 'text-green-600' : s >= 60 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-center mb-4">
        <div className={`text-4xl font-bold ${getColor(overall)}`}>{overall}</div>
        <p className={`text-sm ${getColor(overall)}`}>{getGrade(overall)}</p>
        <p className="text-xs text-gray-400 mt-1">ATS Compatibility Score</p>
      </div>

      <div className="space-y-1.5">
        <ScoreBar label="Contact" score={score.contactScore} />
        <ScoreBar label="Skills" score={score.skillsScore} />
        <ScoreBar label="Education" score={score.educationScore} />
        <ScoreBar label="Projects" score={score.projectsScore} />
        <ScoreBar label="Experience" score={score.experienceScore} />
        <ScoreBar label="Achievements" score={score.achievementsScore} />
        <ScoreBar label="Length" score={score.lengthScore} />
        <ScoreBar label="Format" score={score.formatScore} />
        <ScoreBar label="Action Verbs" score={score.verbScore} />
        <ScoreBar label="Sections" score={score.sectionScore} />
        <ScoreBar label="Keywords" score={score.keywordScore} />
      </div>

      {suggestions?.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Suggestions</h4>
          <ul className="space-y-1">{suggestions.map((s, i) => (
            <li key={i} className="text-xs text-gray-600 flex gap-1">
              <span className="text-primary-500 mt-0.5">•</span>
              <span>{s}</span>
            </li>
          ))}</ul>
        </div>
      )}
    </div>
  )
}
