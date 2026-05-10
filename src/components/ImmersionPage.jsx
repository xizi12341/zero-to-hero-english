import { useState, useEffect, useRef, useCallback } from 'react'

/* ── Lyrics data ─────────────────────────────────────────── */
const LYRICS_LINES = [
  { text: 'Twinkle, twinkle, little star,', translation: '一闪一闪小星星，' },
  { text: 'How I wonder what you are!', translation: '我多想知道你是什么！' },
  { text: 'Up above the world so high,', translation: '高高挂在世界之上，' },
  { text: 'Like a diamond in the sky.', translation: '像天空中的一颗钻石。' },
  { text: 'Twinkle, twinkle, little star,', translation: '一闪一闪小星星，' },
  { text: 'How I wonder what you are!', translation: '我多想知道你是什么！' },
]

/* ── Dictation sentences ──────────────────────────────────── */
const DICTATION_SENTENCES = [
  'I like cats.',
  'She is my friend.',
  'The sun is hot.',
  'He can run fast.',
  'This is a book.',
  'I have a dog.',
  'She likes to sing.',
  'The bird can fly.',
  'It is very cold.',
  'We go to school.',
]

const SCORES_KEY = 'en_dictation-scores'

/* ── Helpers ──────────────────────────────────────────────── */
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function loadScores() {
  try {
    return JSON.parse(localStorage.getItem(SCORES_KEY) || '[]')
  } catch {
    return []
  }
}

function saveScores(scores) {
  try {
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores.slice(0, 20)))
  } catch { /* quota */ }
}

function compareAnswers(correct, user) {
  const strip = (s) => s.replace(/[.,!?]/g, '').toLowerCase()
  const correctWords = correct.split(/\s+/).map(strip)
  const userWords = user.trim().split(/\s+/).map(strip)
  const maxLen = Math.max(correctWords.length, userWords.length)
  const result = []
  for (let i = 0; i < maxLen; i++) {
    const c = correctWords[i] || null
    const u = userWords[i] || null
    if (c && u && c === u) {
      result.push({ type: 'correct', expected: c, actual: u })
    } else if (c && u) {
      result.push({ type: 'wrong', expected: c, actual: u })
    } else if (c) {
      result.push({ type: 'missing', expected: c, actual: null })
    } else {
      result.push({ type: 'extra', expected: null, actual: u })
    }
  }
  return { diff: result, correctWords: correctWords }
}

/* ── Sub-components ──────────────────────────────────────── */

function RecommendationTab() {
  const synthRef = useRef(window.speechSynthesis)

  useEffect(() => {
    return () => synthRef.current.cancel()
  }, [])

  const speak = useCallback((text) => {
    synthRef.current.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = 0.7
    synthRef.current.speak(u)
  }, [])

  return (
    <div className="space-y-6">
      {/* Peppa Pig */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🐷</span>
          <h3 className="text-lg font-semibold text-slate-800">
            今日动画 · <span className="text-pink-500">小猪佩奇</span>
          </h3>
        </div>
        <p className="text-sm text-slate-500 mb-2">
          Peppa Pig — 第一季 第一集 <em>&ldquo;Muddy Puddles&rdquo;</em>
        </p>
        <p className="text-xs text-slate-400 mb-4">
          全球最受欢迎的幼儿英语启蒙动画。语速慢、词汇简单、每集5分钟，非常适合零基础学习者。
        </p>

        <div className="space-y-2 text-sm">
          <a
            href="https://search.bilibili.com/all?keyword=小猪佩奇 第一季 第一集"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors"
          >
            <span>📺</span>
            <span>B站搜索：<strong>小猪佩奇 第一季 第一集</strong></span>
          </a>
          <a
            href="https://www.youtube.com/results?search_query=Peppa+Pig+Season+1+Episode+1+Muddy+Puddles"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <span>▶</span>
            <span>YouTube: <strong>Peppa Pig S01E01 Muddy Puddles</strong></span>
          </a>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-slate-50 text-xs text-slate-500">
          <p className="font-medium mb-1">💡 学习建议</p>
          <p>先看一遍了解剧情 → 第二遍跟读简单词（jump / rain / boots）→ 第三遍尝试复述</p>
        </div>
      </div>

      {/* Song lyrics */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🎵</span>
          <h3 className="text-lg font-semibold text-slate-800">
            今日儿歌 · <span className="text-amber-500">Twinkle Twinkle Little Star</span>
          </h3>
        </div>

        <button
          onClick={() => {
            const full = LYRICS_LINES.map((l) => l.text.replace(/[,!]/g, '')).join('. ')
            speak(full)
          }}
          className="mb-4 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-sm font-medium hover:bg-amber-100 transition-colors cursor-pointer"
        >
          🔊 播放整首
        </button>

        <div className="space-y-3">
          {LYRICS_LINES.map((line, i) => (
            <div key={i} className="group">
              <div className="flex items-center gap-2 flex-wrap">
                {line.text.split(/(\s+)/).map((token, j) => {
                  if (token.trim() === '') {
                    return <span key={j}>{token}</span>
                  }
                  const clean = token.replace(/[,!]/g, '')
                  return (
                    <button
                      key={j}
                      onClick={() => speak(clean)}
                      className="text-base text-slate-700 hover:text-primary hover:bg-primary/5 px-0.5 rounded transition-colors cursor-pointer"
                      title={`朗读 "${clean}"`}
                    >
                      {token}
                    </button>
                  )
                })}
                <button
                  onClick={() => speak(line.text.replace(/[,!]/g, ''))}
                  className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-300 hover:text-amber-500 cursor-pointer"
                  title="播放整句"
                >
                  🔊
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 ml-1">{line.translation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Dictation Tab ────────────────────────────────────────── */

function DictationTab() {
  const synthRef = useRef(window.speechSynthesis)

  const [sentences, setSentences] = useState(() => shuffle(DICTATION_SENTENCES))
  const [idx, setIdx] = useState(0)
  const [round, setRound] = useState(0) // 0=idle, 1=playing, 2=typed, 3=checked
  const [readingCount, setReadingCount] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [diff, setDiff] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [scores, setScores] = useState(loadScores)
  const inputRef = useRef(null)

  const currentSentence = sentences[idx]

  useEffect(() => {
    return () => synthRef.current.cancel()
  }, [])

  const speak = useCallback(
    (text) =>
      new Promise((resolve) => {
        synthRef.current.cancel()
        const u = new SpeechSynthesisUtterance(text)
        u.lang = 'en-US'
        u.rate = 0.7
        u.onend = () => resolve()
        u.onerror = () => resolve()
        synthRef.current.speak(u)
      }),
    []
  )

  const playThreeTimes = useCallback(async () => {
    setRound(1)
    for (let i = 0; i < 3; i++) {
      setReadingCount(i + 1)
      await speak(currentSentence)
      if (i < 2) await new Promise((r) => setTimeout(r, 600))
    }
    setReadingCount(0)
    setRound(2)
  }, [currentSentence, speak])

  // Auto-play first round on new sentence
  useEffect(() => {
    if (round === 0) {
      const timer = setTimeout(() => playThreeTimes(), 400)
      return () => clearTimeout(timer)
    }
  }, [round, playThreeTimes])

  const handleSubmit = () => {
    const { diff: d, correctWords } = compareAnswers(currentSentence, userInput)
    setDiff(d)
    const s = d.filter((x) => x.type === 'correct').length
    const maxScore = correctWords.length
    setScore(s)
    setTotalScore((prev) => prev + s)
    setRound(3)
  }

  const handleNext = () => {
    if (idx + 1 >= sentences.length) {
      // Finish round
      const newScore = {
        date: new Date().toISOString(),
        score: totalScore + (diff ? diff.filter((x) => x.type === 'correct').length : 0),
        total: sentences.length * sentences[0].split(/\s+/).length,
      }
      // Recalculate total properly
      setFinished(true)
      const history = [newScore, ...scores]
      setScores(history)
      saveScores(history)
      return
    }
    setIdx((i) => i + 1)
    setRound(0)
    setUserInput('')
    setDiff(null)
    setReadingCount(0)
    // Focus input after render
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const restart = () => {
    setSentences(shuffle(DICTATION_SENTENCES))
    setIdx(0)
    setRound(0)
    setUserInput('')
    setDiff(null)
    setScore(0)
    setTotalScore(0)
    setFinished(false)
    setReadingCount(0)
  }

  if (finished) {
    const lastScores = scores.slice(0, 5)
    const finalScore = totalScore
    // Count total words across all 10 sentences
    const totalWords = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0)

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center">
          <span className="text-5xl">🎉</span>
          <h3 className="text-xl font-bold text-slate-800 mt-3">听写完成！</h3>
          <p className="text-3xl font-bold text-primary mt-2">
            {finalScore} / {totalWords}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            正确率 {totalWords > 0 ? Math.round((finalScore / totalWords) * 100) : 0}%
          </p>
          <button
            onClick={restart}
            className="mt-4 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors cursor-pointer"
          >
            再来一轮
          </button>
        </div>

        {lastScores.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h4 className="text-sm font-semibold text-slate-600 mb-3">最近成绩</h4>
            <div className="space-y-2">
              {lastScores.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    {new Date(s.date).toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="font-medium text-slate-700">
                    {s.score}/{s.total}
                  </span>
                  <span className="text-slate-400">
                    {s.total > 0 ? Math.round((s.score / s.total) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          第 {idx + 1}/{sentences.length} 题
        </span>
        {round === 1 && (
          <span className="text-primary font-medium animate-pulse">
            朗读中... {readingCount}/3
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((idx + (round >= 3 ? 1 : 0)) / sentences.length) * 100}%` }}
        />
      </div>

      {/* Play area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center">
        <p className="text-xs text-slate-400 mb-3">
          {round === 0
            ? '即将开始播放...'
            : round === 1
              ? '仔细听，不要写'
              : round === 2
                ? '请在下方输入你听到的句子'
                : '提交后查看结果'}
        </p>

        <button
          onClick={playThreeTimes}
          disabled={round === 1}
          className={`px-6 py-3 rounded-full text-lg font-medium transition-colors cursor-pointer disabled:opacity-50 ${
            round === 1
              ? 'bg-slate-100 text-slate-400'
              : 'bg-primary/10 text-primary hover:bg-primary/20'
          }`}
        >
          {round === 1 ? `🔊 朗读中 ${readingCount}/3` : '🔊 播放（3遍）'}
        </button>
      </div>

      {/* Input */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && round === 2 && userInput.trim()) {
              handleSubmit()
            }
          }}
          disabled={round === 0 || round === 1 || round === 3}
          placeholder={
            round <= 1 ? '等待播放完成...' : '请输入你听到的句子...'
          }
          className="w-full p-3 rounded-lg border border-slate-200 text-slate-700 text-lg placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-50 disabled:text-slate-400"
        />

        <button
          onClick={handleSubmit}
          disabled={round !== 2 || !userInput.trim()}
          className="mt-3 w-full py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default"
        >
          提交答案
        </button>
      </div>

      {/* Result */}
      {round === 3 && diff && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-600">对比结果</h4>
            <span className="text-sm font-bold text-primary">
              {score}/{diff.reduce((s, d) => s + (d.expected ? 1 : 0), 0)} 词正确
            </span>
          </div>

          {/* Correct answer */}
          <div>
            <p className="text-xs text-slate-400 mb-1">正确答案：</p>
            <p className="text-lg">
              {diff.map((d, i) => (
                <span
                  key={i}
                  className={
                    d.type === 'correct'
                      ? 'text-emerald-600 font-medium'
                      : d.type === 'wrong' || d.type === 'missing'
                        ? 'text-red-500 font-medium underline decoration-red-300'
                        : ''
                  }
                >
                  {d.expected ? d.expected : null}
                  {d.expected && i < diff.length - 1 && diff[i + 1]?.expected ? ' ' : ''}
                </span>
              ))}
            </p>
          </div>

          {/* User answer */}
          <div>
            <p className="text-xs text-slate-400 mb-1">你的答案：</p>
            <p className="text-lg">
              {diff.map((d, i) => (
                <span
                  key={i}
                  className={
                    d.type === 'correct'
                      ? 'text-emerald-600 font-medium'
                      : 'text-red-500 line-through decoration-red-300'
                  }
                >
                  {d.actual || '______'}
                  {i < diff.length - 1 ? ' ' : ''}
                </span>
              ))}
            </p>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors cursor-pointer"
          >
            {idx + 1 >= sentences.length ? '完成，查看成绩' : '下一题 →'}
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Main Page ────────────────────────────────────────────── */

function ImmersionPage() {
  const [tab, setTab] = useState('recommend')

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      {/* Tabs */}
      <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
        {[
          { key: 'recommend', label: '📺 今日推荐' },
          { key: 'dictation', label: '✏️ 听写练习' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              tab === key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'recommend' ? <RecommendationTab /> : <DictationTab />}
    </div>
  )
}

export default ImmersionPage
