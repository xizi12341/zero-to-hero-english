import { useState, useEffect, useRef } from 'react'

const SCORES_KEY = 'en_grammar-scores'

const TENSES = [
  {
    name: 'Be 动词',
    nameEn: 'Be Verbs (am / is / are)',
    color: 'blue',
    explanation:
      'am 搭配 I，is 搭配 he / she / it 和单数名词，are 搭配 you / we / they 和复数名词。',
    questions: [
      { parts: ['I ', ' a student.'], hint: 'be', answer: 'am' },
      { parts: ['She ', ' my friend.'], hint: 'be', answer: 'is' },
      { parts: ['They ', ' happy.'], hint: 'be', answer: 'are' },
      { parts: ['The cat ', ' small.'], hint: 'be', answer: 'is' },
      { parts: ['We ', ' teachers.'], hint: 'be', answer: 'are' },
    ],
  },
  {
    name: '一般现在时',
    nameEn: 'Simple Present',
    color: 'emerald',
    explanation:
      '表示经常发生的动作或状态。主语是 he / she / it 或单数名词时，动词加 -s 或 -es；其他人称用原形。',
    questions: [
      { parts: ['She ', ' cats.'], hint: 'like', answer: 'likes' },
      { parts: ['They ', ' soccer every day.'], hint: 'play', answer: 'play' },
      { parts: ['He ', ' to school at 8:00.'], hint: 'go', answer: 'goes' },
      { parts: ['I ', ' breakfast at 7:00.'], hint: 'eat', answer: 'eat' },
      { parts: ['The dog ', ' fast.'], hint: 'run', answer: 'runs' },
    ],
  },
  {
    name: '一般过去时',
    nameEn: 'Simple Past',
    color: 'purple',
    explanation:
      '表示过去发生的动作。规则动词加 -ed（如 walk → walked），不规则动词需特殊记忆（如 go → went）。',
    questions: [
      { parts: ['I ', ' to school yesterday.'], hint: 'walk', answer: 'walked' },
      { parts: ['She ', ' the piano last night.'], hint: 'play', answer: 'played' },
      { parts: ['He ', ' to the park.'], hint: 'go', answer: 'went' },
      { parts: ['They ', ' a movie.'], hint: 'see', answer: 'saw' },
      { parts: ['We ', ' pizza for dinner.'], hint: 'eat', answer: 'ate' },
    ],
  },
]

const COLOR_MAP = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
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

function GrammarPage() {
  const [answers, setAnswers] = useState(() =>
    TENSES.map((t) => t.questions.map(() => ''))
  )
  const [checked, setChecked] = useState(() =>
    TENSES.map((t) => t.questions.map(() => false))
  )
  const [allChecked, setAllChecked] = useState(false)
  const [scores, setScores] = useState(loadScores)
  const inputRefs = useRef([])

  // Calculate scores
  let totalCorrect = 0
  let totalQuestions = 0
  const tenseResults = TENSES.map((tense, ti) => {
    let correct = 0
    tense.questions.forEach((q, qi) => {
      totalQuestions++
      if (checked[ti]?.[qi]) {
        if (answers[ti][qi].trim().toLowerCase() === q.answer.toLowerCase()) {
          correct++
          totalCorrect++
        }
      }
    })
    return { correct, total: tense.questions.length }
  })

  const handleInput = (ti, qi, val) => {
    const next = answers.map((row) => [...row])
    next[ti][qi] = val
    setAnswers(next)
  }

  const handleCheckOne = (ti, qi) => {
    const next = checked.map((row) => [...row])
    next[ti][qi] = true
    setChecked(next)
  }

  const handleCheckAll = () => {
    const next = TENSES.map((t) => t.questions.map(() => true))
    setChecked(next)
    setAllChecked(true)

    // Save score
    const finalCorrect = TENSES.reduce((sum, tense, ti) => {
      return sum + tense.questions.filter((q, qi) => {
        return answers[ti][qi].trim().toLowerCase() === q.answer.toLowerCase()
      }).length
    }, 0)
    const record = {
      date: new Date().toISOString(),
      score: finalCorrect,
      total: totalQuestions,
    }
    const updated = [record, ...scores]
    setScores(updated)
    saveScores(updated)
  }

  const handleReset = () => {
    setAnswers(TENSES.map((t) => t.questions.map(() => '')))
    setChecked(TENSES.map((t) => t.questions.map(() => false)))
    setAllChecked(false)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-5 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">语法练习</h2>
        {allChecked && (
          <span className="text-lg font-bold text-primary">
            {totalCorrect}/{totalQuestions} 分
          </span>
        )}
      </div>

      {TENSES.map((tense, ti) => {
        const c = COLOR_MAP[tense.color]
        const result = tenseResults[ti]
        return (
          <div
            key={ti}
            className={`rounded-xl border shadow-sm overflow-hidden ${c.bg} ${c.border}`}
          >
            {/* Tense header */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${c.badge}`}
                >
                  {tense.name}
                </span>
                <span className="text-xs text-slate-400">{tense.nameEn}</span>
                {allChecked && (
                  <span className="ml-auto text-sm font-bold text-slate-600">
                    {result.correct}/{result.total}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {tense.explanation}
              </p>
            </div>

            {/* Questions */}
            <div className="bg-white border-t border-slate-100 p-4 space-y-3">
              {tense.questions.map((q, qi) => {
                const isChecked = checked[ti]?.[qi]
                const userAns = answers[ti][qi].trim()
                const isCorrect =
                  isChecked && userAns.toLowerCase() === q.answer.toLowerCase()

                return (
                  <div key={qi} className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm text-slate-700">{q.parts[0]}</span>
                    <div className="relative inline-flex items-center">
                      <input
                        type="text"
                        value={answers[ti][qi]}
                        onChange={(e) => handleInput(ti, qi, e.target.value)}
                        onBlur={() => {
                          if (answers[ti][qi].trim()) handleCheckOne(ti, qi)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCheckOne(ti, qi)
                        }}
                        disabled={allChecked}
                        className={`w-20 px-2 py-1 rounded border text-sm text-center font-medium focus:outline-none focus:ring-1 transition-colors ${
                          isChecked
                            ? isCorrect
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                              : 'border-red-400 bg-red-50 text-red-700'
                            : 'border-slate-300 focus:border-primary focus:ring-primary/30'
                        } disabled:cursor-default`}
                      />
                    </div>
                    <span className="text-sm text-slate-700">{q.parts[1]}</span>
                    <span className="text-xs text-slate-400 ml-0.5">
                      ({q.hint})
                    </span>
                    {isChecked && (
                      <span className="text-sm ml-1">
                        {isCorrect ? (
                          <span className="text-emerald-500">✓</span>
                        ) : (
                          <span className="text-red-500">
                            ✗ <span className="font-medium">{q.answer}</span>
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Actions */}
      <div className="flex gap-2">
        {!allChecked ? (
          <button
            onClick={handleCheckAll}
            className="flex-1 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors cursor-pointer"
          >
            全部提交 · 查看成绩
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 transition-colors cursor-pointer"
          >
            重新练习
          </button>
        )}
      </div>

      {/* Score summary after submission */}
      {allChecked && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">
            📊 本次成绩
          </h3>
          {tenseResults.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="text-slate-500 w-20">{TENSES[i].name}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    r.correct === r.total
                      ? 'bg-emerald-400'
                      : r.correct >= r.total / 2
                        ? 'bg-amber-400'
                        : 'bg-red-400'
                  }`}
                  style={{ width: `${(r.correct / r.total) * 100}%` }}
                />
              </div>
              <span className="text-slate-600 font-medium w-12 text-right">
                {r.correct}/{r.total}
              </span>
            </div>
          ))}
          <div className="pt-2 border-t border-slate-100 flex justify-between text-sm">
            <span className="text-slate-500">总分</span>
            <span className="font-bold text-primary">
              {totalCorrect}/{totalQuestions}
            </span>
          </div>
        </div>
      )}

      {/* History */}
      {scores.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            📝 历史成绩
          </h3>
          <div className="space-y-2">
            {scores.slice(0, 5).map((s, i) => (
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
                <span
                  className={`font-medium ${
                    s.score === s.total
                      ? 'text-emerald-500'
                      : s.score >= s.total / 2
                        ? 'text-amber-500'
                        : 'text-red-400'
                  }`}
                >
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

export default GrammarPage
