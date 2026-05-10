function WordList({ words }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">今日单词 Today's Words</h2>
      <div className="divide-y divide-slate-100">
        {words.map(({ word, pos, meaning }) => (
          <div key={word} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-slate-800">{word}</span>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                {pos}
              </span>
            </div>
            <span className="text-sm text-slate-500">{meaning}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WordList
