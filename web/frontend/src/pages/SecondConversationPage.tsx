import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import ChatPanel from '@/components/chat/ChatPanel'
import BottomNav from '@/components/reflection/BottomNav'
import PageIntro from '@/components/reflection/PageIntro'
import ReflectionShell from '@/components/reflection/ReflectionShell'
import StepHeader from '@/components/reflection/StepHeader'
import { sendDATMessage, startDAT } from '@/services/conversationApi'
import type { Message } from '@/types/chat'
import type { CTReviewData, DATStateData, FinalReflectionData } from '@/types/conversation'
import type { BgConfig } from '@/types/theme'

type Props = {
  conversationId: string
  reviewData: CTReviewData
  bg: BgConfig
  isLight: boolean
  onComplete: (result: FinalReflectionData) => void
  onBack: () => void
  onRestart: () => void
}

export default function SecondConversationPage({ conversationId, reviewData, bg, isLight, onComplete, onBack, onRestart }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [datState, setDatState] = useState<DATStateData | null>(null)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const [result, setResult] = useState<FinalReflectionData | null>(null)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const begin = async () => {
      try {
        setIsLoading(true)
        setError('')
        const response = await startDAT(conversationId, reviewData)
        setDatState(response.data)
        setIsComplete(response.stage_complete)
        setResult(response.result ?? null)
        if (response.message) setMessages([{ id: Date.now(), role: 'assistant', text: response.message }])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not start the second conversation.')
      } finally {
        setIsLoading(false)
      }
    }

    void begin()
  }, [conversationId, reviewData])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading || isComplete) return

    setInput('')
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: trimmed }])

    try {
      setIsLoading(true)
      setError('')
      const response = await sendDATMessage(conversationId, trimmed)
      setDatState(response.data)
      setIsComplete(response.stage_complete)
      setResult(response.result ?? null)
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

  return (
    <ReflectionShell bg={bg} isLight={isLight} className="flex flex-col overflow-hidden">
      <StepHeader current="03" total="04" isLight={isLight} onBack={onBack} onRestart={onRestart} className="px-5 md:px-8 pt-6 md:pt-8 pb-3 md:pb-4" />
      <PageIntro isLight={isLight} title={<>Examine the <em>Evidence</em></>} description="Now let’s test the thought. Not to prove it wrong, but to see whether it tells the whole story." className="px-5 md:px-8 pt-5 md:pt-6 pb-4 md:pb-5 flex-none" />
      <ChatPanel isLight={isLight} messages={messages} openingThought={reviewData.automatic_thought} input={input} onInputChange={setInput} onSend={() => void sendMessage()} onKeyDown={handleKey} isLoading={isLoading} isComplete={isComplete} error={error} bottomRef={bottomRef} />
      <BottomNav isLight={isLight} onBack={onBack} onNext={() => result && onComplete(result)} nextLabel="RESULT" nextDisabled={!isComplete || !result || !datState} />
    </ReflectionShell>
  )
}
