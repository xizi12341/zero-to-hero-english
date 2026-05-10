const skills = [
  { key: 'vocabulary', label: '词汇量', icon: '📝' },
  { key: 'grammar', label: '语法', icon: '📐' },
  { key: 'reading', label: '阅读', icon: '📖' },
  { key: 'listening', label: '听力', icon: '🎧' },
]

function ProgressBar({ progress }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">学习进度 Learning Progress</h2>
      <div className="space-y-4">
        {skills.map(({ key, label, icon }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="w-8 text-center">{icon}</span>
            <span className="w-16 text-sm text-slate-600">{label}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress[key]}%` }}
              />
            </div>
            <span className="text-sm font-medium text-slate-700 w-10 text-right">
              {progress[key]}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProgressBar
