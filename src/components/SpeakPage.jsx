import { useState, useEffect, useRef, useCallback } from 'react'

/* ── Android / Capacitor helpers ──────────────────────────── */

function getBestMimeType() {
  const types = ['audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/wav']
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t
  }
  return '' // let browser choose default
}

function isCapacitor() {
  try {
    return !!(window.Capacitor || window.Capacitor?.getPlatform)
  } catch {
    return false
  }
}

/* ── Data ─────────────────────────────────────────────────── */

const SHADOW_SENTENCES = [
  'I am a student.',
  'She is a teacher.',
  'He is my friend.',
  'I like apples.',
  'She likes dogs.',
  'The cat is small.',
  'I can swim.',
  'He can run fast.',
  'It is a sunny day.',
  'We are happy.',
  'I have a book.',
  'She has a pen.',
  'The dog is big.',
  'I want some water.',
  'He wants to play.',
]

const ENCOURAGEMENTS = [
  "Good job! Try to say 'I like apples.'",
  "Well done! Can you say 'My name is...'?",
  "Great effort! Try asking 'How are you?'",
  "Nice work! Practice saying 'I am happy.'",
  "Excellent! Can you describe your family?",
  "Keep going! Try to say 'I want some water.'",
  "You're doing great! Tell me about your day.",
  "Wonderful! Can you count from 1 to 10 in English?",
  "Fantastic! Try introducing yourself in English.",
  "Amazing work! Let's try a new sentence together.",
]

const SHADOW_STATS_KEY = 'en_shadowing-stats'
const AI_CONFIG_KEY = 'en_speak-ai-config'

/* ── Helpers ──────────────────────────────────────────────── */

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function loadShadowStats() {
  try {
    const raw = localStorage.getItem(SHADOW_STATS_KEY)
    return raw ? JSON.parse(raw) : { count: 0, totalStars: 0 }
  } catch {
    return { count: 0, totalStars: 0 }
  }
}

function saveShadowStats(stats) {
  try {
    localStorage.setItem(SHADOW_STATS_KEY, JSON.stringify(stats))
  } catch { /* quota */ }
}

function loadAIConfig() {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY)
    return raw ? JSON.parse(raw) : { apiKey: '', modelId: 'claude-sonnet-4-6' }
  } catch {
    return { apiKey: '', modelId: 'claude-sonnet-4-6' }
  }
}

function saveAIConfig(config) {
  try {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config))
  } catch { /* quota */ }
}

/* ── Shadowing Section ───────────────────────────────────── */

function ShadowingSection() {
  const synthRef = useRef(window.speechSynthesis)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const recordingTimerRef = useRef(null)

  const [sentence, setSentence] = useState(() => randomPick(SHADOW_SENTENCES))
  const [phase, setPhase] = useState('idle') // idle | recording | playingBack | rating
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [stars, setStars] = useState(0)
  const [stats, setStats] = useState(loadShadowStats)
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    return () => {
      synthRef.current.cancel()
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
      clearTimeout(recordingTimerRef.current)
    }
  }, [])

  const avgStars = stats.count > 0 ? (stats.totalStars / stats.count).toFixed(1) : '—'

  const playTTS = useCallback((text) => {
    synthRef.current.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = 0.7
    synthRef.current.speak(u)
  }, [])

  const playBlob = useCallback((blob) => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob)
      const a = new Audio(url)
      a.onended = () => {
        URL.revokeObjectURL(url)
        resolve()
      }
      a.onerror = resolve
      a.play()
    })
  }, [])

  const startRecording = async () => {
    setErrMsg('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = getBestMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = recorder
      const chunks = []
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType || 'audio/mp4' })
        setRecordedBlob(blob)
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        handlePlayback(blob)
      }
      recorder.start()
      setPhase('recording')
    } catch (err) {
      const name = err?.name || ''
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setErrMsg(isCapacitor()
          ? '请在系统设置中允许「英语从0」使用麦克风权限'
          : '麦克风权限被拒绝，请在浏览器设置中允许访问麦克风')
      } else if (name === 'NotFoundError') {
        setErrMsg('未检测到麦克风设备')
      } else {
        setErrMsg('无法访问麦克风，请检查权限设置')
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  const handlePlayback = async (blob) => {
    setPhase('playingBack')
    await playBlob(blob)
    await new Promise((r) => setTimeout(r, 500))
    playTTS(sentence)
    // Wait approximate time for TTS to finish
    await new Promise((r) => setTimeout(r, sentence.length * 120 + 800))
    setPhase('rating')
  }

  const handleRate = (s) => {
    setStars(s)
    const newStats = { count: stats.count + 1, totalStars: stats.totalStars + s }
    setStats(newStats)
    saveShadowStats(newStats)
  }

  const nextSentence = () => {
    setSentence(randomPick(SHADOW_SENTENCES))
    setPhase('idle')
    setRecordedBlob(null)
    setStars(0)
    setErrMsg('')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">🎙️ 跟读模仿</h3>
        <span className="text-xs text-slate-400">
          练习 {stats.count} 次 · 均分 {avgStars}
        </span>
      </div>

      {/* Sentence card */}
      <div className="bg-slate-50 rounded-xl p-6 text-center">
        <p className="text-2xl font-bold text-slate-800 mb-4">{sentence}</p>

        <button
          onClick={() => playTTS(sentence)}
          disabled={phase === 'recording' || phase === 'playingBack'}
          className="px-5 py-2.5 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors cursor-pointer disabled:opacity-50"
        >
          🔊 播放原声
        </button>
      </div>

      {/* Record button */}
      <div className="text-center">
        {phase === 'recording' ? (
          <button
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchEnd={stopRecording}
            className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center animate-pulse cursor-pointer mx-auto"
          >
            <span className="text-xs font-bold">松手<br />停止</span>
          </button>
        ) : phase === 'playingBack' ? (
          <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <span className="text-xs font-medium">对比<br />播放中</span>
          </div>
        ) : (
          <button
            onMouseDown={startRecording}
            onTouchStart={startRecording}
            className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors cursor-pointer mx-auto shadow-lg"
          >
            <span className="text-xs font-bold">按住<br />录音</span>
          </button>
        )}

        <p className="text-xs text-slate-400 mt-2">
          {phase === 'idle'
            ? '长按录音，松手后自动对比'
            : phase === 'recording'
              ? '正在录音...松手停止'
              : phase === 'playingBack'
                ? '播放你的录音 → 播放原声'
                : phase === 'rating'
                  ? '给自己打分'
                  : ''}
        </p>
        {errMsg && <p className="text-xs text-red-500 mt-1">{errMsg}</p>}
      </div>

      {/* Star rating */}
      {phase === 'rating' && (
        <div className="text-center space-y-3">
          <p className="text-sm text-slate-500">你觉得自己读得怎么样？</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => handleRate(s)}
                className={`text-4xl transition-all cursor-pointer ${
                  stars >= s ? 'scale-110' : 'opacity-30 grayscale hover:opacity-60'
                }`}
              >
                ⭐
              </button>
            ))}
          </div>
          {stars > 0 && (
            <>
              <p className="text-sm text-slate-600">
                {stars === 1 ? '继续加油 💪' : stars === 2 ? '还不错 👍' : '非常棒 🎉'}
              </p>
              <button
                onClick={nextSentence}
                className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors cursor-pointer"
              >
                下一句 →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ── AI Speaking Partner Section ──────────────────────────── */

const SYSTEM_PROMPT =
  'You are a patient English teacher for absolute beginners. Use very simple words and short sentences. Correct my mistakes gently.'

function AISpeakingSection() {
  const [expanded, setExpanded] = useState(false)
  const [config, setConfig] = useState(loadAIConfig)
  const [showConfig, setShowConfig] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState(config.apiKey)
  const [modelInput, setModelInput] = useState(config.modelId)
  const [showKey, setShowKey] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your English teacher. Let's practice together. How are you today?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const saveConfig = () => {
    const c = { apiKey: apiKeyInput.trim(), modelId: modelInput.trim() || 'claude-sonnet-4-6' }
    setConfig(c)
    saveAIConfig(c)
    setShowConfig(false)
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setApiError('')

    if (!config.apiKey) {
      // Fallback: random encouragement
      setMessages([...updated, { role: 'assistant', content: randomPick(ENCOURAGEMENTS) }])
      return
    }

    setLoading(true)
    try {
      const apiMessages = updated.map((m) => ({ role: m.role, content: m.content }))
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: config.modelId,
          max_tokens: 512,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const msg =
          res.status === 401
            ? 'API Key 无效，请在设置中更新'
            : res.status === 429
              ? '请求太频繁，请稍后再试'
              : err.error?.message || `请求失败 (${res.status})`
        setApiError(msg)
        setMessages([...updated, { role: 'assistant', content: randomPick(ENCOURAGEMENTS) }])
        return
      }

      const data = await res.json()
      const reply = data.content?.[0]?.text || 'Sorry, I did not understand that.'
      setMessages([...updated, { role: 'assistant', content: reply }])
    } catch {
      setApiError('网络错误，请检查连接后重试')
      setMessages([...updated, { role: 'assistant', content: randomPick(ENCOURAGEMENTS) }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header - clickable to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <h3 className="text-base font-semibold text-slate-800">AI 口语伙伴</h3>
          {config.apiKey && (
            <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
              已配置
            </span>
          )}
        </div>
        <span className="text-slate-300 text-lg">{expanded ? '▾' : '▸'}</span>
      </button>

      {expanded && (
        <div className="border-t border-slate-100">
          {/* Config panel */}
          {showConfig ? (
            <div className="p-5 space-y-3 bg-slate-50 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-700">API 设置</p>
              <div>
                <label className="text-xs text-slate-500">Claude API Key</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="sk-ant-api-..."
                    className="flex-1 p-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="px-3 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    {showKey ? '隐藏' : '显示'}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500">模型 ID</label>
                <input
                  type="text"
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  placeholder="claude-sonnet-4-6"
                  className="w-full mt-1 p-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveConfig}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setApiKeyInput(config.apiKey)
                    setModelInput(config.modelId)
                    setShowConfig(false)
                  }}
                  className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  取消
                </button>
              </div>
              <p className="text-xs text-slate-400">
                API Key 仅保存在浏览器本地，不会上传到任何服务器。
              </p>
            </div>
          ) : (
            <div className="px-5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {config.apiKey
                  ? `模型: ${config.modelId}`
                  : '未配置 API Key — 使用随机鼓励语'}
              </span>
              <button
                onClick={() => {
                  setApiKeyInput(config.apiKey)
                  setModelInput(config.modelId)
                  setShowConfig(true)
                }}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                ⚙️ 设置
              </button>
            </div>
          )}

          {/* Chat area */}
          <div className="h-72 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-slate-100 text-slate-700 rounded-bl-md'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-xl rounded-bl-md px-4 py-3">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Error banner */}
          {apiError && (
            <div className="px-4 py-2 bg-red-50 text-red-500 text-xs text-center">{apiError}</div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              disabled={loading}
              placeholder={
                config.apiKey
                  ? '输入英文，和 AI 老师聊天...'
                  : '输入英文练习...'
              }
              className="flex-1 p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary disabled:bg-slate-50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer disabled:opacity-50"
            >
              发送
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main Page ────────────────────────────────────────────── */

function SpeakPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-5">
      <ShadowingSection />
      <AISpeakingSection />
    </div>
  )
}

export default SpeakPage
