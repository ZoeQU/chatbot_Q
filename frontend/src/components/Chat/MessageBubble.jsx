import { motion } from 'framer-motion'

export default function MessageBubble({ role, content, isStreaming }) {
  const isUser = role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-pixel ${
          isUser ? 'bg-pm-user text-zinc-100' : 'bg-pm-ai text-zinc-200'
        }`}
      >
        <div className="whitespace-pre-wrap break-words text-sm">
          {content}
          {isStreaming && (
            <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-current align-middle" />
          )}
        </div>
      </div>
    </motion.div>
  )
}
