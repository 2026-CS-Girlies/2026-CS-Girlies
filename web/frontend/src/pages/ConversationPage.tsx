import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import DustCanvas from '@/components/animation/DustCanvas'
import ChatPanel from '@/components/chat/ChatPanel'
import ConfirmationBubble from '@/components/chat/ConfirmationBubble'
import EvidenceTray from '@/components/chat/EvidenceTray'
import ReflectionGuideActions from '@/components/chat/ReflectionGuideActions'
import HackathonFooter from '@/components/layout/HackathonFooter'
import ThemeButton from '@/components/landing/ThemeButton'
import PageIntro from '@/components/reflection/PageIntro'
import ReflectionShell from '@/components/reflection/ReflectionShell'
import StepHeader from '@/components/reflection/StepHeader'
import { conversationPhaseConfig } from '@/config/conversationPhases'
import { DEMO_TRANSITIONS, DEMO_TURNS } from '@/data/demoConversation'

const DEMO_EVIDENCE_COUNT = DEMO_TURNS.filter(turn => turn.phase === 'evidence_form').length
import { completeEvidenceCollection, completeReflection, confirmBelief, sendConversationMessage } from '@/services/conversationApi'
import type { Message } from '@/types/chat'
import type { ConversationPhase, ConversationResponse } from '@/types/conversation'
import type { BgConfig, SoundId, ThemeId } from '@/types/theme'

type Props = {
  thought: string
  initialConversation: ConversationResponse
  bg: BgConfig
  isLight: boolean
  onBack: () => void
  onRestart: () => void
  onComplete: (conversationId: string) => void
  demoMode?: boolean
  onBgChange: (bg: BgConfig) => void
  onSoundChange: (sound: SoundId) => void
  activeThemeId: ThemeId | null
  onThemeId: (id: ThemeId | null) => void
}

const STEP_HELP_MESSAGE = "This step is for looking at the thought from different angles at your own pace. There isn't a required number of questions or a correct conclusion. Keep talking for as long as it feels useful, and choose when you're ready to see what changed."
const MODEL_INFO_MESSAGE = `Crispers-14B is a language model designed for multi-turn cognitive restructuring conversations.

It was developed from research on helping people identify and reconsider negative thoughts through supportive dialogue.

Paper:
https://aclanthology.org/2025.emnlp-main.1652/

Hugging Face:
https://huggingface.co/thu-coai/Crispers-7B-v1`

export default function ConversationPage({ thought, bg, isLight, onComplete, onBack, onRestart, initialConversation, demoMode = false, onBgChange, onSoundChange, activeThemeId, onThemeId }: Props) {
  const conversationId = initialConversation.conversation_id
  const [messages, setMessages] = useState<Message[]>(() => {
    if (!initialConversation.message) return []
    return [{ id: Date.now(), role: 'assistant', text: initialConversation.message }]
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [leaving, setLeaving] = useState(false)
  const [phase, setPhase] = useState<ConversationPhase>(initialConversation.phase)
  const [workingBelief, setWorkingBelief] = useState<string | null>(initialConversation.working_belief)
  const [evidence, setEvidence] = useState<string[]>([])
  const [demoReflectionComplete, setDemoReflectionComplete] = useState(false)
  const [demoTurnIndex, setDemoTurnIndex] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const phaseConfig = conversationPhaseConfig[phase]

  const inputDisabled = isLoading || phase === 'belief_confirmation' || phase === 'complete'

  useEffect(() => {
    if (!inputDisabled) inputRef.current?.focus()
  }, [inputDisabled])

  useEffect(() => {
    if (!demoMode || inputDisabled) return
    const turn = DEMO_TURNS[demoTurnIndex]
    if (turn) setInput(turn.user)
  }, [demoMode, demoTurnIndex, inputDisabled])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, phase, evidence])

  const appendAssistantMessage = (message: string | null) => {
    if (!message) return
    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: message }])
  }

  const sendMessage = async () => {
    if (inputDisabled) return

    const demoTurn = demoMode ? DEMO_TURNS[demoTurnIndex] : undefined
    if (demoMode && !demoTurn) return

    const messageToSend = demoMode ? demoTurn!.user : input.trim()
    if (!messageToSend) return

    setInput('')
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: messageToSend }])

    try {
      setIsLoading(true)
      setError('')

      if (demoMode && demoTurn) {
        const turn = demoTurn

        appendAssistantMessage(turn.assistant)
        if (turn.workingBelief) setWorkingBelief(turn.workingBelief)
        if (turn.nextPhase) setPhase(turn.nextPhase)
        if (turn.phase === 'evidence_form') setEvidence(prev => [...prev, turn.user])

        const nextIndex = demoTurnIndex + 1
        setDemoTurnIndex(nextIndex)

        if (nextIndex >= DEMO_TURNS.length) {
          setDemoReflectionComplete(true)
        }
      } else {
        const response = await sendConversationMessage(conversationId, messageToSend)

        if (phase === 'evidence_form') setEvidence(prev => [...prev, messageToSend])

        appendAssistantMessage(response.message)
        if (response.working_belief) setWorkingBelief(response.working_belief)
        setPhase(response.phase)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the message.')
    } finally {
      setIsLoading(false)
    }
  }

  const confirmWorkingBelief = async (confirmed: boolean) => {
    if (isLoading) return

    try {
      setIsLoading(true)
      setError('')

      if (demoMode) {
        if (confirmed) {
          setPhase('evidence_form')
          appendAssistantMessage(DEMO_TRANSITIONS.beliefConfirmed)
        } else {
          setPhase('working_belief')
          appendAssistantMessage(DEMO_TRANSITIONS.beliefRejected)
        }
      } else {
        const response = await confirmBelief(conversationId, confirmed)
        setPhase(response.phase)
        if (response.working_belief) setWorkingBelief(response.working_belief)
        appendAssistantMessage(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not confirm the thought.')
    } finally {
      setIsLoading(false)
    }
  }

  const finishEvidence = async () => {
    if (isLoading || evidence.length === 0) return

    try {
      setIsLoading(true)
      setError('')

      if (demoMode) {
        setPhase('reflection')
        appendAssistantMessage(DEMO_TRANSITIONS.evidenceComplete)
      } else {
        const response = await completeEvidenceCollection(conversationId)
        setPhase(response.phase)
        appendAssistantMessage(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not continue the reflection.')
    } finally {
      setIsLoading(false)
    }
  }

  const finishReflection = async () => {
    if (isLoading || phase !== 'reflection') return

    try {
      setIsLoading(true)
      setError('')
      if (!demoMode) await completeReflection(conversationId)
      onComplete(conversationId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your reflection.')
    } finally {
      setIsLoading(false)
    }
  }

  const showStepHelp = () => {
    setMessages(prev => {
      const last = prev[prev.length - 1]
      if (last?.role === 'assistant' && last.text === STEP_HELP_MESSAGE) return prev
      return [...prev, { id: Date.now(), role: 'assistant', text: STEP_HELP_MESSAGE }]
    })
  }

  const showModelInfo = () => {
    setMessages(prev => {
      const last = prev[prev.length - 1]
      if (last?.role === 'assistant' && last.text === MODEL_INFO_MESSAGE) return prev
      return [...prev, { id: Date.now(), role: 'assistant', text: MODEL_INFO_MESSAGE }]
    })
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') void sendMessage()
  }

  return (
    <>
      {leaving && <DustCanvas isLight={isLight} onDone={onRestart} />}

      <ReflectionShell bg={bg} isLight={isLight} className="h-dvh flex flex-col overflow-hidden">
        <div className="flex flex-col flex-1 min-h-0" style={{ opacity: leaving ? 0 : 1, transform: leaving ? 'scale(0.96)' : 'scale(1)', filter: leaving ? 'blur(10px)' : 'blur(0)', transition: leaving ? 'opacity 0.55s ease-in, transform 0.6s ease-in, filter 0.5s ease-in' : 'none' }}>
          <StepHeader simpleNav leftLabel="Home" rightLabel="End" isLight={isLight} onBack={onBack} onRestart={() => setLeaving(true)} className="px-5 md:px-8 pt-4 md:pt-6 pb-1 md:pb-4" />
          <PageIntro isLight={isLight} title={phaseConfig.title} description={phaseConfig.description} className="px-5 md:px-8 pt-2 md:pt-2 pb-4 md:pb-5 flex-none" />

            <div className="w-full max-w-4xl mx-auto flex-1 min-h-0 px-3 md:px-0 pb-3 md:pb-4 flex flex-col">
            <div className="flex-1 min-h-0 flex flex-col mx-3 md:mx-6 mb-10 rounded-[24px] overflow-hidden">
              <ChatPanel
              isLight={isLight}
              messages={messages}
              openingThought={thought}
              input={input}
              onInputChange={setInput}
              onSend={() => void sendMessage()}
              onKeyDown={handleKey}
              isLoading={isLoading}
              isComplete={inputDisabled}
              error={error}
              placeholder="Write what comes to mind…"
              bottomRef={bottomRef}
              inputRef={inputRef}
              inputReadOnly={demoMode}
              inputActions={
                <ReflectionGuideActions
                  isLight={isLight}
                  isLoading={isLoading}
                  onReady={() => void finishReflection()}
                  onModelInfo={showModelInfo}
                  onEndDemo={demoMode ? () => setLeaving(true) : undefined}
                  emphasizeReady={demoMode && demoReflectionComplete}
                  summaryDisabled={phase !== 'reflection'}
                />
              }
            >
              {phase === 'evidence_form' && <EvidenceTray evidence={evidence} isLight={isLight} isLoading={isLoading} onComplete={() => void finishEvidence()} emphasizeComplete={demoMode && evidence.length >= DEMO_EVIDENCE_COUNT} />}

              {phase === 'belief_confirmation' && workingBelief && (
                <ConfirmationBubble
                  isLight={isLight}
                  message={<>This sounds like the thought that’s been weighing on you.<span className="block mt-2">“{workingBelief}”</span></>}
                  rejectLabel="Not Quite"
                  confirmLabel="Yes, That’s It →"
                  onReject={() => void confirmWorkingBelief(false)}
                  onConfirm={() => void confirmWorkingBelief(true)}
                />
              )}
            </ChatPanel>
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
    </>
  )
}
