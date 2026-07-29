import { useState } from 'react'

export default function PersonalInfo({ data, onChange }) {
  const [profileImage, setProfileImage] = useState(null)

  const handleChange = (field, value) => {
    onChange('personalInfo', { ...data, [field]: value })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfileImage(event.target.result)
        handleChange('profileImage', event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl text-gray-400">{(data?.fullName || '?')[0]}</span>
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-primary-500 text-white rounded-full p-1 cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <svg size={12} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </label>
        </div>
        <div>
          <h3 className="font-semibold text-lg">{data?.fullName || 'Your Name'}</h3>
          <p className="text-sm text-gray-500">{data?.targetRole || 'Target Role'}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><label className="block text-xs text-gray-500 mb-1">Full Name *</label><input className="input-field" placeholder="John Doe" value={data?.fullName || ''} onChange={e => handleChange('fullName', e.target.value)} /></div>
        <div><label className="block text-xs text-gray-500 mb-1">Email *</label><input className="input-field" placeholder="john@example.com" value={data?.email || ''} onChange={e => handleChange('email', e.target.value)} /></div>
        <div><label className="block text-xs text-gray-500 mb-1">Phone</label><input className="input-field" placeholder="+1 234 567 890" value={data?.phone || ''} onChange={e => handleChange('phone', e.target.value)} /></div>
        <div><label className="block text-xs text-gray-500 mb-1">Target Role *</label><input className="input-field" placeholder="Software Engineer" value={data?.targetRole || ''} onChange={e => handleChange('targetRole', e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div><label className="block text-xs text-gray-500 mb-1">LinkedIn URL</label><input className="input-field" placeholder="https://linkedin.com/in/..." value={data?.linkedIn || ''} onChange={e => handleChange('linkedIn', e.target.value)} /></div>
        <div><label className="block text-xs text-gray-500 mb-1">GitHub URL</label><input className="input-field" placeholder="https://github.com/..." value={data?.github || ''} onChange={e => handleChange('github', e.target.value)} /></div>
        <div><label className="block text-xs text-gray-500 mb-1">Portfolio URL</label><input className="input-field" placeholder="https://..." value={data?.portfolio || ''} onChange={e => handleChange('portfolio', e.target.value)} /></div>
      </div>
      <div><label className="block text-xs text-gray-500 mb-1">Professional Summary *</label><textarea className="input-field" rows={3} placeholder="Write a 2-3 line professional summary..." value={data?.summary || ''} onChange={e => handleChange('summary', e.target.value)} /></div>
    </div>
  )
}
