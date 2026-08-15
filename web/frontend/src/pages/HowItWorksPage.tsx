import { useState } from 'react'
import { HOW_STEPS } from '@/data/howItWorks'
import { bgStyle } from '@/theme/background'
import { tk } from '@/theme/tokens'
import type { BgConfig } from '@/types/theme'

export default function HowItWorksPage({ onBack, onBegin, isLight, bg }: { onBack: () => void; onBegin: () => void; isLight: boolean; bg: BgConfig }) {
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const c = tk(isLight)
  const textBase = isLight ? 'rgba(0,0,0,0.85)' : 'rgba(240,237,232,1)'
  const textMid  = isLight ? 'rgba(0,0,0,0.45)' : 'rgba(240,237,232,0.5)'
  const textFaint= isLight ? 'rgba(0,0,0,0.28)' : 'rgba(240,237,232,0.28)'
  const borderFaint = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'
  const tagBorder   = isLight ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.12)'
  const tagColor    = isLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)'
  const ctaBg       = isLight ? 'rgba(0,0,0,0.88)' : 'rgba(240,237,232,0.95)'
  const ctaText     = isLight ? '#fff' : '#0a0a0a'

  return (
    <div className="w-full min-h-full relative" style={{ ...bgStyle(bg) }}>
      {bg.type === 'image' && <div className="absolute inset-0 pointer-events-none" style={{ background: c.imgOverlay }} />}

      {/* Scrollable content — padded top for the fixed NavBar */}
      <div className="relative z-10 px-6 md:px-12 pb-24 pt-20 md:pt-24">

        {/* Begin CTA top-right (mirrors bottom) — hidden on mobile */}
        <div className="hidden md:flex justify-end mb-0">
          <button
          onClick={onBegin}
          className="text-xs tracking-widest transition-opacity hover:opacity-70 px-4 py-2 rounded-full"
          style={{ fontFamily: 'Fragment Mono, monospace', color: '#0a0a0a', background: 'rgba(240,237,232,0.92)', letterSpacing: '0.06em' }}
        >
          BEGIN →
        </button>
        </div>

        {/* Hero */}
        <div className="pt-8 md:pt-12 pb-20 md:pb-28 max-w-3xl">
          <p className="text-xs tracking-widest mb-5" style={{ fontFamily: 'Fragment Mono, monospace', color: textFaint }}>HOW IT WORKS</p>
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 'clamp(40px,7vw,88px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: textBase }}>
            A thought that feels<br />true isn't always{' '}
            <em style={{ fontStyle: 'italic', color: textMid }}>true.</em>
          </h1>
          <p className="mt-8 text-base md:text-lg leading-relaxed max-w-xl" style={{ fontFamily: 'Inter, sans-serif', color: textMid, fontWeight: 400 }}>
            Still True? uses Cognitive Behavioral Therapy techniques to help you slow down, look at the evidence, and arrive at a clearer picture — without anyone telling you what to think.
          </p>
        </div>

        {/* Divider */}
        <div style={{ borderTop: `1px solid ${borderFaint}`, marginBottom: 0 }} />

        {/* Steps */}
        <div className="mt-0">
          {HOW_STEPS.map((step, i) => {
            const isActive = activeStep === i
            return (
              <div
                key={step.n}
                onClick={() => setActiveStep(isActive ? null : i)}
                className="group cursor-pointer"
                style={{ borderBottom: `1px solid ${borderFaint}` }}
              >
                <div className="py-8 md:py-10 grid grid-cols-[auto_1fr] md:grid-cols-[80px_1fr_1fr] gap-x-8 md:gap-x-12 gap-y-4 items-start">

                  {/* Step number */}
                  <div className="row-span-2 md:row-span-1 flex items-center">
                    <span style={{ fontFamily: 'Fragment Mono, monospace', fontSize: 'clamp(28px,4vw,48px)', color: isActive ? textBase : textFaint, transition: 'color 0.25s' }}>
                      {step.n}
                    </span>
                  </div>

                  {/* Title block */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] tracking-widest px-2 py-0.5 rounded" style={{ fontFamily: 'Fragment Mono, monospace', color: tagColor, border: `1px solid ${tagBorder}` }}>
                        {step.tag}
                      </span>
                    </div>
                    <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 'clamp(22px,3vw,34px)', color: textBase, lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                      {step.title}
                    </h2>
                    <p className="text-sm" style={{ fontFamily: 'Fragment Mono, monospace', color: textFaint }}>
                      STEP {step.sub.toUpperCase()}
                    </p>
                  </div>

                  {/* Body + expand */}
                  <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
                    <p className="text-sm md:text-base leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: textMid, fontWeight: 400 }}>
                      {step.body}
                    </p>
                    <div style={{ maxHeight: isActive ? 120 : 0, overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)' }}>
                      <p className="text-sm leading-relaxed pt-1 pb-2" style={{ fontFamily: 'Inter, sans-serif', color: textFaint, borderLeft: `2px solid ${borderFaint}`, paddingLeft: 14 }}>
                        {step.detail}
                      </p>
                    </div>
                    <button
                      className="self-start text-xs tracking-wider transition-opacity hover:opacity-80"
                      style={{ fontFamily: 'Fragment Mono, monospace', color: isActive ? textMid : textFaint }}
                      onClick={e => { e.stopPropagation(); setActiveStep(isActive ? null : i) }}
                    >
                      {isActive ? '− LESS' : '+ MORE'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Philosophy block */}
        <div className="mt-20 md:mt-28 grid md:grid-cols-2 gap-12 md:gap-20 items-start">
          <div>
            <p className="text-xs tracking-widest mb-6" style={{ fontFamily: 'Fragment Mono, monospace', color: textFaint }}>THE APPROACH</p>
            <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 'clamp(28px,4vw,48px)', color: textBase, lineHeight: 1.15, letterSpacing: '-0.015em' }}>
              Built on CBT,<br />not self-help.
            </h2>
          </div>
          <div className="flex flex-col gap-6">
            <p className="text-sm md:text-base leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: textMid, fontWeight: 400 }}>
              Cognitive Behavioral Therapy is one of the most studied psychological interventions in existence. Its core insight: emotions follow thoughts, and thoughts can be examined.
            </p>
            <p className="text-sm md:text-base leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: textMid, fontWeight: 400 }}>
              Still True? doesn't diagnose, treat, or replace professional support. It gives you a private space to apply a well-understood technique, without noise, judgment, or an account to create.
            </p>
            <div className="flex gap-6 pt-2">
              {['Private', 'Offline-first', 'No account'].map(label => (
                <div key={label} className="flex items-center gap-2">
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: textFaint, display: 'inline-block', flexShrink: 0 }} />
                  <span className="text-xs" style={{ fontFamily: 'Fragment Mono, monospace', color: textFaint }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 md:mt-32 flex flex-col items-center text-center gap-6 pb-4">
          <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 'clamp(28px,5vw,60px)', color: textBase, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Ready to examine<br /><em style={{ fontStyle: 'italic', color: textMid }}>that thought?</em>
          </h2>
          <button
            onClick={onBegin}
            className="mt-2 px-8 py-4 rounded-full text-sm tracking-widest transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ fontFamily: 'Fragment Mono, monospace', background: ctaBg, color: ctaText, letterSpacing: '0.07em' }}
          >
            BEGIN →
          </button>
        </div>
      </div>
    </div>
  )
}
