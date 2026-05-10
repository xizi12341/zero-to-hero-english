import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import HomePage from './components/HomePage'
import PhoneticPage from './components/PhoneticPage'
import FlashcardPage from './components/FlashcardPage'
import ImmersionPage from './components/ImmersionPage'
import SpeakPage from './components/SpeakPage'
import GrammarPage from './components/GrammarPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-warm">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/phonetic" element={<PhoneticPage />} />
          <Route path="/flashcard" element={<FlashcardPage />} />
          <Route path="/immersion" element={<ImmersionPage />} />
          <Route path="/grammar" element={<GrammarPage />} />
          <Route path="/speak" element={<SpeakPage />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

export default App
