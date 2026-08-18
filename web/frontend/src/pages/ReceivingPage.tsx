import { useEffect, useRef, useState } from 'react'
import ChatBubble from '@/components/chat/ChatBubble'
import ConfirmationBubble from '@/components/chat/ConfirmationBubble'
import HackathonFooter from '@/components/layout/HackathonFooter'
import ThemeButton from '@/components/landing/ThemeButton'
import PageIntro from '@/components/reflection/PageIntro'
import ReflectionShell from '@/components/reflection/ReflectionShell'
import StepHeader from '@/components/reflection/StepHeader'
import { tk } from '@/theme/tokens'
import type { BgConfig, SoundId, ThemeId } from '@/types/theme'

type Props = {
  thought: string
  bg: BgConfig
  isLight: boolean
  modelReady: boolean
  onContinue: () => void
  onBack: () => void
  onRestart: () => void
  onBgChange: (bg: BgConfig) => void
  onSoundChange: (sound: SoundId) => void
  activeThemeId: ThemeId | null
  onThemeId: (id: ThemeId | null) => void
}

type ChatMessage = {
  id: number
  role: 'user' | 'assistant'
  text: string
}

type QuickReply = {
  id: string
  label: string
}

const MAIN_REPLIES: QuickReply[] = [
  { id: 'cbt', label: 'What is CBT?' },
  { id: 'demo', label: 'Show me a demo' },
  { id: 'traps', label: 'Common thinking traps' },
  { id: 'already', label: 'I know CBT already' },
]

const CBT_REPLIES: QuickReply[] = [
  { id: 'demo', label: 'Show me how' },
  { id: 'traps', label: 'Thinking traps' },
  { id: 'home', label: 'Back' },
]

const DEMO_REPLIES: QuickReply[] = [
  { id: 'demo-more', label: 'Continue the demo' },
  { id: 'traps', label: 'Thinking traps' },
  { id: 'home', label: 'Back' },
]

const TRAP_REPLIES: QuickReply[] = [
  { id: 'trap-next', label: 'Another one →' },
  { id: 'demo', label: 'Show me a demo' },
  { id: 'home', label: 'Back' },
]

const EXPERIENCED_REPLIES: QuickReply[] = [
  { id: 'play', label: 'Give me a quick prompt' },
  { id: 'worksheet', label: 'Browse a mini worksheet' },
  { id: 'research', label: 'Why does this work?' },
  { id: 'home', label: 'Back' },
]

const TRAPS = [
  {
    title: 'ALL-OR-NOTHING THINKING',
    example: `“If I don't do this perfectly, I've completely failed.”`,
  },
  {
    title: 'MIND READING',
    example: `“She didn't reply. She must be annoyed with me.”`,
  },
  {
    title: 'CATASTROPHIZING',
    example: `“If I mess this up, everything is going to fall apart.”`,
  },
]

export default function ReceivingPage({
  thought,
  bg,
  isLight,
  modelReady,
  onContinue,
  onBack,
  onRestart,
  onBgChange,
  onSoundChange,
  activeThemeId,
  onThemeId,
}: Props) {
  const c = tk(isLight)

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'assistant',
      text: `Still True is on its way. It usually takes around a minute to get ready, so while we wait, want to explore something?`,
    },
  ])

  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(MAIN_REPLIES)
  const [trapIndex, setTrapIndex] = useState(0)

  const nextId = useRef(2)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const actionButtonStyle = {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
    border: `0.5px solid ${isLight ? 'rgba(0,0,0,0.09)' : 'rgba(255,255,255,0.11)'}`,
    color: isLight ? '#555555' : '#aaaaaa',
  } as const

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, quickReplies, modelReady])

  const appendAssistant = (text: string) => {
    setMessages(current => [
      ...current,
      { id: nextId.current++, role: 'assistant', text },
    ])
  }

  const handleQuickReply = (reply: QuickReply) => {
    setMessages(current => [
      ...current,
      { id: nextId.current++, role: 'user', text: reply.label },
    ])

    switch (reply.id) {
      case 'cbt':
        appendAssistant(
          `CBT is based on a simple idea: what happens to us matters, but the meaning our mind gives it matters too. For example: “My manager corrected my work.” → “Everyone thinks I'm incompetent.” → anxiety or shame. Still True helps you slow down that middle step and ask whether it tells the whole story.`,
        )
        setQuickReplies(CBT_REPLIES)
        break

      case 'demo':
        appendAssistant(
          `Here's a quick example. Someone thinks: “I'm falling behind because AI is changing everything.” Still True might ask: “What are you afraid all this change means about you?” That helps move from the situation to the thought underneath it.`,
        )
        setQuickReplies(DEMO_REPLIES)
        break

      case 'demo-more':
        appendAssistant(
          `They answer: “That my skills are becoming obsolete.” Instead of saying “don't worry,” Still True looks at what makes that feel true, what the evidence actually supports, and what may be missing from the picture.`,
        )
        setQuickReplies([
          { id: 'traps', label: 'Show me a thinking trap' },
          { id: 'home', label: 'Back to topics' },
        ])
        break

      case 'traps': {
        const trap = TRAPS[0]
        setTrapIndex(0)
        appendAssistant(`${trap.title}\n${trap.example}\n\nSound familiar?`)
        setQuickReplies(TRAP_REPLIES)
        break
      }

      case 'trap-next': {
        const next = (trapIndex + 1) % TRAPS.length
        const trap = TRAPS[next]

        setTrapIndex(next)
        appendAssistant(`${trap.title}\n${trap.example}`)
        setQuickReplies(TRAP_REPLIES)
        break
      }

      case 'already':
        appendAssistant(`Got it. Want something a little different while the model wakes up?`)
        setQuickReplies(EXPERIENCED_REPLIES)
        break

      case 'play':
        appendAssistant(
          `Try this: think of one sentence your mind says when something goes wrong. Then ask, “What happened — and what did I conclude from it?” That gap is often where the interesting part starts.`,
        )
        setQuickReplies(EXPERIENCED_REPLIES)
        break

      case 'worksheet':
        appendAssistant(
          `A tiny three-line worksheet:\n1. What happened?\n2. What did your mind say it meant?\n3. What evidence would make that conclusion more — or less — complete?`,
        )
        setQuickReplies(EXPERIENCED_REPLIES)
        break

      case 'research':
        appendAssistant(
          `The basic CBT idea is not to force a positive thought. It's to examine whether an automatic interpretation is accurate, useful, and supported by the full evidence — then build a more balanced view.`,
        )
        setQuickReplies(EXPERIENCED_REPLIES)
        break

      case 'home':
        appendAssistant(`What would you like to explore?`)
        setQuickReplies(MAIN_REPLIES)
        break
    }
  }

  return (
    <ReflectionShell bg={bg} isLight={isLight} className="h-dvh flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0">
        <StepHeader
          simpleNav
          leftLabel="Home"
          rightLabel="End"
          isLight={isLight}
          onBack={onBack}
          onRestart={onRestart}
          className="px-5 md:px-8 pt-4 md:pt-6 pb-1 md:pb-4"
        />

        <PageIntro
          isLight={isLight}
          title="While You Wait"
          description={modelReady
            ? 'Your model is ready whenever you are.'
            : 'The model is waking up. Explore something while it gets ready.'}
          className="px-5 md:px-8 pt-2 md:pt-2 pb-4 md:pb-5 flex-none"
        />

        <div className="relative w-full max-w-4xl mx-auto flex-1 min-h-0 px-3 md:px-0 pb-3 md:pb-4 flex flex-col">
          <div
            className="relative z-10 flex-1 min-h-0 flex flex-col mx-3 md:mx-6 mb-10 rounded-[24px] overflow-hidden"
            style={{
              background: c.panelBg,
              border: `1px solid ${c.border}`,
              backdropFilter: 'blur(28px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(28px) saturate(1.4)',
              boxShadow: c.panelShadow,
            }}
          >
            <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-8 py-4 flex flex-col gap-3 md:gap-4">
              <ChatBubble role="user" isLight={isLight} quoted>
                <p className="font-medium">"{thought}"</p>
              </ChatBubble>

              {messages.map(message => (
                <ChatBubble key={message.id} role={message.role} isLight={isLight}>
                  {message.text}
                </ChatBubble>
              ))}

              {modelReady && (
                <ConfirmationBubble
                  isLight={isLight}
                  message={<>StillTrue is ready. You can start your reflection whenever you're ready.</>}
                  rejectLabel="Keep Exploring"
                  confirmLabel="Start Reflection →"
                  onReject={() => {}}
                  onConfirm={onContinue}
                />
              )}

              <div ref={bottomRef} />
            </div>

            <div
              className="flex-none px-4 md:px-8 pt-3 pb-2 flex flex-col gap-2"
              style={{ borderTop: `1px solid ${c.divider}` }}
            >
              <div className="flex flex-wrap gap-2">
                {quickReplies.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleQuickReply(option)}
                    className="flex items-center gap-[6px] px-3 py-1.5 rounded-[10px] text-xs whitespace-nowrap transition-all duration-150 hover:opacity-80 active:scale-95"
                    style={actionButtonStyle}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div
                className="flex items-center gap-3 rounded-2xl px-4 py-2.5 md:py-3"
                style={{
                  background: c.inputBg,
                  border: `1px solid ${c.inputBorder}`,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                <input
                  type="text"
                  value=""
                  readOnly
                  disabled
                  placeholder={modelReady ? 'Model ready' : 'Model is loading…'}
                  className="flex-1 min-w-0 text-sm outline-none bg-transparent cursor-default disabled:opacity-60"
                  style={{ fontFamily: 'Inter, sans-serif', color: c.inputText }}
                />

                <button
                  type="button"
                  disabled={!modelReady}
                  onClick={() => {
                    if (modelReady) {
                      onContinue()
                    }
                  }}
                  aria-label={modelReady ? 'Start conversation' : 'Model loading'}
                  className={`
                    w-8 h-8
                    rounded-full
                    flex items-center justify-center
                    transition-all duration-150
                    disabled:opacity-40
                    ${
                      modelReady
                        ? 'demo-ready-sparkle cursor-pointer hover:opacity-80 active:scale-95'
                        : 'cursor-not-allowed'
                    }
                  `}
                  style={{
                    background: c.sendBg,
                    border: `1px solid ${c.sendBorder}`,
                  }}
                >
                  {!modelReady ? (
                    <span
                      className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin"
                      style={{ color: isLight ? '#555' : '#aaa' }}
                    />
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <path
                        d="M3 7h8M8 4l3 3-3 3"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 z-30">
            <ThemeButton
              isLight={isLight}
              activeThemeId={activeThemeId}
              inline
              onTheme={(newBg, newSound, id) => {
                onBgChange(newBg)
                onSoundChange(newSound)
                onThemeId(id)
              }}
            />
          </div>
        </div>

        <div className="flex-none">
          <HackathonFooter isLight={isLight} />
        </div>
      </div>
    </ReflectionShell>
  )
}