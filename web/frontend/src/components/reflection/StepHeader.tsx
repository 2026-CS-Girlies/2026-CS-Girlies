import { useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { tk } from '@/theme/tokens'

type Props = {
  current: string
  total: string
  isLight: boolean
  onBack?: () => void
  onRestart?: () => void
  restartLabel?: string
  desktopLabel?: string
  className?: string
}

export default function StepHeader({ current, total, isLight, onBack, onRestart, restartLabel = 'RESET CONVERSATION', desktopLabel, className = '' }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const c = tk(isLight)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <div className={`relative z-10 flex items-center justify-between flex-none gap-2 ${className}`}>
      <div className="flex items-baseline gap-1 leading-none" style={{ fontFamily: 'Instrument Serif, serif' }}>
        <span className="text-[24px] md:text-[32px]" style={{ color: c.text }}>{current}</span>
        <span className="text-[18px] md:text-[24px]" style={{ color: c.textFaint }}> / </span>
        <span className="text-[14px] md:text-[18px]" style={{ color: c.textFaint }}>{total}</span>
      </div>

      {desktopLabel && !onRestart && (
        <div className="hidden md:block text-sm" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>{desktopLabel}</div>
      )}

      {onRestart && (
        <button onClick={onRestart} className="hidden md:flex items-center gap-2 text-sm hover:opacity-80" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>
          <RotateCcw size={18} /> {restartLabel}
        </button>
      )}

      {(onBack || onRestart) && (
        <div className="relative md:hidden" ref={menuRef}>
          <button onClick={() => setMenuOpen(open => !open)} className="w-8 h-8 flex flex-col items-center justify-center gap-[5px] rounded-full" style={{ background: menuOpen ? c.inputBg : 'transparent' }} aria-label="Open page menu">
            {[0, 1, 2].map(i => <span key={i} className="block w-[3px] h-[3px] rounded-full" style={{ background: c.textMuted }} />)}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 w-48 rounded-2xl overflow-hidden z-30 flex flex-col" style={{ background: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(28,28,28,0.97)', border: `1px solid ${c.border}` }}>
              {onBack && <button onClick={() => { setMenuOpen(false); onBack() }} className="text-left px-5 py-3.5 text-sm" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>← Back</button>}
              {onRestart && <button onClick={() => { setMenuOpen(false); onRestart() }} className="text-left px-5 py-3.5 text-sm text-[#ff6b6b]" style={{ fontFamily: 'Fragment Mono, monospace' }}>↺ Start Over</button>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
