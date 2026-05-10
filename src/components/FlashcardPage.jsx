import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import confetti from 'canvas-confetti'
import { Volume2 } from 'lucide-react'

const WORDS = [
  { id: 0, word: 'apple', emoji: '🍎', meaning: '苹果', example: 'I eat an apple every day.' },
  { id: 1, word: 'book', emoji: '📖', meaning: '书', example: 'She is reading a book.' },
  { id: 2, word: 'water', emoji: '💧', meaning: '水', example: 'Please give me some water.' },
  { id: 3, word: 'cat', emoji: '🐱', meaning: '猫', example: 'The cat is sleeping on the sofa.' },
  { id: 4, word: 'dog', emoji: '🐶', meaning: '狗', example: 'I walk my dog every morning.' },
  { id: 5, word: 'sun', emoji: '☀️', meaning: '太阳', example: 'The sun rises in the east.' },
  { id: 6, word: 'moon', emoji: '🌙', meaning: '月亮', example: 'The moon is bright tonight.' },
  { id: 7, word: 'star', emoji: '⭐', meaning: '星星', example: 'I saw a shooting star.' },
  { id: 8, word: 'tree', emoji: '🌳', meaning: '树', example: 'There is a big tree in the park.' },
  { id: 9, word: 'flower', emoji: '🌸', meaning: '花', example: 'She gave me a beautiful flower.' },
  { id: 10, word: 'bird', emoji: '🐦', meaning: '鸟', example: 'The bird is singing in the tree.' },
  { id: 11, word: 'fish', emoji: '🐟', meaning: '鱼', example: 'I caught a fish in the river.' },
  { id: 12, word: 'house', emoji: '🏠', meaning: '房子', example: 'We live in a small house.' },
  { id: 13, word: 'car', emoji: '🚗', meaning: '汽车', example: 'He drives a red car.' },
  { id: 14, word: 'cup', emoji: '☕', meaning: '杯子', example: 'I need a cup of coffee.' },
  { id: 15, word: 'phone', emoji: '📱', meaning: '手机', example: 'My phone is out of battery.' },
  { id: 16, word: 'milk', emoji: '🥛', meaning: '牛奶', example: 'The baby drinks milk every night.' },
  { id: 17, word: 'egg', emoji: '🥚', meaning: '鸡蛋', example: 'I had an egg for breakfast.' },
  { id: 18, word: 'bread', emoji: '🍞', meaning: '面包', example: 'Can you buy some bread?' },
  { id: 19, word: 'rice', emoji: '🍚', meaning: '米饭', example: 'We eat rice almost every day.' },
  { id: 20, word: 'boy', emoji: '👦', meaning: '男孩', example: 'The boy is playing soccer.' },
  { id: 21, word: 'girl', emoji: '👧', meaning: '女孩', example: 'The girl has a pink dress.' },
  { id: 22, word: 'baby', emoji: '👶', meaning: '婴儿', example: 'The baby is crying.' },
  { id: 23, word: 'hand', emoji: '✋', meaning: '手', example: 'Raise your hand to ask a question.' },
  { id: 24, word: 'eye', emoji: '👁️', meaning: '眼睛', example: 'She has beautiful blue eyes.' },
  { id: 25, word: 'mouth', emoji: '👄', meaning: '嘴巴', example: 'Open your mouth and say ah.' },
  { id: 26, word: 'ear', emoji: '👂', meaning: '耳朵', example: 'Rabbits have long ears.' },
  { id: 27, word: 'nose', emoji: '👃', meaning: '鼻子', example: 'He has a big nose.' },
  { id: 28, word: 'foot', emoji: '🦶', meaning: '脚', example: 'My foot hurts after the long walk.' },
  { id: 29, word: 'bed', emoji: '🛏️', meaning: '床', example: 'It is time to go to bed.' },
  { id: 30, word: 'door', emoji: '🚪', meaning: '门', example: 'Please close the door quietly.' },
  { id: 31, word: 'bag', emoji: '🎒', meaning: '包', example: 'She put the books in her bag.' },
  { id: 32, word: 'pen', emoji: '🖊️', meaning: '笔', example: 'Can I borrow your pen?' },
  { id: 33, word: 'chair', emoji: '🪑', meaning: '椅子', example: 'Please sit on the chair.' },
  { id: 34, word: 'hat', emoji: '🎩', meaning: '帽子', example: 'He wore a black hat.' },
  { id: 35, word: 'ring', emoji: '💍', meaning: '戒指', example: 'She lost her wedding ring.' },
  { id: 36, word: 'key', emoji: '🔑', meaning: '钥匙', example: 'I cannot find my house key.' },
  { id: 37, word: 'lock', emoji: '🔒', meaning: '锁', example: 'Did you lock the door?' },
  { id: 38, word: 'cloud', emoji: '☁️', meaning: '云', example: 'A white cloud is in the sky.' },
  { id: 39, word: 'fire', emoji: '🔥', meaning: '火', example: 'The fire is very hot.' },
  { id: 40, word: 'rain', emoji: '🌧️', meaning: '雨', example: 'It is going to rain today.' },
  { id: 41, word: 'snow', emoji: '❄️', meaning: '雪', example: 'Children love to play in the snow.' },
  { id: 42, word: 'ice', emoji: '🧊', meaning: '冰', example: 'I like ice in my drink.' },
  { id: 43, word: 'clock', emoji: '🕐', meaning: '时钟', example: 'Look at the clock, we are late!' },
  { id: 44, word: 'boat', emoji: '⛵', meaning: '船', example: 'We went fishing on a boat.' },
  { id: 45, word: 'eat', emoji: '🍴', meaning: '吃', example: 'Let us eat lunch together.' },
  { id: 46, word: 'drink', emoji: '🥤', meaning: '喝', example: 'You should drink more water.' },
  { id: 47, word: 'run', emoji: '🏃', meaning: '跑', example: 'He can run very fast.' },
  { id: 48, word: 'sleep', emoji: '😴', meaning: '睡觉', example: 'I need to sleep early tonight.' },
  { id: 49, word: 'swim', emoji: '🏊', meaning: '游泳', example: 'Let us go swim in the pool.' },
]

const LS_KEY = 'en_flashcard-records'
const BOX_GAPS = [2, 4, 8, 16, 32, 64]
const SWIPE_THRESHOLD = 80

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function loadRecords() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
}

function saveRecords(records) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(records)) } catch { /* quota */ }
}

function buildDeck(records) {
  const byBox = {}
  WORDS.forEach((w) => {
    const box = records[w.id]?.box ?? 0
    if (!byBox[box]) byBox[box] = []
    byBox[box].push(w.id)
  })
  const deck = []
  for (let b = 0; b <= 5; b++) deck.push(...shuffle(byBox[b] || []))
  return deck
}

function fireConfetti() {
  confetti({
    particleCount: 40,
    spread: 50,
    origin: { y: 0.55 },
    colors: ['#FF8C69', '#FFB347', '#FFF0EB', '#E07B5A'],
    gravity: 0.8,
    scalar: 0.8,
  })
}

/* ── Card face components ────────────────────────────────── */

function CardFace({ word, playTTS }) {
  return (
    <div className="absolute inset-0 rounded-2xl bg-white border-2 border-slate-200 flex flex-col items-center justify-center gap-3 p-6"
      style={{ backfaceVisibility: 'hidden' }}>
      <motion.span
        className="text-7xl"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {word.emoji}
      </motion.span>
      <motion.span
        className="text-3xl font-bold text-slate-800"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {word.word}
      </motion.span>
      <button
        onClick={(e) => { e.stopPropagation(); playTTS(word.word) }}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors cursor-pointer"
      >
        <Volume2 className="w-4 h-4" />
        播放发音
      </button>
      <p className="text-slate-300 text-xs mt-2">点击翻转 · 左右滑动评分</p>
    </div>
  )
}

function CardBack({ word, onDontKnow, onKnow, pending }) {
  return (
    <div className="absolute inset-0 rounded-2xl bg-white border-2 border-slate-200 flex flex-col items-center justify-center gap-3 p-6"
      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
      <motion.span
        className="text-5xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {word.emoji}
      </motion.span>
      <motion.span
        className="text-2xl font-bold text-slate-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        {word.meaning}
      </motion.span>
      <motion.div
        className="bg-slate-50 rounded-xl p-4 text-center max-w-full"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <p className="text-slate-500 text-sm leading-relaxed">{word.example}</p>
      </motion.div>
      <motion.div
        className="flex gap-3 w-full mt-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onDontKnow() }}
          disabled={pending}
          className="flex-1 py-3 rounded-xl text-base font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
        >
          ✗ 不认识
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onKnow() }}
          disabled={pending}
          className="flex-1 py-3 rounded-xl text-base font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
        >
          ✓ 认识
        </button>
      </motion.div>
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────── */

function FlashcardPage() {
  const [records, setRecords] = useState(loadRecords)
  const [deck, setDeck] = useState(() => buildDeck(loadRecords()))
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [exitDir, setExitDir] = useState(null)
  const [sessionCount, setSessionCount] = useState(0)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [pending, setPending] = useState(false)

  const swipeX = useMotionValue(0)
  const synthRef = useRef(window.speechSynthesis)

  useEffect(() => () => synthRef.current.cancel(), [])

  const currentId = deck[pos]
  const word = WORDS.find((w) => w.id === currentId)
  const mastered = Object.values(records).filter((r) => r.box >= 5).length

  const playTTS = useCallback((text) => {
    synthRef.current.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = 0.75
    synthRef.current.speak(u)
  }, [])

  const answer = useCallback((correct) => {
    if (pending) return
    setPending(true)
    setFlipped(false)

    if (correct) fireConfetti()

    const prevRecord = records[currentId] || { box: 0, correct: 0, wrong: 0 }
    const newBox = correct ? Math.min(5, prevRecord.box + 1) : 0
    const newRecords = {
      ...records,
      [currentId]: {
        box: newBox,
        correct: prevRecord.correct + (correct ? 1 : 0),
        wrong: prevRecord.wrong + (correct ? 0 : 1),
      },
    }
    setRecords(newRecords)
    saveRecords(newRecords)

    setSessionCount((c) => c + 1)
    if (correct) setSessionCorrect((c) => c + 1)
    setExitDir(correct ? 'right' : 'left')

    setTimeout(() => {
      setDeck((prevDeck) => {
        const d = [...prevDeck]
        d.splice(pos, 1)
        const gap = correct ? BOX_GAPS[newBox] : 2 + Math.floor(Math.random() * 3)
        d.splice(Math.min(pos + gap, d.length), 0, currentId)
        return d
      })
      setPos((p) => (p >= deck.length - 1 ? 0 : p))
      setExitDir(null)
      setPending(false)
      swipeX.set(0)
    }, 400)
  }, [pending, currentId, records, pos, deck.length, swipeX])

  const swipeHandlers = useSwipeable({
    onSwiping: ({ deltaX }) => {
      if (!flipped) {
        swipeX.set(Math.max(-120, Math.min(120, deltaX)))
      }
    },
    onSwipedLeft: () => { if (!flipped) answer(false) },
    onSwipedRight: () => { if (!flipped) answer(true) },
    onSwiped: () => { if (!flipped) swipeX.set(0) },
    trackMouse: true,
    delta: SWIPE_THRESHOLD,
    swipeDuration: 500,
    preventScrollOnSwipe: true,
  })

  const handleFlip = () => { if (!pending) setFlipped((f) => !f) }

  if (!word) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-slate-400">没有可学习的卡片</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-4 select-none">
      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
        <span>本轮 {sessionCount} 张</span>
        <span className="flex gap-3">
          <span className="text-emerald-600">✓ {sessionCorrect}</span>
          <span className="text-red-400">✗ {sessionCount - sessionCorrect}</span>
        </span>
        <span>已掌握 {mastered}/50</span>
      </div>

      {/* Progress */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6">
        <motion.div
          className="bg-primary h-1.5 rounded-full"
          animate={{ width: `${(mastered / 50) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Card area */}
      <div className="relative" style={{ perspective: 1200 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentId}
            {...swipeHandlers}
            onClick={handleFlip}
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              x: flipped ? 0 : swipeX.get(),
              rotate: flipped ? 0 : swipeX.get() * 0.05,
              transition: {
                x: { type: 'spring', stiffness: 500, damping: 40 },
                rotate: { type: 'spring', stiffness: 500, damping: 40 },
              },
            }}
            exit={{
              x: exitDir === 'right' ? 250 : -250,
              rotate: exitDir === 'right' ? 20 : -20,
              opacity: 0,
              transition: { duration: 0.35, ease: 'easeIn' },
            }}
            className="relative w-full aspect-[4/5] cursor-pointer"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
            >
              <CardFace word={word} playTTS={playTTS} />
              <CardBack
                word={word}
                onDontKnow={() => answer(false)}
                onKnow={() => answer(true)}
                pending={pending}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Swipe indicators */}
        <AnimatePresence>
          {!flipped && !pending && (
            <>
              <motion.div
                className="absolute top-1/2 -left-2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full pointer-events-none z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
              >
                不认识
              </motion.div>
              <motion.div
                className="absolute top-1/2 -right-2 -translate-y-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full pointer-events-none z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
              >
                认识
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom buttons */}
      {!flipped && !pending && (
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => answer(false)}
            className="flex-1 py-3 rounded-xl text-base font-semibold border-2 border-red-200 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            ✗ 不认识
          </button>
          <button
            onClick={handleFlip}
            className="flex-1 py-3 rounded-xl text-base font-medium border-2 border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            🔄 翻转
          </button>
          <button
            onClick={() => answer(true)}
            className="flex-1 py-3 rounded-xl text-base font-semibold border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            ✓ 认识
          </button>
        </div>
      )}

      {flipped && !pending && (
        <p className="text-center text-slate-300 text-xs mt-4">
          点击卡片空白处翻回正面
        </p>
      )}

      {/* Reset */}
      <div className="mt-10 text-center">
        <button
          onClick={() => {
            if (confirm('确定要清除所有闪卡学习记录吗？')) {
              setRecords({})
              localStorage.removeItem(LS_KEY)
              setDeck(buildDeck({}))
              setPos(0)
              setSessionCount(0)
              setSessionCorrect(0)
            }
          }}
          className="text-sm text-slate-300 hover:text-red-400 transition-colors cursor-pointer"
        >
          重置所有进度
        </button>
      </div>
    </div>
  )
}

export default FlashcardPage
