const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000'

async function httpJson(path, init = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} ${res.statusText}${body ? `: ${body}` : ''}`)
  }
  return await res.json()
}

export function getHealth() {
  return httpJson('/api/health')
}

export function getChatHistory() {
  return httpJson('/api/chat/history')
}

export function getSessionMessages(sessionId) {
  return httpJson(`/api/chat/history/${sessionId}`)
}

export function createSession() {
  return httpJson('/api/chat/new', { method: 'POST' })
}

export function deleteSession(sessionId) {
  return httpJson(`/api/chat/${sessionId}`, { method: 'DELETE' })
}

/**
 * Send a message and consume SSE stream.
 * @param {{ sessionId?: string, content: string }} params
 * @param {{ onToken: (text: string) => void, onDone: (sessionId?: string) => void, onError: (err: string) => void }} handlers
 */
export async function sendMessageStream(params, { onToken, onDone, onError }) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: params.sessionId ?? null,
      content: params.content,
      file_ids: params.fileIds ?? null,
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    onError(`HTTP ${res.status}: ${text}`)
    return
  }
  const { parseSSE } = await import('./stream.js')
  await parseSSE(res.body, { onToken, onDone, onError })
}

