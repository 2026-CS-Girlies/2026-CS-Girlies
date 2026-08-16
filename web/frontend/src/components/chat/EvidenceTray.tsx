import { tk } from '@/theme/tokens'

type Props = {
  evidence: string[]
  isLight: boolean
  isLoading?: boolean
  message?: string | null
//   onEdit: () => void
  onComplete: () => void
}

export default function EvidenceTray({
  evidence,
  isLight,
  isLoading = false,
  message,
//   onEdit,
  onComplete,
}: Props) {
  const c = tk(isLight)

  if (evidence.length === 0 && !message) return null

  return (
    <div
        className="flex-none px-4 md:px-6 pt-3 pb-2 flex flex-col gap-2"
        style={{
        borderTop: `1px solid ${c.divider}`,
        }}
    >
        <p
          className="text-sm font-medium leading-relaxed mb-1"
          style={{
            fontFamily: 'Inter, sans-serif',
            color: c.asstBubbleText,
          }}
        >
            Evidence collected so far:
        </p>

      {evidence.map((item, index) => (
        <div
          key={`${index}-${item}`}
          className="flex items-start gap-3 rounded-2xl px-4 py-2.5"
          style={{
            background: c.userBubbleBg,
            border: `1px solid ${c.userBubbleBorder}`,
            animation: 'label-in 0.22s ease-out both',
          }}
        >
          <span
            className="flex-none pt-0.5"
            style={{
              fontFamily: 'Fragment Mono, monospace',
              fontSize: 11,
              color: c.textFaint,
            }}
          >
            {index + 1}
          </span>

          <span
            className="flex-1 text-sm"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: c.userBubbleText,
              lineHeight: 1.5,
            }}
          >
            {item}
          </span>
        </div>
      ))}

      {evidence.length > 0 && (
        <div className="flex items-center justify-end gap-3 pb-1">
          <button
            type="button"
            // onClick={onEdit}
            disabled={isLoading}
            className="text-sm px-4 py-2 rounded-full hover:opacity-80 disabled:opacity-40"
            style={{
              color: c.textMuted,
              border: `1px solid ${c.border}`,
            }}
          >
            Edit
          </button>

          <button
            type="button"
            onClick={onComplete}
            disabled={isLoading}
            className="text-sm px-4 py-2 rounded-full hover:opacity-80 disabled:opacity-40"
            style={{
              background: c.sendBg,
              border: `1px solid ${c.sendBorder}`,
              color: c.text,
            }}
          >
            That's enough →
          </button>
        </div>
      )}
    </div>
  )
}