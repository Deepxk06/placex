export default function ResumePreview({ sections }) {
  const data = {}
  sections.forEach(s => { data[s.name] = s.data })

  const personal = data.personalInfo || {}
  const education = data.education?.entries || []
  const skills = data.skills?.items || []
  const experience = data.experience?.entries || []
  const projects = data.projects?.entries || []
  const certifications = data.certifications?.entries || []
  const achievements = data.achievements?.items || []
  const languages = data.languages?.items || []

  return (
    <div id="resume-preview" className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: '1.4' }}>
      <div className="bg-gray-900 text-white p-4 text-center">
        <h2 className="text-lg font-bold">{personal.fullName || 'Your Name'}</h2>
        <p className="text-sm text-gray-300">{personal.targetRole || ''}</p>
        <div className="flex justify-center gap-3 mt-1 text-xs text-gray-400">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
        </div>
        <div className="flex justify-center gap-3 mt-0.5 text-xs text-blue-300">
          {personal.linkedIn && <a href={personal.linkedIn} target="_blank">LinkedIn</a>}
          {personal.github && <a href={personal.github} target="_blank">GitHub</a>}
          {personal.portfolio && <a href={personal.portfolio} target="_blank">Portfolio</a>}
        </div>
      </div>

      {personal.summary && (
        <div className="px-4 py-2 border-b border-gray-200">
          <h3 className="font-bold text-xs uppercase text-gray-500 mb-1">Summary</h3>
          <p className="text-xs text-gray-700">{personal.summary}</p>
        </div>
      )}

      {education.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200">
          <h3 className="font-bold text-xs uppercase text-gray-500 mb-1">Education</h3>
          {education.map((e, i) => (
            <div key={i} className="mb-1">
              <p className="font-medium text-xs">{e.degree}</p>
              <p className="text-xs text-gray-600">{e.institute}{e.year && ` • ${e.year}`}{e.gpa && ` | GPA: ${e.gpa}`}</p>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200">
          <h3 className="font-bold text-xs uppercase text-gray-500 mb-1">Skills</h3>
          <div className="flex flex-wrap gap-1">{skills.map((s, i) => (
            <span key={i} className="bg-gray-100 text-xs px-2 py-0.5 rounded">{s}</span>
          ))}</div>
        </div>
      )}

      {experience.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200">
          <h3 className="font-bold text-xs uppercase text-gray-500 mb-1">Experience</h3>
          {experience.map((e, i) => (
            <div key={i} className="mb-2">
              <p className="font-medium text-xs">{e.role} <span className="text-gray-500">at {e.company}</span></p>
              {e.duration && <p className="text-xs text-gray-400">{e.duration}</p>}
              {e.description && <p className="text-xs text-gray-600 mt-0.5">{e.description}</p>}
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200">
          <h3 className="font-bold text-xs uppercase text-gray-500 mb-1">Projects</h3>
          {projects.map((p, i) => (
            <div key={i} className="mb-2">
              <p className="font-medium text-xs">{p.title}</p>
              {p.description && <p className="text-xs text-gray-600">{p.description}</p>}
              {p.techStack?.length > 0 && <p className="text-xs text-gray-400 mt-0.5">{p.techStack.join(' | ')}</p>}
              {p.link && <a href={p.link} target="_blank" className="text-xs text-blue-500">{p.link}</a>}
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200">
          <h3 className="font-bold text-xs uppercase text-gray-500 mb-1">Certifications</h3>
          {certifications.map((c, i) => (
            <p key={i} className="text-xs">{c.name} — <span className="text-gray-500">{c.issuer}</span></p>
          ))}
        </div>
      )}

      {achievements.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200">
          <h3 className="font-bold text-xs uppercase text-gray-500 mb-1">Achievements</h3>
          {achievements.map((a, i) => (
            <p key={i} className="text-xs">• {a.text || a}</p>
          ))}
        </div>
      )}

      {languages.length > 0 && (
        <div className="px-4 py-2">
          <h3 className="font-bold text-xs uppercase text-gray-500 mb-1">Languages</h3>
          <div className="flex gap-2">{languages.map((l, i) => (
            <span key={i} className="text-xs">{l.language} <span className="text-gray-400">({l.level})</span></span>
          ))}</div>
        </div>
      )}
    </div>
  )
}
