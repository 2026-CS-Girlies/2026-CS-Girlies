import { useEffect, useState } from 'react'
import { bgStyle } from '../theme/background'
import { tk } from '../theme/tokens'
import type { BgConfig } from '../types/theme'

const RIPPLE_COUNT = 5
const CAPTIONS = ['Taking this in…', 'Let’s look at it more closely.']

export default function ReceivingScreen({ thought, bg, isLight, onComplete }: { thought: string; bg: BgConfig; isLight: boolean; onComplete: () => void }) {
  const c = tk(isLight)
  const [captionIdx, setCaptionIdx] = useState(-1)
  const [captionOut, setCaptionOut] = useState(false)
  const [thoughtOut, setThoughtOut] = useState(false)

  const strokeColor = isLight ? 'rgba(0,0,0,VAL)' : 'rgba(255,255,255,VAL)'
  const ring = (opacity: string) => strokeColor.replace('VAL', opacity)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => setCaptionIdx(0), 900))
    timers.push(setTimeout(() => setCaptionIdx(1), 2100))
    timers.push(setTimeout(() => { setCaptionOut(true); setThoughtOut(true) }, 3300))
    timers.push(setTimeout(onComplete, 3900))

    return () => timers.forEach(clearTimeout)
  }, [onComplete])
  

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={bgStyle(bg)}>
      {bg.type === 'image' && <div className="absolute inset-0" style={{ background: c.imgOverlay }} />}

      {/* Ripple rings */}
      {Array.from({ length: RIPPLE_COUNT }, (_, i) => (
        <div key={i} className="absolute rounded-full" style={{ left: '50%', top: '50%', width: '60vmax', height: '60vmax', border: `1px solid ${ring(String(0.35 - i * 0.05))}`, animation: `ripple 2.6s cubic-bezier(0.2,0.6,0.4,1) ${i * 480}ms both`, pointerEvents: 'none' }} />
      ))}

      {/* Echo copies */}
      {[0.12, 0.07].map((opacity, i) => (
        <div key={i} className="absolute" style={{ left: '50%', top: '50%', maxWidth: '72vw', textAlign: 'center', fontFamily: 'Instrument Serif, serif', fontSize: 'clamp(22px, 4.5vw, 54px)', fontStyle: 'italic', lineHeight: 1.25, color: isLight ? `rgba(0,0,0,${opacity})` : `rgba(255,255,255,${opacity})`, animation: `echo-drift 3.2s ease-out ${i * 200 + 200}ms both`, pointerEvents: 'none', whiteSpace: 'pre-wrap' }}>
          &ldquo;{thought}&rdquo;
        </div>
      ))}

      {/* Main thought */}
      <div className="absolute" style={{ left: '50%', top: '50%', maxWidth: '72vw', textAlign: 'center', fontFamily: 'Instrument Serif, serif', fontSize: 'clamp(22px, 4.5vw, 54px)', fontStyle: 'italic', lineHeight: 1.25, color: c.text, animation: thoughtOut ? 'thought-out 0.65s ease-in forwards' : 'thought-in 0.7s cubic-bezier(0.2,0.8,0.4,1) forwards', whiteSpace: 'pre-wrap' }}>
        &ldquo;{thought}&rdquo;
      </div>

      {/* Caption */}
      <div className="absolute" style={{ left: '50%', top: 'calc(50% + clamp(60px, 8vw, 90px))', transform: 'translateX(-50%)', textAlign: 'center', fontFamily: 'Fragment Mono, monospace', fontSize: 13, letterSpacing: '0.08em', color: c.textMuted, minHeight: 20, pointerEvents: 'none' }}>
        {captionIdx >= 0 && CAPTIONS[captionIdx] && (
          <span key={captionIdx} style={{ display: 'inline-block', animation: captionOut ? 'caption-out 0.6s ease-in forwards' : 'caption-in 0.5s ease-out forwards' }}>
            {CAPTIONS[captionIdx]}
          </span>
        )}
      </div>
    </div>
  )
}