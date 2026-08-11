import { useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useProfileStore } from '../store/profileStore'
import ProfileHeader from '../components/profile/ProfileHeader'
import ProfileCompletion from '../components/profile/ProfileCompletion'
import BasicInfoSections from '../components/profile/BasicInfoSections'
import SkillsSection from '../components/profile/SkillsSection'
import ProjectsSection from '../components/profile/ProjectsSection'
import CertificationsSection from '../components/profile/CertificationsSection'
import ExperienceSection from '../components/profile/ExperienceSection'
import AchievementsSection from '../components/profile/AchievementsSection'
import SocialLinksSection from '../components/profile/SocialLinksSection'
import CareerPreferencesSection from '../components/profile/CareerPreferencesSection'
import EligibilitySection from '../components/profile/EligibilitySection'
import AIInsightsCard from '../components/profile/AIInsightsCard'
import RecentActivityTimeline from '../components/profile/RecentActivityTimeline'
import IdentityDocuments from '../components/profile/IdentityDocuments'
import StudentDigitalId from '../components/profile/StudentDigitalId'
import StudentIdCard from '../components/profile/StudentIdCard'
import SettingsCard from '../components/profile/SettingsCard'
import ProfileEditModal from '../components/profile/ProfileEditModal'

export default function ProfilePage() {
  const { profile, loading, error, hasFetched, setProfile, fetchProfile } = useProfileStore()
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    if (!profile && !loading && !error && !hasFetched) fetchProfile()
  }, [profile, loading, error, hasFetched, fetchProfile])

  if (loading) return <ProfileSkeleton />

  if (error) {
    return (
      <div className="max-w-3xl">
        <div className="card dark:bg-gray-900 dark:border-gray-800 flex flex-col items-center gap-4 py-14 text-center">
          <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600">
            <AlertTriangle size={26} />
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">Couldn't load your profile</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">The server may still be waking up. Please try again.</p>
          </div>
          <button onClick={() => fetchProfile()} className="btn-primary flex items-center gap-2">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-3xl">
        <div className="card flex flex-col items-center gap-4 py-14 text-center">
          <p className="font-medium text-gray-800 dark:text-white">No profile found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your profile is empty. Refresh to try loading it again.</p>
          <button onClick={fetchProfile} className="btn-primary flex items-center gap-2">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>
    )
  }

  const uid = sessionStorage.getItem('placex_uid')

  return (
    <div className="space-y-6">
      <div id="sec-profile" className="scroll-mt-24">
        <ProfileHeader profile={profile} onEdit={() => setEditOpen(true)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <ProfileCompletion />
          <BasicInfoSections profile={profile} />
          <SkillsSection />
          <ProjectsSection />
          <CertificationsSection />
          <ExperienceSection />
          <AchievementsSection />
          <CareerPreferencesSection />
          <EligibilitySection />
        </div>

        {/* Sidebar rail */}
        <div className="space-y-6">
          <div className="space-y-6 lg:sticky lg:top-20">
            <AIInsightsCard />
            <RecentActivityTimeline />
            <IdentityDocuments />
            <StudentDigitalId profile={profile} />
            <StudentIdCard profile={profile} user={{ ...profile.user, uid }} />
          </div>
        </div>
      </div>

      <SettingsCard settings={profile.settings} onUpdate={setProfile} />

      <ProfileEditModal open={editOpen} profile={profile} onClose={() => setEditOpen(false)} onSaved={setProfile} />
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="glass rounded-2xl p-8 shadow-soft flex flex-col lg:flex-row gap-6">
        <div className="h-28 w-28 shrink-0 self-center rounded-3xl bg-gray-200 dark:bg-gray-800" />
        <div className="flex-1 space-y-3">
          <div className="h-6 w-48 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-64 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-52 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-40 rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="h-24 w-24 shrink-0 self-center rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
        <div className="space-y-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    </div>
  )
}