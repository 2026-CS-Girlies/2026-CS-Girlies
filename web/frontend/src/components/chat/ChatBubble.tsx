import type { ReactNode } from 'react'
import { tk } from '@/theme/tokens'

type Props = {
  role: 'user' | 'assistant'
  isLight: boolean
  children: ReactNode
  quoted?: boolean
}

export default function ChatBubble({ role, isLight, children, quoted = false }: Props) {
  const c = tk(isLight)
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] px-4 py-3 text-sm ${quoted ? 'rounded-tl-[18px] rounded-tr-[18px] rounded-bl-[18px]' : 'rounded-[18px]'}`}
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          ...(isUser
            ? { background: c.userBubbleBg, border: `1px solid ${c.userBubbleBorder}`, color: c.userBubbleText }
            : { background: c.asstBubbleBg, border: `1px solid ${c.asstBubbleBorder}`, color: c.asstBubbleText }),
        }}
      >
        {children}
      </div>
    </div>
  )
}
