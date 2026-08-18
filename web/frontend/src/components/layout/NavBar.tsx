import { useEffect, useState } from 'react'
import { tk } from '@/theme/tokens'
import type { Screen } from '@/types/navigation'

type NavBarProps = {
  isLight: boolean
  currentScreen: Screen
  onNavigate: (screen: Screen) => void
  onRestart: () => void
  autoHide?: boolean
}

export default function NavBar({
  isLight,
  currentScreen,
  onNavigate,
  onRestart,
  autoHide = false,
}: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [navVisible, setNavVisible] = useState(!autoHide)
  const c = tk(isLight)

  const DEVPOST_URL = 'https://devpost.com/software/still-ture?ref_content=user-portfolio&ref_feature=in_progress'
  const DOWNLOAD_URL = 'https://github.com/2026-CS-Girlies/Still-True'

  useEffect(() => {
    setMenuOpen(false)
    setNavVisible(!autoHide)
  }, [autoHide, currentScreen])

  const navigate = (screen: Screen) => {
    setMenuOpen(false)
    setNavVisible(!autoHide)
    onNavigate(screen)
  }

  const navColor = (screen: Screen) => currentScreen === screen ? c.text : c.textMuted
  const navWeight = (screen: Screen) => currentScreen === screen ? 500 : 400
  const showNav = !autoHide || navVisible || menuOpen

  const nav = (
    <nav
      className={`${
        autoHide ? 'fixed' : 'absolute'
      } top-0 left-0 right-0 z-50 px-5 min-[960px]:px-8 py-4 min-[960px]:py-5 transition-transform duration-300 ease-out ${
        showNav ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={autoHide ? {
        background: isLight ? 'rgba(255,255,255,.72)' : 'rgba(15,15,15,.72)',
        borderBottom: `1px solid ${c.divider}`,
        backdropFilter: 'blur(18px) saturate(1.25)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.25)',
      } : undefined}
      onMouseEnter={() => {
        if (autoHide) setNavVisible(true)
      }}
      onMouseLeave={() => {
        if (autoHide && !menuOpen) setNavVisible(false)
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="font-regular text-[17px] cursor-pointer select-none transition-colors duration-300"
          style={{ fontFamily: 'Inter, sans-serif', color: c.text }}
          onClick={() => {
            setMenuOpen(false)
            onRestart()
          }}
        >
          <span>Still</span>True?
        </span>
{/* 
        <div className="hidden min-[960px]:flex items-center gap-8">
          <button onClick={() => navigate('howItWorks')} className="text-sm transition-colors duration-300 hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: navColor('howItWorks'), fontWeight: navWeight('howItWorks') }}>How It Works</button>
          <button onClick={() => window.open(DOWNLOAD_URL, '_blank')} className="text-sm transition-colors duration-300 hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted, fontWeight: 400 }}>Technical Docs</button>
          <button onClick={() => navigate('privacy')} className="text-sm transition-colors duration-300 hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: navColor('privacy'), fontWeight: navWeight('privacy') }}>Privacy</button>
        </div> */}

        <div className="hidden min-[960px]:flex items-center gap-5">
          <button onClick={() => window.open(DEVPOST_URL, '_blank', 'noopener,noreferrer')} className="text-sm font-medium flex items-center gap-1.5 transition-colors duration-300 hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: c.text }}>
            DevPost
          </button>

          <button onClick={() => window.open(DOWNLOAD_URL, '_blank', 'noopener,noreferrer')} className="text-sm flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-2xl transition-colors duration-300 hover:opacity-85" style={{ fontFamily: 'Inter, sans-serif', background: c.btnPrimaryBg, color: c.btnPrimaryText }}>
            GitHub
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 2.75a9.25 9.25 0 0 0-2.92 18.03c.46.08.63-.2.63-.44v-1.72c-2.57.56-3.11-1.09-3.11-1.09-.42-1.07-1.03-1.36-1.03-1.36-.84-.58.06-.57.06-.57.93.07 1.42.96 1.42.96.83 1.42 2.17 1.01 2.7.77.08-.6.32-1.01.59-1.24-2.05-.23-4.21-1.03-4.21-4.57 0-1.01.36-1.84.95-2.49-.1-.23-.41-1.18.09-2.46 0 0 .78-.25 2.54.95A8.8 8.8 0 0 1 12 7.21a8.8 8.8 0 0 1 2.31.31c1.76-1.2 2.54-.95 2.54-.95.5 1.28.19 2.23.09 2.46.59.65.95 1.48.95 2.49 0 3.55-2.16 4.33-4.22 4.56.33.29.63.85.63 1.72v2.54c0 .24.17.53.64.44A9.25 9.25 0 0 0 12 2.75Z"
              fill="currentColor"
            />
          </svg>
          </button>
        </div>

        <button
          className="min-[960px]:hidden flex items-center justify-center p-1"
          onClick={() => {
            setNavVisible(true)
            setMenuOpen(o => !o)
          }}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke={c.text}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 7H19M5 12H19M5 17H19"
                stroke={c.text}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="min-[960px]:hidden mt-4 flex flex-col gap-4 py-5 px-4 rounded-2xl" style={{ background: isLight ? 'rgba(255,255,255,0.92)' : 'rgba(30,30,30,0.95)', border: `1px solid ${c.border}`, backdropFilter: 'blur(12px)' }}>
          {/* <button onClick={() => navigate('howItWorks')} className="text-sm text-left transition-opacity hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: navColor('howItWorks'), fontWeight: navWeight('howItWorks') }}>How It Works</button>
          <button onClick={() => window.open(DOWNLOAD_URL, '_blank')} className="text-sm text-left transition-opacity hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted, fontWeight: 400 }}>Technical Docs</button>
          <button onClick={() => navigate('privacy')} className="text-sm text-left transition-opacity hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: navColor('privacy'), fontWeight: navWeight('privacy') }}>Privacy</button> */}

          <div className="pt-3 flex flex-col gap-3">
            <button onClick={() => { setMenuOpen(false); window.open(DEVPOST_URL, '_blank', 'noopener,noreferrer') }} className="text-sm text-center transition-opacity hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: c.text }}>Support on DevPost</button>
            <button onClick={() => { setMenuOpen(false); window.open(DOWNLOAD_URL, '_blank', 'noopener,noreferrer') }} className="text-sm font-medium px-3 py-2 rounded-2xl w-full flex items-center justify-center gap-1.5" style={{ background: c.btnPrimaryBg, color: c.btnPrimaryText, fontFamily: 'Inter, sans-serif' }}>
              GitHub
              <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 2.75a9.25 9.25 0 0 0-2.92 18.03c.46.08.63-.2.63-.44v-1.72c-2.57.56-3.11-1.09-3.11-1.09-.42-1.07-1.03-1.36-1.03-1.36-.84-.58.06-.57.06-.57.93.07 1.42.96 1.42.96.83 1.42 2.17 1.01 2.7.77.08-.6.32-1.01.59-1.24-2.05-.23-4.21-1.03-4.21-4.57 0-1.01.36-1.84.95-2.49-.1-.23-.41-1.18.09-2.46 0 0 .78-.25 2.54.95A8.8 8.8 0 0 1 12 7.21a8.8 8.8 0 0 1 2.31.31c1.76-1.2 2.54-.95 2.54-.95.5 1.28.19 2.23.09 2.46.59.65.95 1.48.95 2.49 0 3.55-2.16 4.33-4.22 4.56.33.29.63.85.63 1.72v2.54c0 .24.17.53.64.44A9.25 9.25 0 0 0 12 2.75Z"
                fill="currentColor"
              />
            </svg>
            </button>
          </div>
        </div>
      )}
    </nav>
  )

  if (!autoHide) return nav

  return (
    <>
      {/* Desktop hover target: moving the pointer to the top edge reveals the nav. */}
      <div
        className="hidden min-[960px]:block fixed top-0 left-0 right-0 h-4 z-40"
        onMouseEnter={() => setNavVisible(true)}
      />

      {/* Mobile has no hover, so keep a small unobtrusive handle at the top. */}
      {!showNav && (
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setNavVisible(true)}
          className="min-[960px]:hidden fixed top-0 left-1/2 -translate-x-1/2 z-50 w-14 h-6 flex items-start justify-center pt-1.5"
        >
          <span
            className="block w-7 h-1 rounded-full"
            style={{ background: isLight ? 'rgba(0,0,0,.28)' : 'rgba(255,255,255,.32)' }}
          />
        </button>
      )}

      {nav}
    </>
  )
}
