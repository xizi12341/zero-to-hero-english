import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getTodayWatchMinutes, getWatchGoalPercent, loadWatchGoal, getTodayWatchSeconds } from '../utils/watchTimeTracker'

const SNAPSHOT_KEY = 'en_daily-snapshot'
const ACTIVITY_LOG_KEY = 'en_activity-log'

const MINUTES_PER_UNIT = {
  phonetic: 1,
  flashcard: 0.5,
  shadowing: 3,
  grammar: 1.5,
  dictation: 5,
  watch: 1,
}

const DAILY_TASKS = [
  {
    id: 'phonetic', icon: '🔊', label: '复习音标', target: 5, unit: '个',
    link: '/phonetic', storageKey: 'en_ipa-learned',
    getCount: (data) => (Array.isArray(data) ? data.length : 0),
  },
  {
    id: 'flashcard', icon: '📖', label: '学习单词', target: 10, unit: '个',
    link: '/flashcard', storageKey: 'en_flashcard-records',
    getCount: (data) => {
      if (!data || typeof data !== 'object') return 0
      return Object.values(data).filter((r) => r && r.box >= 1).length
    },
  },
  {
    id: 'shadowing', icon: '🎙️', label: '跟读练习', target: 1, unit: '次',
    link: '/speak', storageKey: 'en_shadowing-stats',
    getCount: (data) => (data?.count || 0),
  },
  {
    id: 'grammar', icon: '📝', label: '语法练习', target: 3, unit: '题',
    link: '/grammar', storageKey: 'en_grammar-scores',
    getCount: (data) => (Array.isArray(data) ? data.length : 0),
  },
  {
    id: 'dictation', icon: '✏️', label: '听写练习', target: 1, unit: '次',
    link: '/immersion', storageKey: 'en_dictation-scores',
    getCount: (data) => (Array.isArray(data) ? data.length : 0),
  },
  {
    id: 'watch', icon: '🎬', label: '动画浸泡', target: 1, unit: '次',
    link: '/immersion', storageKey: 'en_daily_watch_time',
    getCount: (data) => {
      if (!data || typeof data !== 'object') return 0
      const today = new Date().toISOString().slice(0, 10)
      return data[today] && data[today] >= 60 ? 1 : 0
    },
  },
]

const QUICK_LINKS = [
  { icon: '🔊', label: '音标', desc: '48个音标', link: '/phonetic', color: 'bg-blue-50 text-blue-600' },
  { icon: '📖', label: '闪卡', desc: '核心单词', link: '/flashcard', color: 'bg-emerald-50 text-emerald-600' },
  { icon: '🎧', label: '沉浸', desc: '听写儿歌', link: '/immersion', color: 'bg-purple-50 text-purple-600' },
  { icon: '🎙️', label: '口语', desc: '跟读对话', link: '/speak', color: 'bg-amber-50 text-amber-600' },
  { icon: '📝', label: '语法', desc: '时态练习', link: '/grammar', color: 'bg-rose-50 text-rose-600' },
]

function loadFromStorage(key) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null } catch { return null }
}

function saveToStorage(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch { /* quota */ }
}

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

/* ── Sub-components ──────────────────────────────────────── */

function CircularRing({ percent, size = 72, strokeWidth = 5 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference
  const color = percent >= 80 ? '#10b981' : percent >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <span className="absolute text-sm font-bold text-slate-700">{Math.round(percent)}%</span>
    </div>
  )
}

function Heatmap({ data, maxMinutes }) {
  const today = getToday()
  const peak = Math.max(maxMinutes, 10)

  return (
    <div className="flex items-end gap-1.5">
      {data.map((day) => {
        const ratio = day.minutes / peak
        const height = day.minutes > 0 ? Math.max(6, ratio * 44) : 4
        const isToday = day.date === today

        let bg
        if (day.minutes === 0) bg = '#f1f5f9'
        else if (ratio < 0.25) bg = '#FFF0EB'
        else if (ratio < 0.5) bg = '#FFC4AD'
        else if (ratio < 0.75) bg = '#FFA07A'
        else bg = '#FF8C69'

        return (
          <div key={day.date} className="flex flex-col items-center gap-1">
            <div
              className="w-7 rounded-md transition-all"
              style={{
                height: `${height}px`,
                backgroundColor: bg,
                boxShadow: isToday ? '0 0 0 2px #FF8C69, 0 0 0 4px rgba(255,140,105,0.2)' : undefined,
              }}
              title={`${day.label}: ${day.minutes} 分钟`}
            />
            <span className={`text-[10px] ${isToday ? 'text-primary font-semibold' : 'text-slate-400'}`}>
              {day.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────── */

function HomePage() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState({})
  const [heatmapData, setHeatmapData] = useState([])
  const [todayMinutes, setTodayMinutes] = useState(0)
  const [maxMinutes, setMaxMinutes] = useState(10)
  const [watchMinutes, setWatchMinutes] = useState(0)
  const [watchPercent, setWatchPercent] = useState(0)
  const [watchGoal, setWatchGoal] = useState(15)

  useEffect(() => {
    const today = getToday()
    const snapshot = loadFromStorage(SNAPSHOT_KEY) || { date: '' }

    // If new day, archive yesterday's snapshot and reset
    if (snapshot.date !== today) {
      // Calculate yesterday's minutes from old snapshot
      if (snapshot.date) {
        const yesterdayMinutes = DAILY_TASKS.reduce((sum, task) => {
          const data = loadFromStorage(task.storageKey)
          const current = task.getCount(data)
          const baseline = snapshot[task.id] || 0
          const done = Math.max(0, current - baseline)
          return sum + done * (MINUTES_PER_UNIT[task.id] || 1)
        }, 0)

        if (yesterdayMinutes > 0) {
          const log = loadFromStorage(ACTIVITY_LOG_KEY) || {}
          log[snapshot.date] = Math.round(yesterdayMinutes)
          saveToStorage(ACTIVITY_LOG_KEY, log)
        }
      }

      // Create new snapshot for today
      const newSnapshot = { date: today }
      DAILY_TASKS.forEach((task) => {
        const data = loadFromStorage(task.storageKey)
        newSnapshot[task.id] = task.getCount(data)
      })
      saveToStorage(SNAPSHOT_KEY, newSnapshot)
    }

    // Calculate today's task progress
    const currentSnapshot = loadFromStorage(SNAPSHOT_KEY) || {}
    const todayTasks = DAILY_TASKS.map((task) => {
      const data = loadFromStorage(task.storageKey)
      const current = task.getCount(data)
      const baseline = currentSnapshot[task.id] || 0
      const done = Math.max(0, current - baseline)
      return {
        ...task,
        done: Math.min(done, task.target),
        status: done >= task.target ? 'done' : done > 0 ? 'doing' : 'todo',
      }
    })
    setTasks(todayTasks)

    // Calculate today's estimated minutes
    const minutes = todayTasks.reduce((sum, t) => {
      return sum + t.done * (MINUTES_PER_UNIT[t.id] || 1)
    }, 0)
    setTodayMinutes(minutes)

    // Update activity log with today's minutes
    const log = loadFromStorage(ACTIVITY_LOG_KEY) || {}
    log[today] = Math.round(minutes)
    saveToStorage(ACTIVITY_LOG_KEY, log)

    // Build 7-day heatmap data
    const days = getLast7Days()
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']
    const heatmap = days.map((date) => {
      const d = new Date(date + 'T00:00:00')
      return {
        date,
        label: weekDays[d.getDay()],
        minutes: log[date] || 0,
      }
    })
    setHeatmapData(heatmap)
    setMaxMinutes(Math.max(10, ...heatmap.map((d) => d.minutes)))

    // Overall stats
    const phoneticLearned = (() => {
      const d = loadFromStorage('en_ipa-learned')
      return Array.isArray(d) ? d.length : 0
    })()
    const flashcardMastered = (() => {
      const d = loadFromStorage('en_flashcard-records')
      if (!d || typeof d !== 'object') return 0
      return Object.values(d).filter((r) => r && r.box >= 5).length
    })()
    const shadowingStats = loadFromStorage('en_shadowing-stats') || {}
    setStats({
      phoneticLearned,
      flashcardMastered,
      shadowingCount: shadowingStats.count || 0,
      shadowingAvg: shadowingStats.count
        ? (shadowingStats.totalStars / shadowingStats.count).toFixed(1)
        : '—',
    })

    // Watch time
    setWatchMinutes(getTodayWatchMinutes())
    setWatchPercent(getWatchGoalPercent())
    setWatchGoal(loadWatchGoal())
  }, [])

  const completedCount = tasks.filter((t) => t.status === 'done').length
  const completionPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0
  const today = new Date()
  const dateStr = today.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-24 space-y-5">
      {/* Date & greeting */}
      <div>
        <p className="text-xs text-slate-400">{dateStr}</p>
        <h1 className="text-2xl font-bold text-slate-800 mt-1">
          {today.getHours() < 12 ? '☀️ 早上好' : today.getHours() < 18 ? '🌤️ 下午好' : '🌙 晚上好'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">今天的英语学习开始了吗？</p>
      </div>

      {/* Activity card: heatmap + ring */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center justify-between">
          {/* Heatmap */}
          <div className="flex-1">
            <p className="text-xs text-slate-400 mb-3">近 7 天学习热度</p>
            <Heatmap data={heatmapData} maxMinutes={maxMinutes} />
          </div>

          {/* Divider */}
          <div className="w-px h-20 bg-slate-100 mx-2" />

          {/* Ring */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 pl-2">
            <p className="text-xs text-slate-400">今日完成</p>
            <CircularRing percent={completionPercent} />
            <p className="text-xs text-slate-500">
              约 {todayMinutes} 分钟
            </p>
          </div>
        </div>

        {/* Weekly summary line */}
        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
          <span>
            本周累计约 {heatmapData.reduce((s, d) => s + d.minutes, 0)} 分钟
          </span>
          <span>
            {completedCount === tasks.length ? '🎉 今日任务已完成' : `${tasks.length - completedCount} 项任务待完成`}
          </span>
        </div>
      </div>

      {/* Watch time card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <span>🎬</span> 今日动画浸泡
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {watchMinutes >= watchGoal
                ? `宝宝已经浸泡了 ${watchMinutes} 分钟，耳朵越来越灵啦！🎉`
                : watchMinutes > 0
                  ? `宝宝已经浸泡了 ${watchMinutes} 分钟，耳朵越来越灵啦！`
                  : '今天还没看动画哦，去浸泡一会吧～'}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <span>目标 {watchGoal} 分钟/天</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 shrink-0 pl-2">
            <CircularRing percent={watchPercent} size={64} strokeWidth={4} />
            <span className="text-[10px] text-slate-400">{watchMinutes}/{watchGoal} 分</span>
          </div>
        </div>
      </div>

      {/* Daily task checklist */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">
            📅 今日任务
          </h2>
          <span
            className={`text-sm font-bold ${
              completedCount === tasks.length ? 'text-emerald-500' : 'text-primary'
            }`}
          >
            {completedCount}/{tasks.length} 完成
          </span>
        </div>

        {completedCount === tasks.length && tasks.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm text-center font-medium">
            🎉 太棒了！今日任务全部完成！
          </div>
        )}

        <div className="space-y-1">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => navigate(task.link)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
                task.status === 'done'
                  ? 'bg-emerald-50 hover:bg-emerald-100'
                  : task.status === 'doing'
                    ? 'bg-amber-50 hover:bg-amber-100'
                    : 'hover:bg-slate-50'
              }`}
            >
              <span className="text-lg w-7 text-center">
                {task.status === 'done' ? '✅' : task.status === 'doing' ? '🔶' : '⬜'}
              </span>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm font-medium ${
                    task.status === 'done' ? 'text-emerald-700 line-through' : 'text-slate-700'
                  }`}
                >
                  {task.icon} {task.label}
                </span>
                <span className="text-xs text-slate-400 ml-2">{task.target}{task.unit}</span>
              </div>
              <div className="flex items-center gap-2">
                {task.status === 'doing' && (
                  <div className="w-12 bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-amber-400 h-1.5 rounded-full"
                      style={{ width: `${(task.done / task.target) * 100}%` }}
                    />
                  </div>
                )}
                <span
                  className={`text-xs font-medium ${
                    task.status === 'done'
                      ? 'text-emerald-600'
                      : task.status === 'doing'
                        ? 'text-amber-600'
                        : 'text-slate-300'
                  }`}
                >
                  {task.status === 'done' ? '已完成' : task.status === 'doing' ? `${task.done}/${task.target}` : '未开始'}
                </span>
                <span className="text-slate-300 text-xs">›</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick access grid */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3">快速入口</h2>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_LINKS.map((item) => (
            <button
              key={item.link}
              onClick={() => navigate(item.link)}
              className={`rounded-xl p-3 text-center hover:opacity-80 transition-opacity cursor-pointer ${item.color}`}
            >
              <span className="text-2xl block mb-1">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-xs opacity-70 block mt-0.5">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h2 className="text-base font-semibold text-slate-800 mb-3">📊 学习总览</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary">{stats.phoneticLearned}/48</p>
            <p className="text-xs text-slate-400 mt-1">音标已学</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-emerald-500">{stats.flashcardMastered}/50</p>
            <p className="text-xs text-slate-400 mt-1">单词已掌握</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-500">{stats.shadowingCount}</p>
            <p className="text-xs text-slate-400 mt-1">跟读练习次数</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-500">{stats.shadowingAvg}</p>
            <p className="text-xs text-slate-400 mt-1">跟读平均星数</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
