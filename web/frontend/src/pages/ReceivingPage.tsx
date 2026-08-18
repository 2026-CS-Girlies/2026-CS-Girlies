import { useEffect, useMemo, useRef, useState } from 'react'
import { bgStyle } from '../theme/background'
import { tk } from '../theme/tokens'
import type { BgConfig } from '../types/theme'

const STEP_MS = 3600

type Stage = 'received' | 'thought' | 'defense' | 'prosecution' | 'judge' | 'ready'

type StoryStep = {
  stage: Stage
  eyebrow: string
  title: string
  body: string
}

type Props = {
  thought: string
  bg: BgConfig
  isLight: boolean
  onComplete: () => void
  modelReady: boolean
  onSkip: () => void
}

export default function ReceivingScreen({
  thought,
  bg,
  isLight,
  onComplete,
  modelReady,
  onSkip,
}: Props) {
  const c = tk(isLight)
  const [step, setStep] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const story = useMemo<StoryStep[]>(
    () => [
      // {
      //   stage: 'received',
      //   eyebrow: 'THOUGHT RECEIVED',
      //   title: `“${thought}”`,
      //   body: 'We’ll use a simple CBT-inspired process to look at this thought from more than one angle.',
      // },
      {
        stage: 'thought',
        eyebrow: '01 · THE THOUGHT',
        title: 'Put the thought on the stand.',
        body: 'Notice the thought first, before deciding whether it tells the whole story.',
      },
      {
        stage: 'defense',
        eyebrow: '02 · THE DEFENSE',
        title: 'Make the case for it.',
        body: 'Bring forward the experiences that make the thought feel believable.',
      },
      {
        stage: 'prosecution',
        eyebrow: '03 · THE PROSECUTION',
        title: 'Question the evidence.',
        body: 'Separate what actually happened from what you concluded in the moment.',
      },
      {
        stage: 'judge',
        eyebrow: '04 · THE JUDGE',
        title: 'Compare both sides.',
        body: 'Look for a view that is more complete, fair, and grounded in the full picture.',
      },
      {
        stage: 'ready',
        eyebrow: 'YOUR TURN',
        title: 'What still feels true?',
        body: 'Your reflection is ready whenever you are.',
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

  return (
    
    <div className="fixed inset-0 z-10 overflow-hidden" style={bgStyle(bg)}>
      {bg.type === 'image' && (
        <div className="absolute inset-0" style={{ background: c.imgOverlay }} />
      )}

      <div
        className="absolute top-20 left-1/2 -translate-x-1/2 z-20"
        style={{
          padding: '7px 12px',
          borderRadius: 999,
          border: `1px solid ${
            isLight
              ? 'rgba(0,0,0,.12)'
              : 'rgba(255,255,255,.14)'
          }`,
          background: isLight
            ? 'rgba(255,255,255,.28)'
            : 'rgba(255,255,255,.05)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          fontFamily: 'Fragment Mono, monospace',
          fontSize: 9,
          letterSpacing: '0.06em',
          color: c.textMuted,
          whiteSpace: 'nowrap',
        }}
      >
        Free GPU in use — model loading may take up to a minute.
      </div>

      <main className="absolute inset-0 flex items-center justify-center px-6 sm:px-10">
        <section className="w-full max-w-5xl text-center" style={{ color: c.text }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 34,
            }}
          >
            <div style={{ position: 'relative', width: 14, height: 14 }}>
              {!modelReady &&
                Array.from({ length: 3 }, (_, i) => (
                  <span
                    key={i}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      border: '1px solid rgba(226,85,85,.5)',
                      animation: `model-status-ripple 2.2s cubic-bezier(0.2,0.6,0.4,1) ${i * 520}ms infinite`,
                    }}
                  />
                ))}

              <span
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: modelReady ? '#4f8cff' : '#e25555',
                  boxShadow: modelReady
                    ? '0 0 12px rgba(79,140,255,.6)'
                    : '0 0 10px rgba(226,85,85,.5)',
                  animation: modelReady
                    ? 'model-ready-pop .55s cubic-bezier(0.2,0.8,0.3,1) both'
                    : 'none',
                }}
              />
            </div>

            <span
              style={{
                fontFamily: 'Fragment Mono, monospace',
                fontSize: 9,
                letterSpacing: '0.18em',
                color: modelReady ? c.text : c.textMuted,
              }}
            >
              {modelReady ? 'MODEL READY' : 'LOADING MODEL'}
            </span>
          </div>

          <section
            key={step}
            style={{
              animation: leaving
                ? 'receiving-stage-out 0.52s ease-in forwards'
                : 'receiving-stage-in 0.8s cubic-bezier(0.2,0.8,0.3,1) both',
            }}
          >
            <div
              style={{
                fontFamily: 'Fragment Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.16em',
                color: c.textMuted,
                marginBottom: 22,
              }}
            >
              {current.eyebrow}
            </div>

            <h1
              style={{
                margin: 0,
                fontFamily: 'Instrument Serif, serif',
                fontSize: 'clamp(42px, 7.2vw, 88px)',
                fontWeight: 400,
                lineHeight: 1,
                letterSpacing: '-0.035em',
                fontStyle: current.stage === 'received' ? 'italic' : 'normal',
                whiteSpace: 'pre-wrap',
              }}
            >
              {current.title}
            </h1>

            <p
              style={{
                maxWidth: 620,
                margin: '28px auto 0',
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(13px, 1.5vw, 17px)',
                lineHeight: 1.7,
                color: c.textMuted,
              }}
            >
              {current.body}
            </p>
          </section>

          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2" aria-hidden="true">
              {story.map((item, index) => (
                <span
                  key={item.stage}
                  style={{
                    display: 'block',
                    width: index === step ? 24 : 5,
                    height: 5,
                    borderRadius: 999,
                    background: c.text,
                    opacity: index === step ? 0.68 : 0.17,
                    transition: 'width 400ms ease, opacity 400ms ease',
                  }}
                />
              ))}
            </div>

            {modelReady && (
              <button
                type="button"
                onClick={onSkip}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: c.textMuted,
                  fontFamily: 'Fragment Mono, monospace',
                  fontSize: 8,
                  letterSpacing: '0.08em',
                  padding: '3px 5px',
                  cursor: 'pointer',
                  opacity: 0.7,
                }}
              >
                CONTINUE →
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
