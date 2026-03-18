import { useEffect, useState } from 'react'
import { getHealth } from './services/api'
import Sidebar from './components/Sidebar/Sidebar'
import ChatContainer from './components/Chat/ChatContainer'
import CharacterCanvas from './components/PixelCharacter/CharacterCanvas'

export default function App() {
  const [health, setHealth] = useState({ status: 'checking' })
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    getHealth()
      .then((data) => {
        if (!cancelled) setHealth(data)
      })
      .catch((e) => {
        if (!cancelled) setError(String(e?.message ?? e))
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-pm-bg text-zinc-100">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-pm-accent shadow-pixel" />
          <div>
            <div className="font-pixel text-sm leading-5">小西</div>
            <div className="text-xs text-zinc-300">Phase 2 · 聊天</div>
          </div>
        </div>
        <div className="text-xs text-zinc-300">
          Backend:{' '}
          {error ? (
            <span className="text-pm-danger">error</span>
          ) : (
            <span className="text-pm-accent">{health.status ?? 'unknown'}</span>
          )}
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-6 pb-10 md:grid-cols-[260px_1fr_220px]">
        <Sidebar />
        <section className="min-h-[70vh] rounded-xl bg-pm-panel/70 shadow-pixel">
          <div className="flex h-full min-h-[70vh] flex-col">
            <ChatContainer />
          </div>
        </section>
        <div className="md:sticky md:top-6 md:self-start">
          <CharacterCanvas />
        </div>
      </main>
    </div>
  )
}
