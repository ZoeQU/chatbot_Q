import { create } from 'zustand'

export const useChatStore = create((set, get) => ({
  sessions: [],
  currentSessionId: null,
  messages: [],
  streaming: false,
  streamContent: '',
  characterEmotion: 'idle', // idle | thinking | talking | happy | error

  setSessions: (sessions) => set({ sessions }),
  setCurrentSessionId: (id) => set({ currentSessionId: id }),
  setMessages: (messages) => set({ messages }),
  setCharacterEmotion: (characterEmotion) => set({ characterEmotion }),

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, { ...msg, id: msg.id ?? Date.now() }] })),

  appendStreamContent: (text) =>
    set((s) => ({ streamContent: s.streamContent + text })),

  setStreaming: (v) => set({ streaming: v }),
  clearStreamContent: () => set({ streamContent: '' }),

  finishStreamAsMessage: (sessionId) => {
    const { streamContent: content, messages } = get()
    if (!content) return
    set({
      streamContent: '',
      streaming: false,
      messages: [
        ...messages,
        { id: `stream-${Date.now()}`, session_id: sessionId, role: 'assistant', content, created_at: new Date().toISOString() },
      ],
    })
  },

  removeSessionFromList: (sessionId) =>
    set((s) => ({
      sessions: s.sessions.filter((x) => x.id !== sessionId),
      currentSessionId: s.currentSessionId === sessionId ? null : s.currentSessionId,
      messages: s.currentSessionId === sessionId ? [] : s.messages,
    })),
}))
