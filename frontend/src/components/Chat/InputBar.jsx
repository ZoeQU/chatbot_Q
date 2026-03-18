import { useState, useRef } from 'react'

export default function InputBar({ onSend, disabled }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  const handleSubmit = (e) => {
    e?.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex items-end gap-2 rounded-xl bg-pm-panel/80 p-2 shadow-pixel">
        <button
          type="button"
          className="rounded-lg bg-black/30 p-2 text-zinc-400 transition hover:bg-black/50"
          title="上传文件（Phase 3）"
        >
          📎
        </button>
        <button
          type="button"
          className="rounded-lg bg-black/30 p-2 text-zinc-400 transition hover:bg-black/50"
          title="语音（即将上线）"
          onClick={() => alert('语音功能即将上线')}
        >
          🎤
        </button>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息，Enter 发送..."
          rows={1}
          className="min-h-[44px] flex-1 resize-none rounded-lg bg-black/25 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-pm-accent"
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className="rounded-lg bg-pm-accent px-4 py-3 font-medium text-black transition disabled:opacity-50 hover:enabled:opacity-90"
        >
          ➤
        </button>
      </div>
    </form>
  )
}
