import type { ReactNode } from 'react'
import { tk } from '@/theme/tokens'

type Props = {
  isLight: boolean
  onClose: () => void
  children: ReactNode
  maxWidth?: string
}

export default function Modal({
  isLight,
  onClose,
  children,
  maxWidth = '480px',
}: Props) {
  const c = tk(isLight)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{
        background: 'rgba(0,0,0,0.40)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full rounded-[24px] p-6 md:p-8"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth,
          background: isLight
            ? 'rgba(255,255,255,0.96)'
            : 'rgba(26,26,26,0.96)',
          border: `1px solid ${c.border}`,
          boxShadow: '0 24px 80px rgba(0,0,0,0.28)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-60"
          style={{
            color: c.text,
            border: `1px solid ${c.border}`,
            background: isLight
              ? 'rgba(0,0,0,0.03)'
              : 'rgba(255,255,255,0.05)',
          }}
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 3L11 11M11 3L3 11"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {children}
      </div>
    </div>
  )
}