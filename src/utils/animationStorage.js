import defaultAnimations from '../data/defaultAnimations'

const STORAGE_KEY = 'en_animation_library'

function isFirstRun() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === null) return true
  try {
    const arr = JSON.parse(raw)
    return !Array.isArray(arr) || arr.length === 0
  } catch {
    return true
  }
}

function seedDefaults() {
  const defaults = defaultAnimations.map((d) => ({
    ...d,
    platform: detectPlatform(d.url),
    addedAt: new Date().toISOString(),
  }))
  saveAnimations(defaults)
  return defaults
}

export function loadAnimations() {
  try {
    if (isFirstRun()) return seedDefaults()
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return seedDefaults()
  }
}

export function saveAnimations(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch { /* quota */ }
}

export function addAnimation(list, { name, embedUrl, platform }) {
  const item = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name: name.trim(),
    embedUrl: embedUrl.trim(),
    platform,
    addedAt: new Date().toISOString(),
  }
  const updated = [item, ...list]
  saveAnimations(updated)
  return updated
}

export function removeAnimation(list, id) {
  const updated = list.filter((a) => a.id !== id)
  saveAnimations(updated)
  return updated
}

export function detectPlatform(url) {
  const u = url.toLowerCase()
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube'
  if (u.includes('bilibili.com') || u.includes('b23.tv')) return 'bilibili'
  return 'other'
}

export function getThumbnail(item) {
  if (item.platform === 'youtube') {
    const match = item.embedUrl.match(/(?:embed\/|watch\?v=|\/)([a-zA-Z0-9_-]{11})/)
    if (match) return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`
  }
  return null
}
