import { useChatStore } from '../../stores/chatStore'
import { getChatHistory, getSessionMessages, createSession, deleteSession } from '../../services/api'
import { useEffect } from 'react'

export default function ConversationList() {
  const {
    sessions,
    currentSessionId,
    setSessions,
    setCurrentSessionId,
    setMessages,
    removeSessionFromList,
  } = useChatStore()

  useEffect(() => {
    getChatHistory()
      .then(({ sessions: list }) => setSessions(list))
      .catch(() => {})
  }, [setSessions])

  const loadSession = (sessionId) => {
    setCurrentSessionId(sessionId)
    getSessionMessages(sessionId)
      .then(({ messages }) => setMessages(messages))
      .catch(() => setMessages([]))
  }

  const handleNewChat = () => {
    createSession()
      .then(({ session_id }) => {
        setCurrentSessionId(session_id)
        setMessages([])
        return getChatHistory()
      })
      .then(({ sessions: list }) => setSessions(list))
      .catch(() => {})
  }

  const handleDelete = (e, sessionId) => {
    e.stopPropagation()
    if (!confirm('确定删除这条对话？')) return
    deleteSession(sessionId)
      .then(() => removeSessionFromList(sessionId))
      .catch(() => {})
  }

  const formatDate = (s) => {
    if (!s) return ''
    const d = new Date(s)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleNewChat}
        className="w-full rounded-lg bg-pm-accent/20 py-2.5 text-center text-sm font-medium text-pm-accent transition hover:bg-pm-accent/30"
      >
        + 新对话
      </button>
      <div className="max-h-[50vh] space-y-1 overflow-y-auto">
        {sessions.map((s) => (
          <button
            type="button"
            key={s.id}
            onClick={() => loadSession(s.id)}
            className={`group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${
              currentSessionId === s.id ? 'bg-pm-accent/25 text-zinc-100' : 'bg-black/25 text-zinc-300 hover:bg-black/40'
            }`}
          >
            <span className="min-w-0 flex-1 truncate">{s.title || '新对话'}</span>
            <span className="shrink-0 text-xs text-zinc-500">{formatDate(s.updated_at)}</span>
            <button
              type="button"
              onClick={(e) => handleDelete(e, s.id)}
              className="shrink-0 rounded p-1 opacity-0 transition hover:bg-black/40 group-hover:opacity-100"
              title="删除"
            >
              🗑
            </button>
          </button>
        ))}
      </div>
    </div>
  )
}
