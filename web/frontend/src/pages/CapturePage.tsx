import { bgStyle } from '@/theme/background'
import { tk } from '@/theme/tokens'
import type { BgConfig } from '@/types/theme'

export default function CapturePage({ thought, emotion, bg, isLight, onContinue, onBack }: { thought: string; emotion: string; bg: BgConfig; isLight: boolean; onContinue: () => void; onBack: () => void }) {
  const c = tk(isLight)

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-auto py-24 px-5 md:px-8 transition-all duration-500" style={bgStyle(bg)}>
      {bg.type === 'image' && <div className="absolute inset-0 pointer-events-none" style={{ background: c.imgOverlay }} />}

      <div className="absolute top-6 left-5 md:top-8 md:left-8 flex items-baseline gap-1 relative z-10" style={{ fontFamily: 'Instrument Serif, serif' }}>
        <span className="text-[28px] md:text-[36px] transition-colors duration-300" style={{ color: c.text }}>03</span>
        <span className="text-[22px] md:text-[28px]" style={{ color: c.textFaint }}> / </span>
        <span className="text-[16px] md:text-[22px]" style={{ color: c.textFaint }}>04</span>
      </div>
      <div className="absolute top-6 right-5 md:top-8 md:right-8 z-10">
        <span className="text-xs md:text-sm transition-colors duration-300" style={{ fontFamily: 'Fragment Mono, monospace', color: c.textMuted }}>· EXAMINE</span>
      </div>

      <div className="relative z-10 w-full max-w-[900px] flex flex-col items-center gap-8 md:gap-10">
        <h1 className="text-[clamp(36px,5vw,60px)] text-center leading-tight transition-colors duration-300" style={{ fontFamily: 'Instrument Serif, serif', color: c.text }}>
          Still True?
        </h1>

        <div className="rounded-[24px] md:rounded-[30px] w-full px-5 md:px-8 py-8 md:py-10 flex flex-col gap-6 md:gap-8 transition-all duration-300"
          style={{ background: c.cardBg, backdropFilter: 'blur(20px)', boxShadow: isLight ? '0 4px 32px rgba(0,0,0,0.08)' : '0 4px 32px rgba(0,0,0,0.3)' }}>
          <div className="text-center">
            <p className="text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: c.cardMuted }}>I keep thinking that...</p>
            <p className="text-[clamp(18px,3vw,36px)] leading-tight" style={{ fontFamily: 'Instrument Serif, serif', color: c.cardText }}>"{thought}"</p>
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0' }} />

          <div className="text-center">
            <p className="text-sm mb-3" style={{ fontFamily: 'Inter, sans-serif', color: c.cardMuted }}>What you discovered...</p>
            <p className="text-[clamp(15px,2vw,22px)] leading-snug" style={{ fontFamily: 'Instrument Serif, serif', color: c.cardText }}>{emotion || '—'}</p>
          </div>

          <p className="text-sm text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#ccc' }}>
            Does this capture what you're experiencing? Edit anything that doesn't feel quite right.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button onClick={onBack} className="w-full sm:w-auto text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
              style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#111', border: '1px solid rgba(0,0,0,0.12)' }}>
              Edit
            </button>
            <button onClick={onContinue} className="w-full sm:w-auto text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
              style={{ fontFamily: 'Inter, sans-serif', background: '#111', color: '#fff' }}>
              Start Over →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
