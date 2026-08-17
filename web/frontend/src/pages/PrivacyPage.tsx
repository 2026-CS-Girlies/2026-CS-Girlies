import ReflectionShell from '@/components/reflection/ReflectionShell'
import { tk } from '@/theme/tokens'
import type { BgConfig } from '@/types/theme'

const LOCAL_MODEL_URL = import.meta.env.VITE_LOCAL_MODEL_URL ?? '#'

const PRIVACY_SECTIONS = [
  {
    title: 'No account required.',
    body: "Still True? does not ask for your name, email address, or a personal profile before you begin a reflection.",
  },
  {
    title: 'Your reflection is not stored as a history.',
    body: "The current demo does not write your conversation to a persistent conversation-history database. While an online reflection is active, the server may temporarily hold session state so it can respond to the current conversation.",
  },
  {
    title: 'Online responses require temporary processing.',
    body: "When you use the online model, the text needed to generate a response is sent to the Still True? backend and processed by the configured model service. The app is designed to minimize what is kept beyond the active reflection.",
  },
  {
    title: 'Prefer to keep everything local?',
    body: "You can run Still True? on your own computer with the local model. In local mode, the model and reflection workflow run on your machine. We recommend at least 16 GB of system memory for the local setup.",
    localLink: true,
  },
] as const

type Props = {
  bg: BgConfig
  isLight: boolean
  onBack: () => void
}

export default function PrivacyPage({ bg, isLight, onBack }: Props) {
  const c = tk(isLight)
  const textBase = isLight ? 'rgba(0,0,0,0.85)' : 'rgba(240,237,232,0.92)'
  const textMid = isLight ? 'rgba(0,0,0,0.50)' : 'rgba(240,237,232,0.52)'
  const textFaint = isLight ? 'rgba(0,0,0,0.28)' : 'rgba(240,237,232,0.28)'
  const divider = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'

  return (
    <ReflectionShell
      bg={bg}
      isLight={isLight}
      className="overflow-y-auto"
    >
      <main className="relative z-10 px-6 md:px-12 pb-28 pt-24 md:pt-28 max-w-2xl mx-auto">
        <button
          type="button"
          onClick={onBack}
          className="text-xs mb-10 transition-opacity hover:opacity-70"
          style={{
            fontFamily: 'Fragment Mono, monospace',
            color: textFaint,
            letterSpacing: '0.06em',
          }}
        >
          ← BACK
        </button>

        <header className="pb-14 md:pb-16">
          <p
            className="text-xs tracking-widest mb-5"
            style={{ fontFamily: 'Fragment Mono, monospace', color: textFaint }}
          >
            PRIVACY
          </p>

          <h1
            style={{
              fontFamily: 'Instrument Serif, serif',
              fontSize: 'clamp(38px,6vw,72px)',
              lineHeight: 1.04,
              letterSpacing: '-0.025em',
              color: textBase,
            }}
          >
            What we know
            <br />
            about you.
          </h1>

          <p
            className="mt-8"
            style={{
              fontFamily: 'Instrument Serif, serif',
              fontSize: 'clamp(24px,4vw,42px)',
              fontStyle: 'italic',
              lineHeight: 1.1,
              color: isLight
                ? 'rgba(0,0,0,0.30)'
                : 'rgba(255,255,255,0.24)',
            }}
          >
            As little as possible.
          </p>

          <p
            className="mt-5 text-sm leading-relaxed max-w-xl"
            style={{ fontFamily: 'Inter, sans-serif', color: textMid }}
          >
            Still True? is built around a simple principle: a private reflection
            should not require building a profile about you.
          </p>
        </header>

        <div style={{ borderTop: `1px solid ${divider}` }} />

        <section className="flex flex-col">
          {PRIVACY_SECTIONS.map((section) => (
            <div
              key={section.title}
              className="py-8 md:py-10 grid md:grid-cols-[1fr_1.6fr] gap-4 md:gap-12"
              style={{ borderBottom: `1px solid ${divider}` }}
            >
              <h2
                className="text-sm md:text-base font-medium leading-snug"
                style={{ fontFamily: 'Inter, sans-serif', color: textBase }}
              >
                {section.title}
              </h2>

              <div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ fontFamily: 'Inter, sans-serif', color: textMid }}
                >
                  {section.body}
                </p>

                {'localLink' in section && section.localLink && (
                  <a
                    href={LOCAL_MODEL_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all hover:opacity-75 active:scale-95"
                    style={{
                      fontFamily: 'Fragment Mono, monospace',
                      color: textBase,
                      border: `1px solid ${divider}`,
                      background: isLight
                        ? 'rgba(0,0,0,0.05)'
                        : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path
                        d="M6.5 2v7M3.5 6.5l3 3 3-3"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 11h9"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                    VIEW LOCAL MODEL
                  </a>
                )}
              </div>
            </div>
          ))}
        </section>

        <footer className="pt-12 flex flex-col gap-2">
          <p
            className="text-xs"
            style={{ fontFamily: 'Fragment Mono, monospace', color: textFaint }}
          >
            LAST UPDATED — AUGUST 2026
          </p>
          <p
            className="text-xs leading-relaxed"
            style={{ fontFamily: 'Fragment Mono, monospace', color: textFaint }}
          >
            Still True? is a guided self-reflection tool, not therapy,
            diagnosis, or medical advice. Keep what feels useful and revise
            anything that does not.
          </p>
        </footer>
      </main>
    </ReflectionShell>
  )
}
