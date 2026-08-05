import { Building2, Send } from 'lucide-react'
import { companiesEligibility } from '../../data/mockData'
import { Card, CardHeader } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { AnimatedNumber } from '../ui/AnimatedNumber'

export default function CompanyEligibility() {
  return (
    <Card id="companies" hover>
      <CardHeader
        title="Company Eligibility"
        subtitle="Companies you qualify for based on CGPA & skills"
        action={<Building2 size={18} className="text-brand-500" />}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {companiesEligibility.map((company) => (
          <div
            key={company.id}
            className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-4 hover:border-brand-500/40 hover:shadow-soft transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white text-sm font-extrabold ${company.color}`}>
                  {company.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{company.name}</p>
                  <p className="text-[11px] text-slate-400">CGPA ≥ {company.requiredCgpa}</p>
                </div>
              </div>
              {company.eligible ? (
                <Badge tone="success">Eligible</Badge>
              ) : (
                <Badge tone="danger">Not Eligible</Badge>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
              <span className="text-xs font-semibold text-slate-500">Profile Match</span>
              <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400">
                <AnimatedNumber value={company.match} suffix="%" />
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Required Skills</p>
                <div className="flex flex-wrap gap-1">
                  {company.requiredSkills.map((s) => (
                    <span key={s} className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
              {company.missingSkills.length > 0 && (
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Missing</p>
                  <div className="flex flex-wrap gap-1">
                    {company.missingSkills.map((s) => (
                      <span key={s} className="rounded-md bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-500">
                        ✗ {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              size="sm"
              className="mt-4 w-full"
              variant={company.eligible ? 'primary' : 'secondary'}
              disabled={!company.eligible}
            >
              <Send size={13} /> {company.eligible ? 'Apply' : 'Locked — Improve Profile'}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
