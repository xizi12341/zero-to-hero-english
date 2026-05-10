const WATCH_KEY = 'en_daily_watch_time'
const GOAL_KEY = 'en_daily_watch_goal'

export function getToday() {
  return new Date().toISOString().slice(0, 10)
}

export function loadWatchTime() {
  try {
    return JSON.parse(localStorage.getItem(WATCH_KEY) || '{}')
  } catch {
    return {}
  }
}

export function saveWatchTime(data) {
  try {
    localStorage.setItem(WATCH_KEY, JSON.stringify(data))
  } catch { /* quota */ }
}

export function addWatchSeconds(seconds) {
  if (seconds <= 0) return
  const data = loadWatchTime()
  const today = getToday()
  data[today] = (data[today] || 0) + Math.round(seconds)
  saveWatchTime(data)
  return data
}

export function getTodayWatchSeconds() {
  const data = loadWatchTime()
  return data[getToday()] || 0
}

export function getTodayWatchMinutes() {
  return Math.floor(getTodayWatchSeconds() / 60)
}

export function loadWatchGoal() {
  try {
    const v = localStorage.getItem(GOAL_KEY)
    return v ? parseInt(v, 10) : 15
  } catch {
    return 15
  }
}

export function saveWatchGoal(minutes) {
  try {
    localStorage.setItem(GOAL_KEY, String(minutes))
  } catch { /* quota */ }
}

export function getWatchGoalPercent() {
  const goal = loadWatchGoal()
  if (goal <= 0) return 0
  return Math.min(100, (getTodayWatchMinutes() / goal) * 100)
}
