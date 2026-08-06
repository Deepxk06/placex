import { create } from 'zustand'
import api from '../services/api'

const STORAGE_PREFIX = 'placex-profile-ext:'

export const DEFAULT_EXT = {
  skills: [],
  projects: [],
  certifications: [],
  socialLinks: {},
  experience: [],
  achievements: [],
  careerPrefs: {
    role: '',
    domain: '',
    location: '',
    expectedSalary: '',
    workType: 'on-site',
    immediateJoining: false,
    backlogs: 0,
  },
  passport: {},
  activity: [],
}

function extKey() {
  return `${STORAGE_PREFIX}${localStorage.getItem('placex_uid') || 'guest'}`
}

function cloneDeep(v) {
  return JSON.parse(JSON.stringify(v))
}

function loadExt() {
  try {
    const raw = localStorage.getItem(extKey())
    if (!raw) return cloneDeep(DEFAULT_EXT)
    return { ...cloneDeep(DEFAULT_EXT), ...JSON.parse(raw) }
  } catch {
    return cloneDeep(DEFAULT_EXT)
  }
}

function persistExt(ext) {
  try {
    localStorage.setItem(extKey(), JSON.stringify(ext))
  } catch {
    // storage full or unavailable — drop silently
  }
}

function stampId() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36)
}

function withActivity(ext, action, detail, section) {
  if (!action) return ext
  const item = {
    id: stampId(),
    section,
    activity: action,
    detail: detail || '',
    time: new Date().toISOString(),
  }
  return { ...ext, activity: [item, ...(ext.activity || [])].slice(0, 20) }
}

export const useProfileStore = create((set, get) => ({
  profile: null,
  loading: true,
  error: false,
  hasResume: false,
  ext: null,

  async fetchProfile() {
    set({ loading: true, error: false })
    try {
      const res = await api.get('/profile')
      set({ profile: res.data || null, ext: loadExt() })
      try {
        const resumes = await api.get('/resume')
        set({ hasResume: Array.isArray(resumes.data) && resumes.data.length > 0 })
      } catch {
        set({ hasResume: false })
      }
    } catch {
      set({ error: true })
    } finally {
      set({ loading: false })
    }
  },

  setProfile(profile) {
    set({ profile })
  },

  setHasResume(value) {
    set({ hasResume: !!value })
  },

  updateExt(mutate, action, detail, section) {
    set((s) => {
      if (!s.ext) return s
      const ext = cloneDeep(s.ext)
      mutate(ext)
      return { ext: withActivity(ext, action, detail, section) }
    })
    persistExt(get().ext)
  },

  addItem(section, item, detail) {
    get().updateExt(
      (ext) => {
        ext[section] = [{ id: stampId(), ...item }, ...ext[section]]
      },
      'added',
      detail,
      section
    )
  },

  updateItem(section, id, patch, detail) {
    get().updateExt(
      (ext) => {
        ext[section] = ext[section].map((it) => (it.id === id ? { ...it, ...patch } : it))
      },
      'updated',
      detail,
      section
    )
  },

  removeItem(section, id, detail) {
    get().updateExt(
      (ext) => {
        ext[section] = ext[section].filter((it) => it.id !== id)
      },
      'removed',
      detail,
      section
    )
  },

  moveItem(section, id, dir) {
    get().updateExt((ext) => {
      const list = ext[section]
      const i = list.findIndex((it) => it.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= list.length) return
      const [item] = list.splice(i, 1)
      list.splice(j, 0, item)
    }, 'updated', 'Reordered item', section)
  },

  saveField(key, value, detail) {
    get().updateExt((ext) => {
      ext[key] = value
    }, 'updated', detail, key)
  },
}))