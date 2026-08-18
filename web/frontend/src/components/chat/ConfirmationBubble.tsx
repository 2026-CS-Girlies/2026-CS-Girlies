import ChatBubble from '@/components/chat/ChatBubble'
import { tk } from '@/theme/tokens'

type Props = {
  isLight: boolean
  message: React.ReactNode
  rejectLabel: string
  confirmLabel: string
  onReject: () => void
  onConfirm: () => void
}

export default function ConfirmationBubble({
  isLight,
  message,
  rejectLabel,
  confirmLabel,
  onReject,
  onConfirm,
}: Props) {
  const c = tk(isLight)

  return (
    <ChatBubble role="assistant" isLight={isLight}>
      <div className="text-sm font-medium leading-relaxed">
        {message}
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          type="button"
          onClick={onReject}
          className="text-sm px-4 py-2 rounded-full hover:opacity-80 transition-opacity"
          style={{
            color: c.textMuted,
            border: `1px solid ${c.border}`,
          }}
        >
          {rejectLabel}
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className="demo-ready-sparkle text-sm px-4 py-2 rounded-full hover:opacity-80 transition-all"
          style={{
            background: c.sendBg,
            border: `1px solid ${c.sendBorder}`,
            color: c.text,
          }}
        >
          {confirmLabel}
        </button>

        
      </div>
    </ChatBubble>
  )
}