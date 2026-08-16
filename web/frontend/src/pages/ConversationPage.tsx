import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import ChatPanel from '@/components/chat/ChatPanel'
import BottomNav from '@/components/reflection/BottomNav'
import PageIntro from '@/components/reflection/PageIntro'
import ReflectionShell from '@/components/reflection/ReflectionShell'
import StepHeader from '@/components/reflection/StepHeader'
import ConfirmationBubble from '@/components/chat/ConfirmationBubble'
import { sendConversationMessage, confirmBelief } from '@/services/conversationApi'
import { tk } from '@/theme/tokens'
import type { Message } from '@/types/chat'
import type { ConversationPhase, ModelSummaryData, OneStepConversationResponse } from '@/types/conversation'
import type { BgConfig } from '@/types/theme'
import { conversationPhaseConfig } from '@/config/conversationPhases'
import DustCanvas from '@/components/animation/DustCanvas'


// type Props = {
//   thought: string
//   bg: BgConfig
//   isLight: boolean
//   onComplete: (conversationId: string, summary: ModelSummaryData) => void
//   onBack: () => void
//   onRestart: () => void
// }

type Props = {
  thought: string
  initialConversation: OneStepConversationResponse
  bg: BgConfig
  isLight: boolean
  onBack: () => void
  onRestart: () => void
  onComplete: (conversationId: string, summary: ModelSummaryData) => void
}

export default function ConversationPage({ thought, bg, isLight, onComplete, onBack, onRestart, initialConversation }: Props) {
  const [conversationId, setConversationId] = useState<string>(initialConversation.conversation_id)
  const [messages, setMessages] = useState<Message[]>(()=>{
    if (!initialConversation.message) return []
    return [{ id: Date.now(), role: 'assistant', text: initialConversation.message }]
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [summary, setSummary] = useState<ModelSummaryData | null>(null)
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  
  const [leaving, setLeaving] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  // const startedRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const c = tk(isLight)
  // conversation phase state
  const [phase, setPhase] = useState<ConversationPhase>(initialConversation.phase)
  const phaseConfig = conversationPhaseConfig[phase]
  const [workingBelief, setWorkingBelief] = useState<string | null>(initialConversation.working_belief ?? null)
  const [balancedThought, setBalancedThought] = useState<string | null>(initialConversation.balanced_thought ?? null)

  const inputDisabled = isLoading ||
                        phase === 'belief_confirmation' ||
                        phase === 'evidence_form' ||
                        phase === 'verdict_confirmation' ||
                        phase === 'complete'

  // Focus input when the page loads and when loading completes
  useEffect(() => {
  if (!inputDisabled) {inputRef.current?.focus()}}, [inputDisabled])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }

    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // add meesage
  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || !conversationId || inputDisabled) return

    setInput('')
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: trimmed }])

    try {
      setIsLoading(true)
      setError('')

      const response = await sendConversationMessage(conversationId, trimmed)
      setPhase(response.phase)

      if (response.working_belief) setWorkingBelief(response.working_belief)
      if (response.balanced_thought) setBalancedThought(response.balanced_thought)
      
      const assistantMessage = response.message

      if (assistantMessage) {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: assistantMessage }])
      }

      if (response.stage_complete && response.data) {
        const summaryData = response.data as ModelSummaryData

        console.log('[SUMMARY]', summaryData)

        setSummary(summaryData)
        setIsComplete(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the message.')
    } finally {
      setIsLoading(false)
    }
  }

  const confirmWorkingBelief = async (confirmed: boolean) => {
    if (!conversationId || isLoading) return

    try {
      setIsLoading(true)
      setError('')

      const response = await confirmBelief(
        conversationId,
        confirmed,
      )

      setPhase(response.phase)

      if (response.working_belief) {
        setWorkingBelief(response.working_belief)
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not confirm the thought.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') void sendMessage()
  }

  const goToReflection = () => {
    if (conversationId && summary && isComplete) {
      onComplete(conversationId, summary)
    }
  }

  console.log('[INITIAL CONVERSATION]', initialConversation)
  console.log('[INITIAL PHASE]', initialConversation.phase)
  console.log('[INITIAL BELIEF]', initialConversation.working_belief)

  
  return (
    <>
      {leaving && <DustCanvas isLight={isLight} onDone={onRestart} />}

      <ReflectionShell bg={bg} isLight={isLight} className="flex flex-col overflow-hidden">
        <div className="flex flex-col flex-1 min-h-0" style={{ opacity: leaving ? 0 : 1, transform: leaving ? 'scale(0.96)' : 'scale(1)', filter: leaving ? 'blur(10px)' : 'blur(0)', transition: leaving ? 'opacity 0.55s ease-in, transform 0.6s ease-in, filter 0.5s ease-in' : 'none' }}>
          <StepHeader current={phaseConfig.step} total="04" isLight={isLight} onBack={onBack} onRestart={() => setLeaving(true)} className="px-5 md:px-8 pt-4 md:pt-6 pb-1 md:pb-4" />

          <PageIntro isLight={isLight} title={phaseConfig.title} description={phaseConfig.description} className="px-5 md:px-8 pt-2 md:pt-2 pb-4 md:pb-5 flex-none" />

          <ChatPanel isLight={isLight} messages={messages} openingThought={thought} input={input} onInputChange={setInput} onSend={() => void sendMessage()} onKeyDown={handleKey} isLoading={isLoading} isComplete={inputDisabled} error={error} placeholder="Write what comes to mind…" bottomRef={bottomRef} inputRef={inputRef}>
            
            {phase === 'belief_confirmation' && workingBelief && (
              <ConfirmationBubble
                isLight={isLight}
                message={
                  <>
                    This sounds like the thought that’s been weighing on you.
                    <span className="block mt-2">
                      “{workingBelief}”
                    </span>
                  </>
                }
                rejectLabel="Not Quite"
                confirmLabel="Yes, That’s It →"
                onReject={() => void confirmWorkingBelief(false)}
                onConfirm={() => void confirmWorkingBelief(true)}
              />
            )}

            {isComplete && (
              <ConfirmationBubble
                isLight={isLight}
                message={
                  <>
                    We’ve gathered enough evidence.
                    <br />
                    Ready to build a more balanced view?
                  </>
                }
                rejectLabel="Not Yet"
                confirmLabel="Yes, I’m Ready →"
                onReject={() => setIsComplete(false)}
                onConfirm={goToReflection}
              />
            )}
            
          </ChatPanel>

          <BottomNav isLight={isLight} onBack={onBack} backLabel="HOME" onNext={goToReflection} nextLabel="SEE MY REFLECTION" nextDisabled={!isComplete || !summary || !conversationId} />
        </div>
      </ReflectionShell>
    </>
  )
}
