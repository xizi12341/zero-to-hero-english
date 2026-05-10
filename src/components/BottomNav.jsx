import { NavLink, useLocation } from 'react-router-dom'

const TABS = [
  { to: '/', icon: '🏠', label: '首页' },
  { to: '/phonetic', icon: '🔊', label: '发音' },
  { to: '/flashcard', icon: '📖', label: '单词' },
  { to: '/immersion', icon: '🎧', label: '听口' },
  { to: '/grammar', icon: '📝', label: '语法' },
]

function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-20 safe-area-bottom">
      <div className="max-w-lg mx-auto flex justify-around py-1.5">
        {TABS.map(({ to, icon, label }) => {
          const active = location.pathname === to
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-0 ${
                active ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="text-xl">{icon}</span>
              <span className={`text-[10px] font-medium ${active ? 'text-primary' : ''}`}>
                {label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
