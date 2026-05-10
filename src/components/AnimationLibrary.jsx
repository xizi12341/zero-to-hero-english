import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Play } from 'lucide-react'
import {
  loadAnimations,
  addAnimation,
  removeAnimation,
  detectPlatform,
  getThumbnail,
} from '../utils/animationStorage'
import VideoPlayerModal from './VideoPlayerModal'

const PLATFORM_LABELS = {
  youtube: 'YouTube',
  bilibili: 'B站',
  other: '其他',
}

function AddModal({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [embedUrl, setEmbedUrl] = useState('')

  const handleSubmit = () => {
    if (!name.trim() || !embedUrl.trim()) return
    onAdd({
      name: name.trim(),
      embedUrl: embedUrl.trim(),
      platform: detectPlatform(embedUrl),
    })
    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 z-40 bg-black/50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 space-y-4"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-slate-800">添加动画</h3>

        <div>
          <label className="text-xs text-slate-500 block mb-1">动画名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：小猪佩奇 S01E01"
            className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary"
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs text-slate-500 block mb-1">
            嵌入链接（YouTube / Bilibili iframe 链接）
          </label>
          <input
            type="text"
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            placeholder="https://www.youtube.com/embed/..."
            className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <p className="text-xs text-slate-400 mt-1">
            需以 https:// 开头，YouTube 用 /embed/ 链接，B站用 player.bilibili.com 链接
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !embedUrl.trim()}
            className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer disabled:opacity-50"
          >
            添加
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function AnimationLibrary() {
  const [animations, setAnimations] = useState(loadAnimations)
  const [showAdd, setShowAdd] = useState(false)
  const [playing, setPlaying] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const handleAdd = (item) => {
    setAnimations(addAnimation(animations, item))
  }

  const handleDelete = (id) => {
    setAnimations(removeAnimation(animations, id))
    setDeleteId(null)
    if (playing?.id === id) setPlaying(null)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {animations.length === 0 ? '还没有动画，点击添加' : `共 ${animations.length} 部动画`}
        </p>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          添加动画
        </button>
      </div>

      {/* Animation grid */}
      {animations.length === 0 ? (
        <div className="bg-slate-50 rounded-xl p-10 text-center">
          <span className="text-4xl block mb-2">🎬</span>
          <p className="text-slate-400 text-sm">动画资源库为空</p>
          <p className="text-slate-300 text-xs mt-1">点击「添加动画」开始收录</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {animations.map((item, i) => {
              const thumb = getThumbnail(item)
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden group relative"
                >
                  {/* Thumbnail */}
                  <div
                    className="aspect-video bg-slate-100 flex items-center justify-center relative cursor-pointer"
                    onClick={() => setPlaying(item)}
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-3xl">
                        {item.platform === 'youtube' ? '▶' : item.platform === 'bilibili' ? '📺' : '🎬'}
                      </span>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity fill-white" />
                    </div>

                    {/* Platform badge */}
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                      {PLATFORM_LABELS[item.platform] || item.platform}
                    </span>
                  </div>

                  {/* Name + delete */}
                  <div className="p-2 flex items-center justify-between gap-1">
                    <span className="text-xs text-slate-700 truncate flex-1">{item.name}</span>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="p-1 text-slate-300 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && <AddModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              className="bg-white rounded-2xl p-5 mx-4 max-w-xs w-full text-center space-y-3"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-3xl">🗑️</span>
              <p className="text-sm text-slate-700">确定要删除这部动画吗？</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer"
                >
                  删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player */}
      <AnimatePresence>
        {playing && (
          <VideoPlayerModal
            animation={playing}
            onClose={() => setPlaying(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default AnimationLibrary
