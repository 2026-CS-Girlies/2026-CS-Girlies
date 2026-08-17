import { useState } from 'react'
import { tk } from '@/theme/tokens'
import type { Screen } from '@/types/navigation'

type NavBarProps = {
  isLight: boolean
  currentScreen: Screen
  onNavigate: (screen: Screen) => void
  onRestart: () => void
}

export default function NavBar({ isLight, currentScreen, onNavigate, onRestart }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const c = tk(isLight)

  const DEVPOST_URL = 'https://devpost.com/software/still-ture?ref_content=user-portfolio&ref_feature=in_progress'
  const DOWNLOAD_URL = 'https://github.com/2026-CS-Girlies/Still-True'
  

  const navigate = (screen: Screen) => {
    setMenuOpen(false)
    onNavigate(screen)
  }

  const navColor = (screen: Screen) => currentScreen === screen ? c.text : c.textMuted
  const navWeight = (screen: Screen) => currentScreen === screen ? 500 : 400

  return (
    <nav className="absolute top-0 left-0 right-0 z-20 px-5 md:px-8 py-4 md:py-5">
      <div className="flex items-center justify-between">
        <span
          className="font-semibold text-[17px] cursor-pointer select-none transition-colors duration-300"
          style={{ fontFamily: 'Inter, sans-serif', color: c.text }}
          onClick={() => { setMenuOpen(false); onRestart() }}
        >
          Still True?
        </span>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate('howItWorks')} className="text-sm transition-colors duration-300 hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: navColor('howItWorks'), fontWeight: navWeight('howItWorks') }}>How It Works</button>
          <button onClick={() => window.open(DOWNLOAD_URL, '_blank')} className="text-sm transition-colors duration-300 hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted, fontWeight: 400 }}>Technical Docs</button>
          <button onClick={() => navigate('privacy')} className="text-sm transition-colors duration-300 hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: navColor('privacy'), fontWeight: navWeight('privacy') }}>Privacy</button>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => window.open(DEVPOST_URL, '_blank', 'noopener,noreferrer')} className="text-sm font-medium flex items-center gap-1.5 transition-colors duration-300 hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: c.text }}>
            Support on DevPost
          </button>

          <button onClick={() => window.open(DOWNLOAD_URL, '_blank', 'noopener,noreferrer')} className="text-sm flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-2xl transition-colors duration-300 hover:opacity-85" style={{ fontFamily: 'Inter, sans-serif', background: c.btnPrimaryBg, color: c.btnPrimaryText }}>
            Download Local App
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M7 9l-3-3M7 9l3-3" stroke={c.btnPrimaryText} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12h10" stroke={c.btnPrimaryText} strokeWidth="1.25" strokeLinecap="round"/>
            </svg>
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
          <button onClick={() => navigate('howItWorks')} className="text-sm text-left transition-opacity hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: navColor('howItWorks'), fontWeight: navWeight('howItWorks') }}>How It Works</button>

          <button onClick={() => window.open(DOWNLOAD_URL, '_blank')} className="text-sm text-left transition-opacity hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted, fontWeight: 400 }}>Technical Docs</button>

          <button onClick={() => navigate('privacy')} className="text-sm text-left transition-opacity hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: navColor('privacy'), fontWeight: navWeight('privacy') }}>Privacy</button>

          <div className="pt-3 flex flex-col gap-3" style={{ borderTop: `1px solid ${c.divider}` }}>
            <button onClick={() => { setMenuOpen(false); window.open(DEVPOST_URL, '_blank', 'noopener,noreferrer') }} className="text-sm text-left transition-opacity hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: c.text }}>Support on DevPost</button>

            <button onClick={() => { setMenuOpen(false); window.open(DOWNLOAD_URL, '_blank', 'noopener,noreferrer') }} className="text-sm font-medium px-3 py-2 rounded-2xl w-full flex items-center justify-center gap-1.5" style={{ background: c.btnPrimaryBg, color: c.btnPrimaryText, fontFamily: 'Inter, sans-serif' }}>
              Download Local App
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v8M7 9l-3-3M7 9l3-3" stroke={c.btnPrimaryText} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12h10" stroke={c.btnPrimaryText} strokeWidth="1.25" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}