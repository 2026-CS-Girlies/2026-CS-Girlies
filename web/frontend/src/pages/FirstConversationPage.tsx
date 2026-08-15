import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import ChatPanel from '@/components/chat/ChatPanel'
import BottomNav from '@/components/reflection/BottomNav'
import PageIntro from '@/components/reflection/PageIntro'
import ReflectionShell from '@/components/reflection/ReflectionShell'
import StepHeader from '@/components/reflection/StepHeader'
import { sendCTMessage, startConversation } from '@/services/conversationApi'
import type { Message } from '@/types/chat'
import type { CTReviewData } from '@/types/conversation'
import type { BgConfig } from '@/types/theme'

type Props = {
  thought: string
  bg: BgConfig
  isLight: boolean
  onComplete: (conversationId: string, data: CTReviewData) => void
  onBack: () => void
  onRestart: () => void
}

export default function FirstConversationPage({ thought, bg, isLight, onComplete, onBack, onRestart }: Props) {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [reviewData, setReviewData] = useState<CTReviewData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoading && !isComplete) {inputRef.current?.focus()}}, [isLoading, isComplete])

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const begin = async () => {
      try {
        setIsLoading(true)
        setError('')
        const response = await startConversation(thought)
        setConversationId(response.conversation_id)
        setReviewData(response.data)
        setIsComplete(response.stage_complete)
        if (response.message) setMessages([{ id: Date.now(), role: 'assistant', text: response.message }])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not start the conversation.')
      } finally {
        setIsLoading(false)
      }
    }

    void begin()
  }, [thought])

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
      const response = await sendCTMessage(conversationId, trimmed)
      setReviewData(response.data)
      setIsComplete(response.stage_complete)
      if (response.message) setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: response.message }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the message.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') void sendMessage()
  }

  const goNext = () => {
    if (conversationId && reviewData && isComplete) onComplete(conversationId, reviewData)
  }

  return (
    <ReflectionShell bg={bg} isLight={isLight} className="flex flex-col overflow-hidden">
      <StepHeader current="01" total="04" isLight={isLight} onBack={onBack} onRestart={onRestart} className="px-5 md:px-8 pt-6 md:pt-8 pb-3 md:pb-4" />
      <PageIntro isLight={isLight} title={<><em>Understand</em> the Thought</>} description="We’ll begin with what happened and the thought that came up, then explore the beliefs that may be shaping how it feels." className="px-5 md:px-8 pt-5 md:pt-6 pb-4 md:pb-5 flex-none" />
      <ChatPanel isLight={isLight} messages={messages} openingThought={thought} input={input} onInputChange={setInput} onSend={() => void sendMessage()} onKeyDown={handleKey} isLoading={isLoading} isComplete={isComplete} error={error} completePlaceholder="Ready to review" bottomRef={bottomRef} inputRef={inputRef}/>
      <BottomNav isLight={isLight} onBack={onBack} onNext={goNext} nextLabel="REVIEW" nextDisabled={!isComplete || !reviewData || !conversationId} />
    </ReflectionShell>
  )
}
