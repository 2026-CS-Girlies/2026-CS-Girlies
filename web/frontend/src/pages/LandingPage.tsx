import { useState, type KeyboardEvent } from 'react'
import AnimatedHeadline from '../components/landing/AnimatedHeadline'
import CustomizePanel from '../components/landing/CustomizePanel'
import PrivacyBottomSheet from '../components/landing/PrivacyBottomSheet'
import ThemeButton from '../components/landing/ThemeButton'
import SendIcon from '../components/common/SendIcon'
import { PRIVACY_NOTE } from '../data/privacy'
import { bgStyle } from '../theme/background'
import { tk } from '../theme/tokens'
import type { BgConfig, SoundId, ThemeId } from '../types/theme'

export default function LandingPage({ onBegin, bg, onBgChange, isLight, soundId, onSoundChange, onHowItWorks, activeThemeId, onThemeId }: { onBegin: (t: string) => void; bg: BgConfig; onBgChange: (b: BgConfig) => void; isLight: boolean; soundId: SoundId; onSoundChange: (s: SoundId) => void; onHowItWorks: () => void; activeThemeId: ThemeId | null; onThemeId: (id: ThemeId | null) => void }) {
  const [input, setInput] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)

  const c = tk(isLight)

  const submit = () => { const t = input.trim(); if (t) onBegin(t) }
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') submit() }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden transition-all duration-500" style={bgStyle(bg)}>
      {bg.type === 'image' && <div className="absolute inset-0 pointer-events-none transition-all duration-300" style={{ background: c.imgOverlay }} />}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(128,128,128,0.10) 0%, transparent 70%)' }} />

      <div className="relative z-10 flex flex-col items-center gap-8 md:gap-16 w-full px-5 md:px-8">
        <AnimatedHeadline isLight={isLight} />

        <p className="text-[16px] md:text-[18px] font-medium text-center max-w-sm md:max-w-xl transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted }}>
          What negative thought feels true right now?
        </p>

        <div className="relative flex items-center gap-3 px-4 md:px-8 py-4 md:py-5 rounded-[20px] w-full max-w-[550px] transition-all duration-300"
          style={{ background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(221,221,221,0.10)', border: `1.33px solid ${c.border}`, backdropFilter: 'blur(12px)' }}>
          <input
            className="flex-1 bg-transparent outline-none text-[14px] min-w-0 transition-colors duration-300"
            style={{ fontFamily: 'Inter, sans-serif', color: c.text }}
            placeholder="I keep thinking that..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            autoFocus
          />
          <button onClick={submit} className="flex-none w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: c.sendBg, border: `0.5px solid ${c.sendBorder}` }}>
            <SendIcon color={isLight ? '#444' : '#BBBBBB'} />
          </button>
        </div>
      </div>

      {/* Desktop privacy note — bottom center, very subtle */}
      <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-1.5 text-center pointer-events-none select-none" style={{ opacity: 0.42 }}>
        <p className="text-[11px] leading-relaxed max-w-md" style={{ fontFamily: 'Inter, sans-serif', color: c.text }}>
          {PRIVACY_NOTE.body}
        </p>
        <button
          className="text-[11px] underline underline-offset-2 pointer-events-auto transition-opacity hover:opacity-80"
          style={{ fontFamily: 'Inter, sans-serif', color: c.text }}
          onClick={() => {}}
        >
          {PRIVACY_NOTE.link}
        </button>
      </div>

      {/* Mobile privacy link — bottom left */}
      <button
        onClick={() => setNoteOpen(true)}
        className="absolute bottom-6 left-5 z-20 md:hidden text-[11px] transition-colors"
        style={{ fontFamily: 'Inter, sans-serif', color: c.textFaint, opacity: 0.6 }}
      >
        A note before you begin ↗
      </button>

      {/* Mobile bottom sheet */}
      {noteOpen && <PrivacyBottomSheet isLight={isLight} onClose={() => setNoteOpen(false)} />}

      <ThemeButton
        isLight={isLight}
        activeThemeId={activeThemeId}
        onTheme={(newBg, newSound, id) => {
          onBgChange(newBg)
          onSoundChange(newSound)
          onThemeId(id)
        }}
        onCustomize={() => setPanelOpen(true)}
      />

      {panelOpen && (
        <CustomizePanel
          current={bg}
          onChange={newBg => {
            onBgChange(newBg)
            onThemeId(null)
          }}
          onClose={() => setPanelOpen(false)}
          isLight={isLight}
          soundId={soundId}
          onSoundChange={onSoundChange}
        />
      )}
    </div>
  )
}
