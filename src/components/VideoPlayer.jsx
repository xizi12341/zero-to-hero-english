import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'

const STORAGE_KEY = 'en_video-progress'
const DEFAULT_VIDEO = '' // Users can paste their own URL

function VideoPlayer() {
  const videoRef = useRef(null)
  const [src, setSrc] = useState(() => {
    try { return localStorage.getItem('en_video-url') || DEFAULT_VIDEO } catch { return DEFAULT_VIDEO }
  })
  const [urlInput, setUrlInput] = useState(src)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [savedTime, setSavedTime] = useState(() => {
    try {
      const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      return d[src] || 0
    } catch { return 0 }
  })
  const [showResume, setShowResume] = useState(savedTime > 3)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTime = () => setCurrentTime(video.currentTime)
    const onDuration = () => setDuration(video.duration)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)

    video.addEventListener('timeupdate', onTime)
    video.addEventListener('loadedmetadata', onDuration)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)

    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('loadedmetadata', onDuration)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
    }
  }, [src])

  // Save progress periodically
  useEffect(() => {
    if (!src || currentTime === 0) return
    const timer = setInterval(() => {
      try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
        data[src] = Math.floor(currentTime)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch { /* quota */ }
    }, 5000)
    return () => clearInterval(timer)
  }, [src, currentTime])

  const handleSetUrl = () => {
    const trimmed = urlInput.trim()
    setSrc(trimmed)
    localStorage.setItem('en_video-url', trimmed)
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const saved = data[trimmed] || 0
      setSavedTime(saved)
      setShowResume(saved > 3)
    } catch { setSavedTime(0); setShowResume(false) }
  }

  const resumeFrom = () => {
    if (videoRef.current && savedTime > 0) {
      videoRef.current.currentTime = savedTime
    }
    videoRef.current?.play()
    setShowResume(false)
  }

  const seek = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds))
    }
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-3">
      {/* URL input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="粘贴视频 URL（MP4 / 本地路径）..."
          className="flex-1 p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary"
          onKeyDown={(e) => e.key === 'Enter' && handleSetUrl()}
        />
        <button
          onClick={handleSetUrl}
          className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer"
        >
          加载
        </button>
      </div>

      {/* Video player */}
      {src ? (
        <div className="bg-black rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            src={src}
            controls
            className="w-full aspect-video"
            playsInline
          />

          {/* Custom controls bar */}
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-900 text-white">
            <button
              onClick={() => videoRef.current?.paused ? videoRef.current?.play() : videoRef.current?.pause()}
              className="p-1 hover:text-primary transition-colors cursor-pointer"
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button onClick={() => seek(-10)} className="p-1 hover:text-primary transition-colors cursor-pointer" title="后退10秒">
              <RotateCcw className="w-4 h-4" />
            </button>

            <button onClick={() => seek(10)} className="p-1 hover:text-primary transition-colors cursor-pointer" title="前进10秒">
              <SkipForward className="w-4 h-4" />
            </button>

            <span className="text-xs text-slate-400 ml-auto">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Resume bar */}
          {showResume && savedTime > 0 && (
            <div className="flex items-center justify-between px-4 py-2 bg-primary/90 text-white text-sm">
              <span>上次看到 {formatTime(savedTime)}</span>
              <button
                onClick={resumeFrom}
                className="px-3 py-1 bg-white text-primary rounded-full text-xs font-medium hover:bg-white/90 transition-colors cursor-pointer"
              >
                继续播放
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-100 rounded-xl aspect-video flex items-center justify-center text-slate-400 text-sm">
          请输入视频链接开始播放
        </div>
      )}

      <p className="text-xs text-slate-400">
        支持 MP4 视频链接或本地文件路径。播放进度每 5 秒自动保存，下次打开可继续。
      </p>
    </div>
  )
}

export default VideoPlayer
