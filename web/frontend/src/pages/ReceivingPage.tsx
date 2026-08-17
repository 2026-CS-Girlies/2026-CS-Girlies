import { useEffect, useMemo, useRef, useState } from 'react'
import { bgStyle } from '../theme/background'
import { tk } from '../theme/tokens'
import type { BgConfig } from '../types/theme'

const RIPPLE_COUNT = 5
const STEP_MS = 3600

type Stage = 'received' | 'thought' | 'defense' | 'prosecution' | 'judge' | 'ready'

type StoryStep = {
  stage: Stage
  eyebrow: string
  title: string
  body: string
}

export default function ReceivingScreen({
  thought,
  bg,
  isLight,
  onComplete,
  modelReady,
  onSkip,
}: {
  thought: string
  bg: BgConfig
  isLight: boolean
  onComplete: () => void
  modelReady: boolean
  onSkip: () => void
}) {
  const c = tk(isLight)
  const [step, setStep] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const story = useMemo<StoryStep[]>(
    () => [
      {
        stage: 'received',
        eyebrow: 'THOUGHT RECEIVED',
        title: `“${thought}”`,
        body: 'While the model gets ready, here’s a quick look at what we’ll do with this thought.',
      },
      {
        stage: 'thought',
        eyebrow: '01 · THE THOUGHT',
        title: 'Put the thought on the stand.',
        body: 'CBT starts by noticing the automatic thought that arrived — before deciding whether it is completely true.',
      },
      {
        stage: 'defense',
        eyebrow: '02 · THE DEFENSE',
        title: 'Become the defense attorney.',
        body: 'Bring forward the experiences and evidence that make this thought feel convincing.',
      },
      {
        stage: 'prosecution',
        eyebrow: '03 · THE PROSECUTION',
        title: 'Now question the evidence.',
        body: 'Look closely at what actually happened, what you assumed, and what the thought may be leaving out.',
      },
      {
        stage: 'judge',
        eyebrow: '04 · THE JUDGE',
        title: 'Hold both sides at once.',
        body: 'Compare the full picture. Not to force a positive answer — but to arrive at a fairer, more balanced one.',
      },
      {
        stage: 'ready',
        eyebrow: 'YOUR TURN',
        title: 'What still feels true?',
        body: 'Your reflection is ready. Let’s examine the thought together.',
      },
    ],
    [thought],
  )

  useEffect(() => {
    const ids: ReturnType<typeof setTimeout>[] = []

    story.slice(1).forEach((_, index) => {
      const changeAt = STEP_MS * (index + 1)
      ids.push(setTimeout(() => setLeaving(true), changeAt - 520))
      ids.push(
        setTimeout(() => {
          setStep(index + 1)
          setLeaving(false)
        }, changeAt),
      )
    })

    ids.push(setTimeout(() => onCompleteRef.current(), STEP_MS * story.length - 800))
    return () => ids.forEach(clearTimeout)
  }, [story])

  const current = story[step]
  const strokeColor = isLight ? 'rgba(0,0,0,VAL)' : 'rgba(255,255,255,VAL)'
  const ring = (opacity: string) => strokeColor.replace('VAL', opacity)

  return (
    <div className="fixed inset-0 z-10 overflow-hidden" style={bgStyle(bg)}>
      {bg.type === 'image' && <div className="absolute inset-0" style={{ background: c.imgOverlay }} />}

      <div
        className="absolute inset-0"
        style={{
          background: isLight
            ? 'radial-gradient(circle at 50% 48%, rgba(255,255,255,.08), rgba(255,255,255,0) 46%)'
            : 'radial-gradient(circle at 50% 48%, rgba(255,255,255,.045), rgba(255,255,255,0) 46%)',
          pointerEvents: 'none',
        }}
      />

      {current.stage === 'received' &&
        Array.from({ length: RIPPLE_COUNT }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: '50%',
              top: '50%',
              width: '60vmax',
              height: '60vmax',
              border: `1px solid ${ring(String(0.32 - i * 0.045))}`,
              animation: `ripple 2.8s cubic-bezier(0.2,0.6,0.4,1) ${i * 460}ms both`,
              pointerEvents: 'none',
            }}
          />
        ))}

      <main className="absolute inset-0 flex items-center justify-center px-6 sm:px-10">
        <section
          key={step}
          className="receiving-story-step w-full max-w-5xl text-center"
          style={{
            color: c.text,
            animation: leaving
              ? 'receiving-stage-out 0.52s ease-in forwards'
              : 'receiving-stage-in 0.8s cubic-bezier(0.2,0.8,0.3,1) both',
          }}
        >
          <div
            style={{
              fontFamily: 'Fragment Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.18em',
              color: c.textMuted,
              marginBottom: 'clamp(20px, 4vh, 34px)',
            }}
          >
            {current.eyebrow}
          </div>

          {current.stage === 'received' ? (
            <h1
              style={{
                margin: 0,
                fontFamily: 'Instrument Serif, serif',
                fontSize: 'clamp(38px, 7.2vw, 92px)',
                fontStyle: 'italic',
                fontWeight: 400,
                lineHeight: 1.02,
                letterSpacing: '-0.025em',
                whiteSpace: 'pre-wrap',
              }}
            >
              {current.title}
            </h1>
          ) : (
            <>
              <div
                aria-hidden="true"
                style={{
                  fontFamily: 'Instrument Serif, serif',
                  fontSize: 'clamp(76px, 16vw, 220px)',
                  lineHeight: 0.72,
                  opacity: isLight ? 0.06 : 0.08,
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -56%)',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                {current.stage === 'thought' && 'THOUGHT'}
                {current.stage === 'defense' && 'DEFENSE'}
                {current.stage === 'prosecution' && 'PROSECUTION'}
                {current.stage === 'judge' && 'JUDGE'}
                {current.stage === 'ready' && 'TRUE?'}
              </div>

              <h1
                style={{
                  position: 'relative',
                  margin: 0,
                  fontFamily: 'Instrument Serif, serif',
                  fontSize: 'clamp(42px, 7.4vw, 96px)',
                  fontWeight: 400,
                  lineHeight: 0.98,
                  letterSpacing: '-0.035em',
                }}
              >
                {current.title}
              </h1>
            </>
          )}

          <p
            style={{
              position: 'relative',
              maxWidth: 650,
              margin: 'clamp(26px, 5vh, 44px) auto 0',
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(14px, 1.7vw, 18px)',
              lineHeight: 1.7,
              color: c.textMuted,
            }}
          >
            {current.body}
          </p>
        </section>
      </main>

      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex w-[min(92vw,720px)] flex-col items-center gap-4"
      >
        <div className="flex items-center gap-2" aria-hidden="true">
          {story.map((item, index) => (
            <span
              key={item.stage}
              style={{
                display: 'block',
                width: index === step ? 28 : 5,
                height: 5,
                borderRadius: 999,
                background: c.text,
                opacity: index === step ? 0.72 : 0.18,
                transition: 'width 450ms ease, opacity 450ms ease',
              }}
            />
          ))}
        </div>

        <div
          className="flex min-h-9 items-center justify-center gap-3"
          style={{
            fontFamily: 'Fragment Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.08em',
            color: c.textMuted,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: c.text,
              opacity: modelReady ? 0.72 : 0.38,
              animation: modelReady ? 'none' : 'receiving-status-pulse 1.5s ease-in-out infinite',
            }}
          />

          <span aria-live="polite">
            {modelReady ? 'Model is Ready' : 'Loading model...'}
          </span>

          {modelReady && (
            <button
              type="button"
              onClick={onSkip}
              className="receiving-skip-button"
              style={{
                marginLeft: 4,
                border: `1px solid ${isLight ? 'rgba(0,0,0,.22)' : 'rgba(255,255,255,.28)'}`,
                borderRadius: 999,
                padding: '7px 13px',
                color: c.text,
                background: isLight ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.06)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                fontFamily: 'Fragment Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.08em',
                cursor: 'pointer',
              }}
            >
              SKIP →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
