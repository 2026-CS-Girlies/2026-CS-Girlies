import type { KeyboardEvent, ReactNode, RefObject } from 'react'
import SendIcon from '@/components/common/SendIcon'
import ChatBubble from '@/components/chat/ChatBubble'
import { tk } from '@/theme/tokens'
import type { Message } from '@/types/chat'

type Props = {
  isLight: boolean
  messages: Message[]
  openingThought: string
  input: string
  onInputChange: (value: string) => void
  onSend: () => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  isLoading: boolean
  isComplete: boolean
  error?: string
  placeholder?: string
  completePlaceholder?: string
  bottomRef: RefObject<HTMLDivElement | null>
  inputRef?: RefObject<HTMLInputElement | null>
  children?: ReactNode
  inputActions?: ReactNode
}

export default function ChatPanel({ isLight, messages, openingThought, input, onInputChange, onSend, onKeyDown, isLoading, isComplete, error, placeholder = 'Type your response...', completePlaceholder = 'Ready for your reflection', bottomRef, inputRef, children, inputActions }: Props) {
  const c = tk(isLight)

  return (
    <div className="relative z-10 flex-1 flex flex-col mx-3 md:mx-6 mb-3 md:mb-5 rounded-[24px] overflow-hidden" style={{ background: c.panelBg, border: `1px solid ${c.border}`, backdropFilter: 'blur(28px) saturate(1.4)', boxShadow: c.panelShadow }}>
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 flex flex-col gap-3 md:gap-4">
        <ChatBubble role="user" isLight={isLight} quoted><p className="font-medium">"{openingThought}"</p></ChatBubble>

        {messages.map(message => (
          <ChatBubble key={message.id} role={message.role} isLight={isLight}>{message.text}</ChatBubble>
        ))}

        {children}
        {isLoading && <div className="text-sm" style={{ color: c.textMuted }}>Thinking…</div>}
        {error && <div className="text-sm text-[#ff6b6b]">{error}</div>}
        <div ref={bottomRef} />
      </div>

      <div className="flex-none px-4 md:px-8 pt-3 pb-2 flex flex-col gap-2" style={{ borderTop: `1px solid ${c.divider}` }}>
        {inputActions}

        <div className="flex items-center gap-3 rounded-2xl px-4 py-2.5 md:py-3" style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, backdropFilter: 'blur(8px)' }}>
          <input ref={inputRef} className="flex-1 text-sm outline-none bg-transparent min-w-0" style={{ fontFamily: 'Inter, sans-serif', color: c.inputText }} placeholder={isComplete ? completePlaceholder : placeholder} value={input} onChange={event => onInputChange(event.target.value)} onKeyDown={onKeyDown} disabled={isLoading || isComplete} />
          <button onClick={onSend} disabled={isLoading || isComplete} className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40 transition-all active:scale-90" style={{ background: c.sendBg, border: `1px solid ${c.sendBorder}` }} aria-label="Send message">
            <SendIcon color={isLight ? '#444' : '#BBBBBB'} />
          </button>
        </div>
      </div>
    </div>
  )
}
