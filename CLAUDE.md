# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Production build to dist/
npm run preview    # Preview production build
npm run lint       # ESLint
```

## Architecture

**Stack:** React 19 + Vite 8 + Tailwind CSS 4 + React Router 7. Animation libraries: framer-motion (page/card animations), canvas-confetti (celebration effects), react-swipeable (swipe gestures), lucide-react (icons). This is a client-side SPA for English learning aimed at Chinese beginners. All UI text is bilingual (Chinese/English). No backend — all persistence is client-side localStorage.

**Routes** (defined in `src/App.jsx`):

| Path | Page | Purpose |
|------|------|---------|
| `/` | HomePage | Dashboard with auto-generated daily task checklist, quick-access grid, learning stats |
| `/phonetic` | PhoneticPage | 48 IPA phoneme grid with TTS, recording comparison, learned tracking |
| `/flashcard` | FlashcardPage | 50-word SRS flashcard deck with framer-motion 3D flip, react-swipeable gestures, confetti on correct |
| `/immersion` | ImmersionPage | Two-tab: Peppa Pig/YouTube recommendations + Twinkle lyrics; 10-sentence dictation |
| `/grammar` | GrammarPage | Three tense cards (be/simple present/simple past) with fill-in-the-blank + instant check |
| `/speak` | SpeakPage | Shadowing practice (TTS + long-press record + compare + star rating); collapsible AI chat partner via Claude API |

**Layout:** `Header` (sticky top, logo only) → page content → `BottomNav` (fixed bottom, 5 tabs: 首页/发音/单词/听口/语法). The `/speak` route is not in bottom nav — it is reached from the daily task list on HomePage.

## localStorage Keys (cross-module dependency)

All keys use the `en_` prefix to avoid conflicts with other sites on the same domain. HomePage reads all other modules' storage to compute daily progress via a baseline-snapshot mechanism:

| Key | Module | Shape |
|-----|--------|-------|
| `en_ipa-learned` | PhoneticPage | `string[]` of learned IPA symbols |
| `en_flashcard-records` | FlashcardPage | `{ [wordId]: { box, correct, wrong } }` |
| `en_shadowing-stats` | SpeakPage | `{ count, totalStars }` |
| `en_grammar-scores` | GrammarPage | `{ date, score, total }[]` |
| `en_dictation-scores` | ImmersionPage | `{ date, score, total }[]` |
| `en_speak-ai-config` | SpeakPage | `{ apiKey, modelId }` |
| `en_daily-snapshot` | HomePage | `{ date, phonetic, flashcard, shadowing, grammar, dictation }` — baseline values for today's progress calculation |
| `en_activity-log` | HomePage | `{ "2026-05-10": 25, "2026-05-09": 18, ... }` — daily estimated minutes, auto-archived when a new day is detected |

HomePage top section renders a 7-day heatmap (SVG bars, color intensity by minutes) and a circular progress ring (SVG `stroke-dasharray`, animates with framer-motion). Minutes are estimated per module (e.g. each flashcard = 0.5 min, each shadowing = 3 min) via `MINUTES_PER_UNIT`.
When adding new module-level storage, update HomePage's `DAILY_TASKS` array so it appears in the daily checklist.

## Tailwind v4 conventions

- Custom theme tokens defined in `src/index.css` via `@theme`: `--color-primary` (coral `#FF8C69`), `--color-primary-dark` (`#E07B5A`), `--color-primary-light` (`#FFF0EB`), `--color-accent` (golden amber `#FFB347`), `--color-warm` (cream `#fefcf3`).
- Global page background uses `bg-warm` (warm cream) for comfortable extended study sessions. Cards and header use `bg-white` for contrast.
- Tailwind v4 uses `@import "tailwindcss"` in CSS (no `tailwind.config.js`). The Vite plugin `@tailwindcss/vite` handles processing.
- Mobile-first: pages use `max-w-lg` or `max-w-md` containers with `px-4 py-4`, meant for portrait phone layout.
- BottomNav uses `fixed bottom-0` — page content needs `pb-24` to avoid being hidden.
- Font stack in `index.css` prioritizes system fonts with good CJK support (`Noto Sans SC`, `PingFang SC`, `Microsoft YaHei`).

## Component patterns

- All pages are in `src/components/` (named `*Page.jsx`). They are self-contained with their own sub-components in the same file.
- Audio: TTS uses `window.speechSynthesis` (always cancel before new utterance, set `lang: 'en-US'`, `rate: 0.7` or lower). Recording uses `navigator.mediaDevices.getUserMedia` + `MediaRecorder` with `'audio/webm'` MIME type, output as Blob played via `URL.createObjectURL` + `new Audio()`.
- localStorage reads/writes are wrapped in try/catch for quota/parse errors, with safe fallbacks.
