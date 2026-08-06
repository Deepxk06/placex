import { User, Phone, GraduationCap, MapPin, School } from 'lucide-react'
import SectionCard from './SectionCard'
import { currentSemester } from './ProfileHeader'
import { cn } from '../../utils/helpers'

function ValueRow({ label, value, twoCol = false }) {
  return (
    <div className={cn(twoCol && 'col-span-2')}>
      <div className="text-xs text-gray-400 dark:text-gray-500">{label}</div>
      <div className="break-words text-sm text-gray-800 dark:text-gray-200">{value || '—'}</div>
    </div>
  )
}

export default function BasicInfoSections({ profile }) {
  if (!profile) return null
  const personal = profile.personal || {}
  const contact = profile.contact || {}
  const address = profile.address || {}
  const college = profile.college || {}
  const semNum = currentSemester(college.start_year)
  const showCountry = address.country && address.country.toLowerCase() !== 'india'

  return (
    <div id="sec-basic" className="grid grid-cols-1 gap-6 scroll-mt-24 lg:grid-cols-2">
      <SectionCard id="sec-basic" icon={User} title="Personal Information" subtitle="Identity and about you">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <ValueRow label="Date of Birth" value={personal.date_of_birth} />
          <ValueRow label="Gender" value={personal.gender} />
          {personal.bio && <ValueRow label="About / Bio" value={personal.bio} twoCol />}
        </div>
      </SectionCard>

      <SectionCard id="sec-contact" icon={Phone} title="Contact Information" subtitle="How recruiters reach you">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <ValueRow label="Phone" value={contact.phone} />
          <ValueRow label="Alternate Phone" value={contact.alternate_phone} />
          <ValueRow label="Personal Email" value={contact.personal_email} twoCol />
          {contact.website && <ValueRow label="Website" value={contact.website} twoCol />}
        </div>
      </SectionCard>

      <SectionCard id="sec-college" icon={GraduationCap} title="College Details" subtitle="Education & academics">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <ValueRow label="College Name" value={college.college_name} twoCol />
          <ValueRow label="Degree" value={college.degree} />
          <ValueRow label="Branch" value={college.branch} />
          <ValueRow label="CGPA" value={college.cgpa ? `${college.cgpa} / 10` : ''} />
          <ValueRow label="Current Semester" value={semNum ? `Semester ${semNum}` : ''} />
          <ValueRow label="Academic Year" value={college.start_year && college.end_year ? `${college.start_year} – ${college.end_year}` : ''} />
          <ValueRow label="Roll Number" value={college.roll_number} />
          <ValueRow label="Admission Number" value={college.admission_number} />
        </div>
      </SectionCard>

      <SectionCard id="sec-address" icon={MapPin} title="Address" subtitle="Communication address">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <ValueRow label="Address Line 1" value={address.address_line1} twoCol />
          {address.address_line2 && <ValueRow label="Address Line 2" value={address.address_line2} twoCol />}
          <ValueRow label="City" value={address.city} />
          <ValueRow label="District" value={address.district} />
          <ValueRow label="State" value={address.state} />
          <ValueRow label="PIN Code" value={address.pin_code} />
          {showCountry && <ValueRow label="Country" value={address.country} />}
        </div>
      </SectionCard>
    </div>
  )
}