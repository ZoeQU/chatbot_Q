import ConversationList from './ConversationList'

export default function Sidebar() {
  return (
    <aside className="flex flex-col rounded-xl bg-pm-panel/70 p-4 shadow-pixel">
      <div className="mb-3 font-pixel text-xs">对话历史</div>
      <ConversationList />
      <div className="mt-4 border-t border-white/10 pt-3">
        <div className="font-pixel text-[10px] text-zinc-500">记忆面板（Phase 4）</div>
      </div>
    </aside>
  )
}
