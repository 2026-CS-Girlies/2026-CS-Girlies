import { useState, type KeyboardEvent } from 'react'
import AnimatedHeadline from '../components/landing/AnimatedHeadline'
import CustomizePanel from '../components/landing/CustomizePanel'
import PrivacyBottomSheet from '../components/landing/PrivacyBottomSheet'
import ThemeButton from '../components/landing/ThemeButton'
import SendIcon from '../components/common/SendIcon'
import { PRIVACY_NOTE } from '../data/privacy'
import { DEMO_THOUGHT } from '../data/demoConversation'
import { bgStyle } from '../theme/background'
import { tk } from '../theme/tokens'
import ModelInfoModal from '../components/landing/ModelInfoModal'
import type { BgConfig, SoundId, ThemeId } from '../types/theme'

export default function LandingPage({ onBegin, bg, onBgChange, isLight, soundId, onSoundChange, onHowItWorks, activeThemeId, onThemeId }: { onBegin: (t: string, demoMode?: boolean) => void; bg: BgConfig; onBgChange: (b: BgConfig) => void; isLight: boolean; soundId: SoundId; onSoundChange: (s: SoundId) => void; onHowItWorks: () => void; activeThemeId: ThemeId | null; onThemeId: (id: ThemeId | null) => void }) {
  const [input, setInput] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)

  const c = tk(isLight)

  const submit = () => { const t = input.trim(); if (t) onBegin(t, false) }
  const startDemo = () => onBegin(DEMO_THOUGHT, true)
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') submit() }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden transition-all duration-500" style={bgStyle(bg)}>
      {bg.type === 'image' && <div className="absolute inset-0 pointer-events-none transition-all duration-300" style={{ background: c.imgOverlay }} />}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(128,128,128,0.10) 0%, transparent 70%)' }} />

      <div className="relative z-10 flex flex-col items-center gap-8 min-[960px]:gap-16 w-full px-5 min-[960px]:px-8">
        <AnimatedHeadline isLight={isLight} />

        <p className="text-[16px] min-[960px]:text-[18px] font-medium text-center max-w-sm md:max-w-xl transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted }}>
          What negative thought feels true right now?
        </p>

        <div className="w-full max-w-[550px] flex flex-col gap-2">
          <div className='flex gap-2'>
            <button
              type="button"
              onClick={startDemo}
              className="self-start flex items-center gap-2 text-[11px] min-[960px]:text-[12px] px-3 py-1.5 rounded-full transition-all hover:opacity-80"
              style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted, border: `1px solid ${c.border}`, background: isLight ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}
            > 
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l1.2 3.3L16.5 7.5l-3.3 1.2L12 12l-1.2-3.3L7.5 7.5l3.3-1.2L12 3Z" />
                <path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z" />
                <path d="M5 13l.7 1.8L7.5 15.5l-1.8.7L5 18l-.7-1.8-1.8-.7 1.8-.7L5 13Z" />
              </svg>
              See the Demo
            </button>
            <button
              type="button"
              onClick={() => setModelOpen(true)}
              className="self-start flex items-center gap-2 text-[11px] min-[960px]:text-[12px] px-3 py-1.5 rounded-full transition-all hover:opacity-80"
              style={{ fontFamily: 'Inter, sans-serif', color: c.textMuted, border: `1px solid ${c.border}`, background: isLight ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}
            > 
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect
                  x="2"
                  y="3"
                  width="10"
                  height="8"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <circle cx="5" cy="7" r=".8" fill="currentColor" />
                <circle cx="9" cy="7" r=".8" fill="currentColor" />
                <path
                  d="M7 1.5V3M4.5 9h5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              About Model 
            </button>
          </div>

        <div className="relative flex items-center gap-3 px-4 min-[960px]:px-8 py-4 min-[960px]:py-5 rounded-[20px] w-full transition-all duration-300"
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

          {/* Privacy note now follows the input instead of being fixed to the viewport. */}
          <div className="hidden min-[960px]:flex flex-col items-center gap-1.5 px-3 pt-2 text-center" style={{ opacity: 0.48 }}>
            <p className="text-[11px] leading-relaxed max-w-md" style={{ fontFamily: 'Inter, sans-serif', color: c.text }}>
              {PRIVACY_NOTE.body}
            </p>
            <button
              className="text-[11px] underline underline-offset-2 transition-opacity hover:opacity-80"
              style={{ fontFamily: 'Inter, sans-serif', color: c.text }}
              onClick={() => setNoteOpen(true)}
            >
              {PRIVACY_NOTE.link}
            </button>
          </div>

          {/* Compact/mobile version appears as soon as horizontal space gets tight. */}
          <button
            onClick={() => setNoteOpen(true)}
            className="min-[960px]:hidden self-start px-1 pt-1 text-[11px] transition-opacity hover:opacity-80"
            style={{ fontFamily: 'Inter, sans-serif', color: c.textFaint, opacity: 0.7 }}
          >
            A note before you begin ↗
          </button>
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {noteOpen && <PrivacyBottomSheet isLight={isLight} onClose={() => setNoteOpen(false)} />}
      {modelOpen && <ModelInfoModal isLight={isLight} onClose={() => setModelOpen(false)} />}

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
