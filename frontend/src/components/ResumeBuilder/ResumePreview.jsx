const TEMPLATE_THEMES = {
  classic: {
    headerClass: 'bg-gray-900 text-white',
    nameClass: 'text-lg font-bold text-white',
    roleClass: 'text-sm text-gray-300',
    headingClass: 'font-bold text-xs uppercase tracking-wide text-gray-600 border-b border-gray-300 pb-1 mb-1',
    accentText: 'text-gray-700',
    divider: 'border-gray-200',
  },
  modern: {
    headerClass: 'bg-blue-50 border-b-4 border-blue-600',
    nameClass: 'text-lg font-bold text-blue-800',
    roleClass: 'text-sm text-blue-600',
    headingClass: 'font-bold text-xs uppercase tracking-wide text-blue-700 border-b-2 border-blue-200 pb-1 mb-1',
    accentText: 'text-gray-800',
    divider: 'border-gray-200',
  },
  minimal: {
    headerClass: 'border-b border-gray-300',
    nameClass: 'text-base font-bold text-gray-900',
    roleClass: 'text-xs font-medium text-gray-500 uppercase tracking-widest',
    headingClass: 'font-bold text-[11px] uppercase tracking-widest text-gray-500 pb-1 mb-1',
    accentText: 'text-gray-700',
    divider: 'border-gray-100',
  },
  technical: {
    headerClass: 'bg-slate-900 text-white',
    nameClass: 'text-lg font-extrabold tracking-tight text-emerald-400',
    roleClass: 'text-sm font-mono text-gray-300',
    headingClass: 'font-mono font-bold text-xs uppercase tracking-wide text-emerald-700 border-b border-emerald-200 pb-1 mb-1',
    accentText: 'text-gray-800',
    divider: 'border-gray-200',
  },
}

const TemplateSection = ({ title, children, theme }) => (
  <div className={`px-5 py-3 border-b ${theme.divider}`}>
    <h3 className={theme.headingClass}>{title}</h3>
    {children}
  </div>
)

export default function ResumePreview({ sections, templateId = 'classic' }) {
  const theme = TEMPLATE_THEMES[templateId] || TEMPLATE_THEMES.classic
  const data = {}
  ;(sections || []).forEach(s => { data[s.name] = s.data })

  const personal = data.personalInfo || {}
  const education = data.education?.entries || []
  const skills = data.skills?.items || []
  const experience = data.experience?.entries || []
  const internships = data.internships?.entries || []
  const projects = data.projects?.entries || []
  const certifications = data.certifications?.entries || []
  const achievements = data.achievements?.items || []
  const languages = data.languages?.items || []
  const summary = data.summary?.text || ''

  const contactBits = [personal.email, personal.phone, personal.location].filter(Boolean)

  return (
    <div id="resume-preview" className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: '1.45' }}>
      <div className={`px-5 py-4 text-center ${theme.headerClass}`}>
        <h2 className={theme.nameClass}>{personal.fullName || 'Your Name'}</h2>
        {personal.targetRole && <p className={theme.roleClass}>{personal.targetRole}</p>}
        {contactBits.length > 0 && (
          <div className={`flex justify-center flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs ${templateId === 'minimal' ? 'text-gray-600' : 'text-gray-400'}`}>
            {contactBits.map((c, i) => <span key={i}>{c}</span>)}
          </div>
        )}
        {(personal.linkedIn || personal.github || personal.portfolio) && (
          <div className={`flex justify-center flex-wrap gap-x-3 mt-0.5 text-xs ${templateId === 'minimal' ? 'text-blue-700' : 'text-blue-300'}`}>
            {personal.linkedIn && <a href={personal.linkedIn} target="_blank" rel="noreferrer">LinkedIn</a>}
            {personal.github && <a href={personal.github} target="_blank" rel="noreferrer">GitHub</a>}
            {personal.portfolio && <a href={personal.portfolio} target="_blank" rel="noreferrer">Portfolio</a>}
          </div>
        )}
      </div>

      {(summary || personal.summary) && (
        <TemplateSection title="Summary" theme={theme}>
          <p className="text-xs text-gray-700">{summary || personal.summary}</p>
        </TemplateSection>
      )}

      {education.length > 0 && (
        <TemplateSection title="Education" theme={theme}>
          {education.map((e, i) => (
            <div key={i} className="mb-1.5 last:mb-0">
              <p className="font-medium text-xs">{[e.degree, e.branch].filter(Boolean).join(' | ')}</p>
              <p className="text-xs text-gray-600">{e.institute || e.location}{e.year && ` • ${e.year}`}{e.gpa && ` | CGPA: ${e.gpa}`}</p>
            </div>
          ))}
        </TemplateSection>
      )}

      {skills.length > 0 && (
        <TemplateSection title="Skills" theme={theme}>
          <div className="flex flex-wrap gap-1">
            {skills.map((s, i) => (
              <span key={`${s}-${i}`} className={`text-xs px-2 py-0.5 rounded ${templateId === 'technical' ? 'bg-emerald-50 text-emerald-800 font-mono' : 'bg-gray-100 text-gray-700'}`}>{s}</span>
            ))}
          </div>
        </TemplateSection>
      )}

      {experience.length > 0 && (
        <TemplateSection title="Experience" theme={theme}>
          {experience.map((e, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <div className="flex justify-between items-baseline">
                <p className="font-medium text-xs">{e.role || 'Role'} <span className="text-gray-500">{e.company ? `at ${e.company}` : ''}</span></p>
                {e.duration && <p className="text-[10px] text-gray-400">{e.duration}</p>}
              </div>
              {e.location && <p className="text-[10px] text-gray-400">{e.location}</p>}
              {e.description && <p className="text-xs text-gray-600 mt-0.5">{e.description}</p>}
              {e.technologies?.length > 0 && <p className="text-[10px] text-gray-400 mt-0.5">Technologies: {e.technologies.join(', ')}</p>}
            </div>
          ))}
        </TemplateSection>
      )}

      {internships.length > 0 && (
        <TemplateSection title="Internships" theme={theme}>
          {internships.map((e, i) => (
            <div key={i} className="mb-1.5 last:mb-0">
              <p className="font-medium text-xs">{e.role || 'Intern'} <span className="text-gray-500">{e.company ? `at ${e.company}` : ''}</span></p>
              {e.duration && <p className="text-[10px] text-gray-400">{e.duration}</p>}
              {e.description && <p className="text-xs text-gray-600">{e.description}</p>}
            </div>
          ))}
        </TemplateSection>
      )}

      {projects.length > 0 && (
        <TemplateSection title="Projects" theme={theme}>
          {projects.map((p, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <p className="font-medium text-xs">{p.title}</p>
              {p.description && <p className="text-xs text-gray-600">{p.description}</p>}
              {p.techStack?.length > 0 && <p className="text-[10px] text-gray-400 mt-0.5">{p.techStack.join(' | ')}</p>}
              {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="text-xs text-blue-500">{p.link}</a>}
            </div>
          ))}
        </TemplateSection>
      )}

      {certifications.length > 0 && (
        <TemplateSection title="Certifications" theme={theme}>
          {certifications.map((c, i) => (
            <p key={i} className="text-xs mb-0.5 last:mb-0">
              {[c.name, c.issuer, c.date].filter(Boolean).join(' — ')}
            </p>
          ))}
        </TemplateSection>
      )}

      {achievements.length > 0 && (
        <TemplateSection title="Achievements" theme={theme}>
          {achievements.map((a, i) => (
            <p key={i} className="text-xs mb-0.5 last:mb-0">• {typeof a === 'string' ? a : a.text || a.title}</p>
          ))}
        </TemplateSection>
      )}

      {languages.length > 0 && (
        <TemplateSection title="Languages" theme={theme}>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {languages.map((l, i) => (
              <span key={i} className="text-xs">{typeof l === 'string' ? l : `${l.language} (${l.level || 'Fluent'})`}</span>
            ))}
          </div>
        </TemplateSection>
      )}
    </div>
  )
}