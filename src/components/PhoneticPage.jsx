import { useState, useEffect, useRef, useCallback } from 'react'

const phonemeGroups = [
  {
    name: '单元音 Monophthongs',
    phonemes: [
      { ipa: 'iː', speak: 'ee', example: 'sheep 绵羊' },
      { ipa: 'ɪ', speak: 'ih', example: 'ship 船' },
      { ipa: 'e', speak: 'eh', example: 'bed 床' },
      { ipa: 'æ', speak: 'a', example: 'cat 猫' },
      { ipa: 'ɑː', speak: 'ah', example: 'car 车' },
      { ipa: 'ɒ', speak: 'o', example: 'hot 热' },
      { ipa: 'ɔː', speak: 'aw', example: 'door 门' },
      { ipa: 'ʊ', speak: 'oo', example: 'book 书' },
      { ipa: 'uː', speak: 'ooo', example: 'food 食物' },
      { ipa: 'ʌ', speak: 'uh', example: 'cup 杯子' },
      { ipa: 'ɜː', speak: 'er', example: 'bird 鸟' },
      { ipa: 'ə', speak: 'uh', example: 'about 关于' },
    ],
  },
  {
    name: '双元音 Diphthongs',
    phonemes: [
      { ipa: 'eɪ', speak: 'ay', example: 'day 天' },
      { ipa: 'aɪ', speak: 'eye', example: 'my 我的' },
      { ipa: 'ɔɪ', speak: 'oy', example: 'boy 男孩' },
      { ipa: 'əʊ', speak: 'oh', example: 'go 去' },
      { ipa: 'aʊ', speak: 'ow', example: 'now 现在' },
      { ipa: 'ɪə', speak: 'ear', example: 'ear 耳朵' },
      { ipa: 'eə', speak: 'air', example: 'hair 头发' },
      { ipa: 'ʊə', speak: 'oor', example: 'tour 旅行' },
    ],
  },
  {
    name: '爆破音 Plosives',
    phonemes: [
      { ipa: 'p', speak: 'puh', example: 'pen 笔' },
      { ipa: 'b', speak: 'buh', example: 'book 书' },
      { ipa: 't', speak: 'tuh', example: 'tea 茶' },
      { ipa: 'd', speak: 'duh', example: 'dog 狗' },
      { ipa: 'k', speak: 'kuh', example: 'cat 猫' },
      { ipa: 'g', speak: 'guh', example: 'go 去' },
    ],
  },
  {
    name: '摩擦音 Fricatives',
    phonemes: [
      { ipa: 'f', speak: 'fuh', example: 'fish 鱼' },
      { ipa: 'v', speak: 'vuh', example: 'van 货车' },
      { ipa: 'θ', speak: 'thuh', example: 'think 想' },
      { ipa: 'ð', speak: 'theh', example: 'this 这个' },
      { ipa: 's', speak: 'suh', example: 'sun 太阳' },
      { ipa: 'z', speak: 'zuh', example: 'zoo 动物园' },
      { ipa: 'ʃ', speak: 'shuh', example: 'she 她' },
      { ipa: 'ʒ', speak: 'zhuh', example: 'measure 测量' },
      { ipa: 'h', speak: 'huh', example: 'hat 帽子' },
      { ipa: 'r', speak: 'ruh', example: 'red 红色' },
    ],
  },
  {
    name: '破擦音 Affricates',
    phonemes: [
      { ipa: 'tʃ', speak: 'chuh', example: 'chair 椅子' },
      { ipa: 'dʒ', speak: 'juh', example: 'job 工作' },
      { ipa: 'tr', speak: 'truh', example: 'tree 树' },
      { ipa: 'dr', speak: 'druh', example: 'dress 裙子' },
      { ipa: 'ts', speak: 'tsuh', example: 'cats 猫(复)' },
      { ipa: 'dz', speak: 'dzuh', example: 'beds 床(复)' },
    ],
  },
  {
    name: '鼻音 / 舌侧音 / 半元音 Nasals / Lateral / Semivowels',
    phonemes: [
      { ipa: 'm', speak: 'muh', example: 'man 人' },
      { ipa: 'n', speak: 'nuh', example: 'no 不' },
      { ipa: 'ŋ', speak: 'ung', example: 'sing 唱' },
      { ipa: 'l', speak: 'luh', example: 'leg 腿' },
      { ipa: 'w', speak: 'wuh', example: 'win 赢' },
      { ipa: 'j', speak: 'yuh', example: 'yes 是' },
    ],
  },
]

function PhoneticPage() {
  const [selectedIpa, setSelectedIpa] = useState(null)
  const [learned, setLearned] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('en_ipa-learned') || '[]')
    } catch {
      return []
    }
  })
  const [recordPhase, setRecordPhase] = useState('idle') // idle | recording | done
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [error, setError] = useState('')

  const synthRef = useRef(window.speechSynthesis)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)

  const selected = phonemeGroups
    .flatMap((g) => g.phonemes)
    .find((p) => p.ipa === selectedIpa)

  useEffect(() => {
    return () => {
      synthRef.current.cancel()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('en_ipa-learned', JSON.stringify(learned))
    } catch { /* storage full */ }
  }, [learned])

  const playTTS = useCallback((phoneme) => {
    synthRef.current.cancel()
    const u = new SpeechSynthesisUtterance(phoneme.speak)
    u.lang = 'en-US'
    u.rate = 0.65
    u.pitch = 1.0
    synthRef.current.speak(u)
  }, [])

  const handleSelect = (phoneme) => {
    setError('')
    setSelectedIpa(phoneme.ipa)
    setRecordPhase('idle')
    setRecordedBlob(null)
    playTTS(phoneme)
  }

  const toggleLearned = () => {
    if (!selectedIpa) return
    setLearned((prev) =>
      prev.includes(selectedIpa)
        ? prev.filter((k) => k !== selectedIpa)
        : [...prev, selectedIpa]
    )
  }

  const startRecording = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = recorder
      const chunks = []
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        setRecordedBlob(new Blob(chunks, { type: 'audio/webm' }))
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      recorder.start()
      setRecordPhase('recording')
    } catch {
      setError('无法访问麦克风，请检查浏览器权限设置')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecordPhase('done')
  }

  const playRecorded = () => {
    if (!recordedBlob) return
    const url = URL.createObjectURL(recordedBlob)
    const a = new Audio(url)
    a.onended = () => URL.revokeObjectURL(url)
    a.play()
  }

  const handlePlayOriginal = () => {
    if (selected) playTTS(selected)
  }

  const totalPhonemes = phonemeGroups.reduce((s, g) => s + g.phonemes.length, 0)
  const learnedCount = learned.length

  return (
    <div className="max-w-2xl mx-auto px-3 py-4 pb-36">
      {/* Header stats */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">音标学习</h2>
        <span className="text-sm text-slate-500">
          已学 {learnedCount}/{totalPhonemes}
        </span>
      </div>

      {/* Selected phoneme display */}
      {selected ? (
        <div className="bg-white rounded-xl shadow-sm border border-primary/20 p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-2xl font-bold text-primary shrink-0">
              /{selected.ipa}/
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-500 text-sm">例词: {selected.example}</div>
              <div className="text-slate-400 text-xs mt-1">
                点击音标卡片可收听发音，点击下方按钮进行录音对比
              </div>
            </div>
            <button
              onClick={handlePlayOriginal}
              className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-lg hover:bg-primary/20 transition-colors shrink-0"
              title="播放原音"
            >
              🔊
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={toggleLearned}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                selectedIpa && learned.includes(selectedIpa)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {selectedIpa && learned.includes(selectedIpa) ? '✓ 已学会' : '标记已学'}
            </button>

            {recordPhase === 'idle' && (
              <button
                onClick={startRecording}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-amber-600 transition-colors cursor-pointer"
              >
                🎤 录音对比
              </button>
            )}
            {recordPhase === 'recording' && (
              <button
                onClick={stopRecording}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-red-500 text-white animate-pulse cursor-pointer"
              >
                ⏹ 停止录音
              </button>
            )}
          </div>

          {/* Comparison playback */}
          {recordPhase === 'done' && recordedBlob && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={handlePlayOriginal}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
              >
                🔊 播放原音
              </button>
              <button
                onClick={playRecorded}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                🎤 播放录音
              </button>
              <button
                onClick={startRecording}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                🔄 重新录制
              </button>
            </div>
          )}

          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center mb-4">
          <span className="text-3xl">👆</span>
          <p className="text-slate-400 text-sm mt-2">点击下方音标卡片开始学习</p>
        </div>
      )}

      {/* Phoneme grid by groups */}
      {phonemeGroups.map((group) => {
        const groupLearned = group.phonemes.filter((p) => learned.includes(p.ipa)).length
        const groupTotal = group.phonemes.length
        return (
          <div key={group.name} className="mb-5">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-sm font-semibold text-slate-600">{group.name}</h3>
              <span className="text-xs text-slate-400">
                {groupLearned}/{groupTotal}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {group.phonemes.map((p) => {
                const isSelected = selectedIpa === p.ipa
                const isLearned = learned.includes(p.ipa)
                return (
                  <button
                    key={p.ipa}
                    onClick={() => handleSelect(p)}
                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-md scale-95'
                        : isLearned
                          ? 'bg-emerald-50 text-slate-700 border-emerald-200 hover:border-emerald-400'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg font-bold leading-none">
                      /{p.ipa}/
                    </span>
                    {isLearned && !isSelected && (
                      <span className="absolute top-1 right-1.5 text-emerald-500 text-xs">
                        ✓
                      </span>
                    )}
                    {isSelected && (
                      <span className="text-[10px] mt-0.5 opacity-80">{p.speak}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Bulk action at bottom */}
      <div className="flex gap-2 mt-6">
        <button
          onClick={() => {
            const allIpa = phonemeGroups.flatMap((g) => g.phonemes.map((p) => p.ipa))
            setLearned(allIpa)
          }}
          className="flex-1 py-3 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          全部标记已学
        </button>
        <button
          onClick={() => {
            if (confirm('确定要清除所有学习进度吗？')) {
              setLearned([])
              localStorage.removeItem('en_ipa-learned')
            }
          }}
          className="py-3 px-4 rounded-lg text-sm font-medium bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
        >
          重置进度
        </button>
      </div>
    </div>
  )
}

export default PhoneticPage
