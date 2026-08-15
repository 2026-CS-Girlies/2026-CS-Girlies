import { useState } from 'react'
import { tk } from '@/theme/tokens'

type NavBarProps = {
  onRestart: () => void
  isLight: boolean
  onHowItWorks?: () => void
}

export default function NavBar({ onRestart, isLight, onHowItWorks }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const c = tk(isLight)

  return (
    <nav className="absolute top-0 left-0 right-0 z-20 px-5 md:px-8 py-4 md:py-5">
      <div className="flex items-center justify-between">
        <span
          className="font-semibold text-[17px] cursor-pointer select-none transition-colors duration-300"
          style={{ fontFamily: 'Inter, sans-serif', color: c.text }}
          onClick={onRestart}
        >
          Still True?
        </span>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={onHowItWorks} className="text-sm transition-colors duration-300 hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted, fontWeight: 400 }}>How It Works</button>
          {['Technical Docs', 'Privacy'].map(label => (
            <span key={label} className="text-sm transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted, fontWeight: 400 }}>{label}</span>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm font-medium flex items-center gap-1.5 transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif', color: c.text }}>
            Download Local App
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M7 9l-3-3M7 9l3-3" stroke={c.text} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12h10" stroke={c.text} strokeWidth="1.25" strokeLinecap="round"/>
            </svg>
          </span>
          <button
            className="text-sm font-medium px-3 py-1.5 rounded-2xl transition-colors duration-300"
            style={{ fontFamily: 'Inter, sans-serif', background: c.btnPrimaryBg, color: c.btnPrimaryText }}
          >
            Reflect Online
          </button>
        </div>

        <button className="md:hidden flex flex-col gap-1.5 p-1" onClick={() => setMenuOpen(o => !o)}>
          {[0, 1, 2].map(i => (
            <span key={i} className="block w-5 h-px transition-all origin-center" style={{ background: c.text, transform: menuOpen ? (i === 0 ? 'rotate(45deg) translateY(7px)' : i === 2 ? 'rotate(-45deg) translateY(-7px)' : undefined) : undefined, opacity: menuOpen && i === 1 ? 0 : 1 }} />
          ))}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-4 py-5 px-4 rounded-2xl" style={{ background: isLight ? 'rgba(255,255,255,0.92)' : 'rgba(30,30,30,0.95)', border: `1px solid ${c.border}`, backdropFilter: 'blur(12px)' }}>
          <button onClick={() => { setMenuOpen(false); onHowItWorks?.() }} className="text-sm text-left transition-opacity hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted }}>How It Works</button>
          {['Technical Docs', 'Privacy'].map(label => (
            <span key={label} className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted }}>{label}</span>
          ))}
          <div className="pt-3 flex flex-col gap-3" style={{ borderTop: `1px solid ${c.divider}` }}>
            <button className="text-sm font-medium px-3 py-2 rounded-2xl w-full" style={{ background: c.btnPrimaryBg, color: c.btnPrimaryText, fontFamily: 'Inter, sans-serif' }}>Reflect Online</button>
          </div>
        </div>
      )}
    </nav>
  )
}
