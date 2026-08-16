import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import DustCanvas from '@/components/animation/DustCanvas'
import ChatPanel from '@/components/chat/ChatPanel'
import ConfirmationBubble from '@/components/chat/ConfirmationBubble'
import EvidenceTray from '@/components/chat/EvidenceTray'
import ReflectionGuideActions from '@/components/chat/ReflectionGuideActions'
import BottomNav from '@/components/reflection/BottomNav'
import PageIntro from '@/components/reflection/PageIntro'
import ReflectionShell from '@/components/reflection/ReflectionShell'
import StepHeader from '@/components/reflection/StepHeader'
import { conversationPhaseConfig } from '@/config/conversationPhases'
import { completeEvidenceCollection, completeReflection, confirmBelief, sendConversationMessage } from '@/services/conversationApi'
import type { Message } from '@/types/chat'
import type { ConversationPhase, ConversationResponse } from '@/types/conversation'
import type { BgConfig } from '@/types/theme'

type Props = {
  thought: string
  initialConversation: ConversationResponse
  bg: BgConfig
  isLight: boolean
  onBack: () => void
  onRestart: () => void
  onComplete: (conversationId: string) => void
}

const STEP_HELP_MESSAGE = "This step is for looking at the thought from different angles at your own pace. There isn't a required number of questions or a correct conclusion. Keep talking for as long as it feels useful, and choose when you're ready to see what changed."

export default function ConversationPage({ thought, bg, isLight, onComplete, onBack, onRestart, initialConversation }: Props) {
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
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const phaseConfig = conversationPhaseConfig[phase]

  const inputDisabled = isLoading || phase === 'belief_confirmation' || phase === 'complete'

  useEffect(() => {
    if (!inputDisabled) inputRef.current?.focus()
  }, [inputDisabled])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, phase, evidence])

  const appendAssistantMessage = (message: string | null) => {
    if (!message) return
    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: message }])
  }

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || inputDisabled) return

    setInput('')
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: trimmed }])

    try {
      setIsLoading(true)
      setError('')

      const response = await sendConversationMessage(conversationId, trimmed)

      if (phase === 'evidence_form') setEvidence(prev => [...prev, trimmed])

      appendAssistantMessage(response.message)
      if (response.working_belief) setWorkingBelief(response.working_belief)
      setPhase(response.phase)
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

      const response = await confirmBelief(conversationId, confirmed)
      setPhase(response.phase)
      if (response.working_belief) setWorkingBelief(response.working_belief)
      appendAssistantMessage(response.message)
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

      const response = await completeEvidenceCollection(conversationId)
      setPhase(response.phase)
      appendAssistantMessage(response.message)
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
      await completeReflection(conversationId)
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

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') void sendMessage()
  }

  return (
    <>
      {leaving && <DustCanvas isLight={isLight} onDone={onRestart} />}

      <ReflectionShell bg={bg} isLight={isLight} className="flex flex-col overflow-hidden">
        <div className="flex flex-col flex-1 min-h-0" style={{ opacity: leaving ? 0 : 1, transform: leaving ? 'scale(0.96)' : 'scale(1)', filter: leaving ? 'blur(10px)' : 'blur(0)', transition: leaving ? 'opacity 0.55s ease-in, transform 0.6s ease-in, filter 0.5s ease-in' : 'none' }}>
          <StepHeader current={phaseConfig.step} total="03" isLight={isLight} onBack={onBack} onRestart={() => setLeaving(true)} className="px-5 md:px-8 pt-4 md:pt-6 pb-1 md:pb-4" />
          <PageIntro isLight={isLight} title={phaseConfig.title} description={phaseConfig.description} className="px-5 md:px-8 pt-2 md:pt-2 pb-4 md:pb-5 flex-none" />

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
            inputActions={phase === 'reflection' ? (
              <ReflectionGuideActions isLight={isLight} isLoading={isLoading} onReady={() => void finishReflection()} onHelp={showStepHelp} />
            ) : undefined}
          >
            {phase === 'evidence_form' && <EvidenceTray evidence={evidence} isLight={isLight} isLoading={isLoading} onComplete={() => void finishEvidence()} />}

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

          {phase !== 'reflection' && phase !== 'complete' && (
            <BottomNav isLight={isLight} onBack={onBack} backLabel="HOME" onNext={() => {}} nextLabel="SEE MY REFLECTION" nextDisabled />
          )}
        </div>
      </ReflectionShell>
    </>
  )
}
