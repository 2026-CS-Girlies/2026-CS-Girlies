import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import ChatPanel from '@/components/chat/ChatPanel'
import BottomNav from '@/components/reflection/BottomNav'
import PageIntro from '@/components/reflection/PageIntro'
import ReflectionShell from '@/components/reflection/ReflectionShell'
import StepHeader from '@/components/reflection/StepHeader'
import ChatBubble from '@/components/chat/ChatBubble'
import { startOneStepConversation, sendConversationMessage } from '@/services/conversationApi'
import { tk } from '@/theme/tokens'
import type { Message } from '@/types/chat'
import type { ModelSummaryData, OneStepConversationResponse } from '@/types/conversation'
import type { BgConfig } from '@/types/theme'
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

  // Focus input when the page loads and when loading completes
  useEffect(() => {
    if (!isLoading && !isComplete) {inputRef.current?.focus()}}, [isLoading, isComplete])

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

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || !conversationId || isLoading || isComplete) return

    setInput('')
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: trimmed }])

    try {
      setIsLoading(true)
      setError('')

      const response = await sendConversationMessage(conversationId, trimmed)
      const assistantMessage = response.message

      // console.log('[MESSAGE RESPONSE]', response)

      if (assistantMessage) {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: assistantMessage }])
      }

      if (response.stage_complete && response.data) {
        const summaryData = response.data as ModelSummaryData

        console.log('[SUMMARY]', summaryData)

        setSummary(summaryData)
        setIsComplete(true)
        setShowReadyPrompt(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the message.')
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

  const [showReadyPrompt, setShowReadyPrompt] = useState(false)

  return (
    <>
      {leaving && <DustCanvas isLight={isLight} onDone={onRestart} />}

      <ReflectionShell bg={bg} isLight={isLight} className="flex flex-col overflow-hidden">
        <div className="flex flex-col flex-1 min-h-0" style={{ opacity: leaving ? 0 : 1, transform: leaving ? 'scale(0.96)' : 'scale(1)', filter: leaving ? 'blur(10px)' : 'blur(0)', transition: leaving ? 'opacity 0.55s ease-in, transform 0.6s ease-in, filter 0.5s ease-in' : 'none' }}>
          <StepHeader current="01" total="02" isLight={isLight} onBack={onBack} onRestart={() => setLeaving(true)} className="px-5 md:px-8 pt-4 md:pt-6 pb-1 md:pb-4" />

          <PageIntro isLight={isLight} title={<>Take a <em>Closer Look</em></>} description="We’ll start with what happened and the thought that came up. Then we’ll look at what makes it feel true — and what it might be leaving out." className="px-5 md:px-8 pt-2 md:pt-2 pb-4 md:pb-5 flex-none" />

          <ChatPanel isLight={isLight} messages={messages} openingThought={thought} input={input} onInputChange={setInput} onSend={() => void sendMessage()} onKeyDown={handleKey} isLoading={isLoading} isComplete={isComplete} error={error} placeholder="Write what comes to mind…" bottomRef={bottomRef} inputRef={inputRef}>
            {showReadyPrompt && (
              <ChatBubble role="assistant" isLight={isLight}>
                <p className="text-sm font-medium leading-relaxed">We’ve gathered enough evidence.<br />Ready to build a more balanced view?</p>
                <div className="flex items-center gap-3 mt-4">
                  <button onClick={() => { setShowReadyPrompt(false); setIsComplete(false) }} className="text-sm px-4 py-2 rounded-full hover:opacity-80" style={{ color: c.textMuted, border: `1px solid ${c.border}` }}>Not Yet</button>
                  <button onClick={goToReflection} className="text-sm px-4 py-2 rounded-full hover:opacity-80" style={{ background: c.sendBg, border: `1px solid ${c.sendBorder}`, color: c.text }}>Yes, I’m Ready →</button>
                </div>
              </ChatBubble>
            )}
          </ChatPanel>

          <BottomNav isLight={isLight} onBack={onBack} backLabel="HOME" onNext={goToReflection} nextLabel="SEE MY REFLECTION" nextDisabled={!isComplete || !summary || !conversationId} />
        </div>
      </ReflectionShell>
    </>
  )
}
