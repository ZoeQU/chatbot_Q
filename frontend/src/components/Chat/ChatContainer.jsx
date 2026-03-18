import { useEffect, useRef } from 'react'
import { useChatStore } from '../../stores/chatStore'
import { sendMessageStream } from '../../services/api'
import MessageBubble from './MessageBubble'
import InputBar from './InputBar'

export default function ChatContainer() {
  const {
    currentSessionId,
    messages,
    streaming,
    streamContent,
    addMessage,
    appendStreamContent,
    setStreaming,
    clearStreamContent,
    finishStreamAsMessage,
    setCurrentSessionId,
    setSessions,
    setCharacterEmotion,
  } = useChatStore()
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, streamContent])

  const handleSend = async (content) => {
    addMessage({ role: 'user', content })
    setStreaming(true)
    clearStreamContent()
    setCharacterEmotion('thinking')
    let doneSessionId = null
    try {
      await sendMessageStream(
        { sessionId: currentSessionId ?? undefined, content },
        {
          onToken: (token) => {
            useChatStore.getState().setCharacterEmotion('talking')
            appendStreamContent(token)
          },
          onDone: (sessionId) => {
            if (sessionId) doneSessionId = sessionId
            // If no token arrived, show a visible hint instead of "no reply".
            if (!useChatStore.getState().streamContent) {
              useChatStore.getState().addMessage({
                role: 'assistant',
                content: '[提示] 收到结束信号但没有文本内容（可能是流式解析或后端未产生 token）。请重试或查看后端日志。',
              })
            } else {
              useChatStore.getState().finishStreamAsMessage(doneSessionId ?? currentSessionId)
            }
            useChatStore.getState().setStreaming(false)
            useChatStore.getState().clearStreamContent()
            useChatStore.getState().setCharacterEmotion('happy')
            setTimeout(() => {
              useChatStore.getState().setCharacterEmotion('idle')
            }, 900)
            if (doneSessionId && !currentSessionId) {
              useChatStore.getState().setCurrentSessionId(doneSessionId)
              import('../../services/api').then(({ getChatHistory }) =>
                getChatHistory().then(({ sessions }) => useChatStore.getState().setSessions(sessions))
              )
            }
          },
          onError: (err) => {
            addMessage({ role: 'assistant', content: `[错误] ${err}` })
            setStreaming(false)
            clearStreamContent()
            setCharacterEmotion('error')
            setTimeout(() => {
              useChatStore.getState().setCharacterEmotion('idle')
            }, 1200)
          },
        }
      )
    } finally {
      setStreaming(false)
      clearStreamContent()
      setCharacterEmotion('idle')
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto p-4"
      >
        {messages.length === 0 && !streaming && !streamContent && (
          <div className="flex h-32 items-center justify-center text-sm text-zinc-500">
            发一条消息开始对话，或从左侧选择历史会话
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            isStreaming={false}
          />
        ))}
        {streamContent && (
          <MessageBubble role="assistant" content={streamContent} isStreaming={streaming} />
        )}
      </div>
      <div className="border-t border-white/10 p-3">
        <InputBar onSend={handleSend} disabled={streaming} />
      </div>
    </div>
  )
}
