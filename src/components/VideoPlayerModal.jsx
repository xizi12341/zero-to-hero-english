import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Timer, Square } from 'lucide-react'
import { addWatchSeconds } from '../utils/watchTimeTracker'

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function normalizeUrl(url) {
  if (!url) return ''
  // Fix protocol-relative URLs so they work in file:// (Electron) and https:// contexts
  if (url.startsWith('//')) return 'https:' + url
  return url
}

function VideoPlayerModal({ animation, onClose }) {
  const displayName = animation.title || animation.name
  const iframeSrc = normalizeUrl(animation.url || animation.embedUrl)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)
  const accumRef = useRef(0)

  const startTimer = useCallback(() => {
    if (running) return
    setRunning(true)
    intervalRef.current = setInterval(() => {
      accumRef.current += 1
      setSeconds(accumRef.current)
    }, 1000)
  }, [running])

  const pauseTimer = useCallback(() => {
    setRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const endWatch = useCallback(() => {
    pauseTimer()
    if (accumRef.current > 0) {
      addWatchSeconds(accumRef.current)
    }
    onClose()
  }, [pauseTimer, onClose])

  // Start timer when component mounts
  useEffect(() => {
    startTimer()
    return () => {
      pauseTimer()
      if (accumRef.current > 0) {
        addWatchSeconds(accumRef.current)
      }
    }
  }, [startTimer, pauseTimer])

  // Save on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (accumRef.current > 0) {
        addWatchSeconds(accumRef.current)
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/80 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
          <h3 className="text-sm font-medium truncate flex-1 mr-2">
            {displayName}
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Timer className="w-4 h-4" />
              <span className="text-sm font-mono">{formatTime(seconds)}</span>
            </div>
            <button
              onClick={endWatch}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" />
              结束观看
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* iframe player */}
        <div className="flex-1 bg-black flex items-center justify-center">
          {iframeSrc ? (
            <iframe
              src={iframeSrc}
              className="w-full h-full max-w-4xl"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              title={displayName}
            />
          ) : (
            <p className="text-slate-400 text-sm">无播放链接</p>
          )}
        </div>

        {/* Bottom hint */}
        <div className="px-4 py-2 bg-slate-900 text-slate-400 text-xs text-center">
          {running ? '正在计时中...' : '计时已暂停'} · 结束观看后自动保存时长
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default VideoPlayerModal
