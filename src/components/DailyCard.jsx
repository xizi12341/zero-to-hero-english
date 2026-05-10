function DailyCard({ phrase, onNext }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 text-center border border-slate-100">
      <div className="text-sm text-accent font-semibold uppercase tracking-wide mb-2">
        📖 每日短语 Daily Phrase
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">{phrase.en}</h2>
      <p className="text-slate-500 text-lg mb-4">{phrase.zh}</p>
      <div className="bg-slate-50 rounded-lg p-4 text-slate-600 italic">
        &ldquo;{phrase.example}&rdquo;
      </div>
      <button
        onClick={onNext}
        className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
      >
        下一个 →
      </button>
    </div>
  )
}

export default DailyCard
