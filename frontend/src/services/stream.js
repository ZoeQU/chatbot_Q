/**
 * Parse SSE stream from fetch response and invoke callbacks.
 * @param {ReadableStream} body
 * @param {{ onToken: (content: string) => void, onDone: (sessionId?: string) => void, onError: (err: string) => void }} handlers
 */
export async function parseSSE(body, { onToken, onDone, onError }) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let didCallDone = false
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      let event = null
      for (const line of lines) {
        if (line.startsWith('event:')) {
          event = line.slice(6).trim()
        } else if (line.startsWith('data:') && event) {
          try {
            const data = JSON.parse(line.slice(5).trim())
            if (event === 'token' && data.content != null) {
              onToken(data.content)
            } else if (event === 'done') {
              if (!didCallDone) {
                didCallDone = true
                onDone(data.session_id)
              }
            } else if (event === 'error') {
              onError(data.error ?? 'Unknown error')
            }
          } catch (_) {}
          event = null
        }
      }
    }
    if (buffer.trim()) {
      try {
        if (buffer.startsWith('data:')) {
          const data = JSON.parse(buffer.slice(5).trim())
          if (data.content != null) onToken(data.content)
          if (data.session_id && !didCallDone) {
            didCallDone = true
            onDone(data.session_id)
          }
        }
      } catch (_) {}
    }
  } catch (e) {
    onError(e?.message ?? String(e))
  }
}
